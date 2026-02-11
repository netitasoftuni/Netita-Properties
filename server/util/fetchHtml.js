const { UpstreamError } = require('./errors');
const { isAllowedHost } = require('./validateImotiUrl');

const DEFAULT_TIMEOUT_MS = 12000;
const MAX_HTML_BYTES = 1_000_000; // 1MB hard cap to avoid holding huge pages in memory
// Some sites (including imoti.net) may do multiple canonicalization/locale redirects.
// Keep a hard cap to avoid infinite loops.
const MAX_REDIRECTS = 10;

async function fetchHtml(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (typeof fetch !== 'function') {
    throw new UpstreamError('Node.js runtime must support global fetch (Node 18+)', {
      code: 'RUNTIME_UNSUPPORTED'
    });
  }

  let current = url;
  const visited = new Set([current]);

  for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          // Many sites return 404/403 to non-browser UAs. Mimic a typical browser.
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'bg-BG,bg;q=0.9,en;q=0.8',
          'cache-control': 'no-cache',
          'pragma': 'no-cache'
        }
      });
    } catch (e) {
      clearTimeout(timeout);
      const msg = e?.name === 'AbortError' ? 'Upstream request timed out' : 'Failed to fetch upstream URL';
      throw new UpstreamError(msg, { code: 'UPSTREAM_FETCH_FAILED' });
    } finally {
      clearTimeout(timeout);
    }

    // Handle redirects manually to avoid SSRF / off-domain hops.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new UpstreamError('Upstream redirect missing Location header', { code: 'UPSTREAM_REDIRECT_FAILED' });
      }

      const next = new URL(location, current);
      if (next.protocol !== 'https:' || !isAllowedHost(next.hostname)) {
        throw new UpstreamError('Upstream redirected to a disallowed host', { code: 'UPSTREAM_REDIRECT_DISALLOWED' });
      }

      const nextUrl = next.toString();
      if (visited.has(nextUrl)) {
        throw new UpstreamError('Upstream redirect loop detected', { code: 'UPSTREAM_REDIRECT_LOOP' });
      }

      visited.add(nextUrl);
      current = nextUrl;
      continue;
    }

    if (!response.ok) {
      throw new UpstreamError(`Upstream responded with ${response.status}`, { code: 'UPSTREAM_BAD_STATUS' });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) {
      throw new UpstreamError('Upstream did not return HTML', { code: 'UPSTREAM_NOT_HTML' });
    }

    // Read with size cap
    const reader = response.body?.getReader?.();
    if (!reader) {
      const text = await response.text();
      return text.slice(0, MAX_HTML_BYTES);
    }

    const chunks = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > MAX_HTML_BYTES) {
        throw new UpstreamError('Upstream HTML too large', { code: 'UPSTREAM_TOO_LARGE' });
      }
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);
    return buffer.toString('utf8');
  }

  throw new UpstreamError('Too many redirects', { code: 'UPSTREAM_TOO_MANY_REDIRECTS' });
}

module.exports = { fetchHtml };
