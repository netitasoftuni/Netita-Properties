const { ValidationError } = require('./errors');

function isAllowedHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return host === 'imoti.net' || host.endsWith('.imoti.net');
}

function validateImotiUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required', { code: 'INVALID_URL' });
  }

  // Reject placeholder URLs like "https://www.imoti.net/..."
  const trimmed = url.trim();
  if (trimmed.includes('...') || trimmed.includes('…')) {
    throw new ValidationError('Please paste the full imoti.net listing URL (no "...").', { code: 'INVALID_URL' });
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ValidationError('Invalid URL format', { code: 'INVALID_URL' });
  }

  if (parsed.protocol !== 'https:') {
    throw new ValidationError('Only https URLs are allowed', { code: 'INVALID_URL' });
  }

  if (!isAllowedHost(parsed.hostname)) {
    throw new ValidationError('Only imoti.net URLs are allowed', { code: 'INVALID_URL' });
  }

  if (parsed.username || parsed.password) {
    throw new ValidationError('Credentials in URL are not allowed', { code: 'INVALID_URL' });
  }

  // Normalize by stripping hash fragments
  parsed.hash = '';

  // Require a specific listing URL (not the homepage).
  // This avoids attempting extraction on pages that don't contain property details.
  const path = parsed.pathname || '/';
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  const isHomepage = normalizedPath === '/' || normalizedPath === '';
  const isLocaleLanding = /^\/(bg|en|ru)(\/.*)?$/i.test(normalizedPath) && !/\/obiav/i.test(normalizedPath);
  const isSearchResults = /\/obiavi\//i.test(normalizedPath); // plural -> list/search page
  const isSingleAd = /\/obiava\//i.test(normalizedPath); // singular -> ad details page
  if (isHomepage) {
    throw new ValidationError('Please paste a specific imoti.net listing URL (not the homepage).', {
      code: 'INVALID_URL'
    });
  }

  if (isLocaleLanding) {
    throw new ValidationError('Please paste a specific imoti.net property listing URL (a single ad page), not a language landing/search page like /bg.', {
      code: 'INVALID_URL'
    });
  }

  if (isSearchResults && !isSingleAd) {
    throw new ValidationError('This looks like an imoti.net search/results page (/obiavi/). Please open a single property ad (details page) and paste that URL.', {
      code: 'INVALID_URL'
    });
  }

  return parsed.toString();
}

module.exports = { validateImotiUrl, isAllowedHost };
