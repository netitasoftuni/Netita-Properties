param(
  [string]$BaseUrl = $(if ($env:NETITA_BASE_URL) { $env:NETITA_BASE_URL } else { 'http://localhost:5173' }),
  [string]$ImotiUrl = $(if ($env:IMOTI_TEST_URL) { $env:IMOTI_TEST_URL } else { '' }),
  [switch]$SkipCrud,
  [switch]$SkipImoti
)

$ErrorActionPreference = 'Stop'
$failCount = 0

function Get-HttpErrorDetails($err) {
  $statusCode = $null
  $statusText = $null
  $bodyText = $null

  try {
    # PowerShell 7+: HttpResponseException has .Response
    if ($err.Exception -and $err.Exception.PSObject.Properties.Name -contains 'Response' -and $err.Exception.Response) {
      $resp = $err.Exception.Response
      try { $statusCode = [int]$resp.StatusCode } catch { }
      try { $statusText = [string]$resp.ReasonPhrase } catch { }

      try {
        $bodyText = $resp.Content.ReadAsStringAsync().GetAwaiter().GetResult()
      } catch { }
    }

    # Windows PowerShell 5.1: WebException-like with .Response stream
    if (-not $bodyText -and $err.Exception -and $err.Exception.PSObject.Properties.Name -contains 'Response' -and $err.Exception.Response) {
      $webResp = $err.Exception.Response
      try { $statusCode = [int]$webResp.StatusCode } catch { }
      try { $statusText = [string]$webResp.StatusDescription } catch { }

      try {
        $stream = $webResp.GetResponseStream()
        if ($stream) {
          $reader = New-Object System.IO.StreamReader($stream)
          $bodyText = $reader.ReadToEnd()
        }
      } catch { }
    }
  } catch { }

  $details = @{}
  if ($null -ne $statusCode) { $details.status = $statusCode }
  if (-not [string]::IsNullOrWhiteSpace($statusText)) { $details.statusText = $statusText }
  if (-not [string]::IsNullOrWhiteSpace($bodyText)) { $details.body = $bodyText }

  return $details
}

function Format-HttpError($err) {
  $details = Get-HttpErrorDetails $err
  if ($details.Count -eq 0) {
    return $err.Exception.Message
  }

  $parts = @()
  if ($details.status) {
    if ($details.statusText) { $parts += ("HTTP {0} {1}" -f $details.status, $details.statusText) }
    else { $parts += ("HTTP {0}" -f $details.status) }
  }

  if ($details.body) {
    # keep it readable; response bodies can be large
    $trimmed = $details.body.Trim()
    if ($trimmed.Length -gt 2000) { $trimmed = $trimmed.Substring(0, 2000) + '…' }
    $parts += ("Body: {0}" -f $trimmed)
  }

  return ($parts -join ' | ')
}

function Write-Section([string]$title) {
  Write-Host ''
  Write-Host ('=== ' + $title + ' ===')
}

function Write-Ok([string]$msg) {
  Write-Host ('OK: ' + $msg)
}

function Write-Fail([string]$msg) {
  $script:failCount++
  Write-Host ('FAIL: ' + $msg)properties
}

function Get-BasicAuthHeaders() {
  $user = $env:ADMIN_USER
  $pass = $env:ADMIN_PASS

  if ([string]::IsNullOrWhiteSpace($user) -or [string]::IsNullOrWhiteSpace($pass)) {
    return @{}
  }

  $pair = "$user`:$pass"
  $token = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
  return @{ Authorization = "Basic $token" }
}

function Invoke-Json([string]$method, [string]$url, $body, [hashtable]$headers) {
  if ($null -eq $body) {
    return Invoke-RestMethod -Method $method -Uri $url -Headers $headers
  }

  $json = $body
  if (-not ($body -is [string])) {
    $json = $body | ConvertTo-Json -Depth 10
  }

  return Invoke-RestMethod -Method $method -Uri $url -Headers $headers -ContentType 'application/json' -Body $json
}

function Test-HttpGet([string]$url) {
  try {
    Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Resolve-LocalhostBaseUrl([string]$baseUrl) {
  # If the user already set NETITA_BASE_URL or passed -BaseUrl, respect it unless it's the default localhost:5173.
  $default = 'http://localhost:5173'
  if ($baseUrl -ne $default) {
    return $baseUrl
  }

  # Probe the same range the server uses (starts at 5173 and retries upward).
  foreach ($port in 5173..5183) {
    $candidate = "http://localhost:$port"
    if (Test-HttpGet "$candidate/api/properties") {
      return $candidate
    }
  }

  return $baseUrl
}

Write-Section 'Netita API smoke test'
$BaseUrl = Resolve-LocalhostBaseUrl $BaseUrl
Write-Host ("BaseUrl: {0}" -f $BaseUrl)

if (-not (Test-HttpGet "$BaseUrl/api/properties")) {
  Write-Section 'Server check'
  Write-Fail ("Cannot reach {0}. Start the server first (in another terminal): npm run dev" -f $BaseUrl)
  Write-Host 'Tip: the dev server prints the exact URL (it may be 5174/5175 if 5173 is busy).'
  Write-Host 'You can also set NETITA_BASE_URL (e.g. http://localhost:5174) then rerun: npm run smoke'

  Write-Section 'Summary'
  Write-Host '1 failing check(s).'
  exit 1
}

$authEnabled = -not [string]::IsNullOrWhiteSpace($env:ADMIN_USER) -and -not [string]::IsNullOrWhiteSpace($env:ADMIN_PASS)
$headers = Get-BasicAuthHeaders

if ($authEnabled) {
  if ($headers.Count -eq 0) {
    Write-Fail 'ADMIN_USER/ADMIN_PASS are set, but auth headers were not created.'
  } else {
    Write-Ok 'Admin auth detected (ADMIN_USER/ADMIN_PASS set).'
  }
} else {
  Write-Ok 'Admin auth not enabled (ADMIN_USER/ADMIN_PASS not set).'
}

# --- Public endpoints ---
try {
  Write-Section 'GET /api/properties'
  $properties = Invoke-Json 'GET' ("$BaseUrl/api/properties") $null @{}
  if ($null -eq $properties) {
    Write-Fail 'Expected a JSON array/object; got null.'
  } else {
    $count = 0
    if ($properties -is [System.Array]) { $count = $properties.Length }
    elseif ($properties.PSObject.Properties.Name -contains 'Length') { $count = $properties.Length }
    Write-Ok ("Received properties payload (count-ish: {0})." -f $count)
  }
} catch {
  Write-Fail ("GET /api/properties failed: {0}" -f (Format-HttpError $_))
}

try {
  Write-Section 'GET /api/properties/1'
  $one = Invoke-Json 'GET' ("$BaseUrl/api/properties/1") $null @{}
  if ($null -eq $one) {
    Write-Fail 'Expected a JSON object; got null.'
  } else {
    Write-Ok 'Received property id=1 (or a valid object response).'
  }
} catch {
  Write-Fail ("GET /api/properties/1 failed: {0}" -f (Format-HttpError $_))
}

# --- Auth behavior sanity check ---
if ($authEnabled) {
  try {
    Write-Section 'Auth check: POST /api/properties without creds should be 401'

    $body = @{ address='AuthCheck'; location='AuthCheck'; price=1; bedrooms=0; bathrooms=0; sqft=1; image=''; yearBuilt=2000; type='Apartment'; description='Auth'; amenities=@(); listingDate='2026-01-01' }
    try {
      Invoke-Json 'POST' ("$BaseUrl/api/properties") $body @{} | Out-Null
      Write-Fail 'Expected 401 but request succeeded.'
    } catch {
      $msg = Format-HttpError $_
      if ($msg -match 'HTTP\s*401') {
        Write-Ok 'Unauthorized as expected (401).'
      } else {
        Write-Fail ("Expected 401; got error: {0}" -f $msg)
      }
    }
  } catch {
    Write-Fail ("Auth check failed: {0}" -f (Format-HttpError $_))
  }
}

# --- CRUD (requires auth when enabled) ---
if (-not $SkipCrud) {
  try {
    Write-Section 'CRUD: POST -> PATCH -> DELETE'

    $createBody = @{ 
      address='Smoke Test Address'
      location='Smoke Test District'
      listingType='sale'
      price=12345
      bedrooms=1
      bathrooms=1
      sqft=55
      image='https://via.placeholder.com/300x200?text=Property+Image'
      yearBuilt=2020
      type='Apartment'
      description='Smoke test record'
      amenities=@('Test Amenity')
      listingDate='2026-01-01'
    }

    $created = Invoke-Json 'POST' ("$BaseUrl/api/properties") $createBody $headers
    if ($null -eq $created -or -not $created.id) {
      Write-Fail 'Create did not return an id.'
    } else {
      Write-Ok ("Created id={0}." -f $created.id)
    }

    $patchBody = @{ price = 99999 }
    $updated = Invoke-Json 'PATCH' ("$BaseUrl/api/properties/{0}" -f $created.id) $patchBody $headers
    if ($null -eq $updated -or $updated.price -ne 99999) {
      Write-Fail 'PATCH did not update price to 99999.'
    } else {
      Write-Ok 'Patched price to 99999.'
    }

    $deleted = Invoke-Json 'DELETE' ("$BaseUrl/api/properties/{0}" -f $created.id) $null $headers
    if ($null -eq $deleted) {
      Write-Fail 'DELETE did not return a JSON object.'
    } else {
      Write-Ok 'Deleted created record.'
    }
  } catch {
    Write-Fail ("CRUD flow failed: {0}" -f (Format-HttpError $_))
  }
} else {
  Write-Section 'CRUD'
  Write-Ok 'Skipped (SkipCrud set).'
}

# --- imoti analyze ---
if (-not $SkipImoti) {
  Write-Section 'POST /api/imoti/analyze'
  if ([string]::IsNullOrWhiteSpace($ImotiUrl)) {
    Write-Ok 'Skipped (no ImotiUrl provided). Set IMOTI_TEST_URL or pass -ImotiUrl.'
  } else {
    try {
      $result = Invoke-Json 'POST' ("$BaseUrl/api/imoti/analyze") @{ url = $ImotiUrl } @{}
      if ($null -eq $result) {
        Write-Fail 'Analyze returned null.'
      } else {
        Write-Ok 'Analyze returned JSON (insights payload).'
      }
    } catch {
      Write-Fail ("Analyze failed: {0}" -f (Format-HttpError $_))
    }
  }
} else {
  Write-Section 'POST /api/imoti/analyze'
  Write-Ok 'Skipped (SkipImoti set).'
}

Write-Section 'Summary'
if ($failCount -gt 0) {
  Write-Host ("{0} failing check(s)." -f $failCount)
  exit 1
}

Write-Host 'All checks passed.'
exit 0
