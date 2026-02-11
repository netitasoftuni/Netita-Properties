const cheerio = require('cheerio');
const { ExtractionError } = require('./errors');

function normalizeSpace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function toNumberLoose(value) {
  const cleaned = String(value || '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '');

  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function pickFirstMatch(text, regex) {
  const m = regex.exec(text);
  if (!m) return null;
  return m;
}

function normalizeCurrencyToken(token) {
  const t = String(token || '').trim().toUpperCase();
  if (!t) return null;
  if (t.includes('BGN') || t.includes('ЛВ')) return 'BGN';
  if (t.includes('EUR') || t.includes('€')) return 'EUR';
  return null;
}

function matchLooksPerM2(text, match) {
  if (!text || !match || typeof match.index !== 'number') return false;
  const start = match.index + String(match[0] || '').length;
  const tail = String(text).slice(start, start + 24).toLowerCase();
  return Boolean(
    tail.match(/\/(?:\s*)(m2|㎡)/i) ||
      tail.match(/\/(?:\s*)м\s*2/i) ||
      tail.match(/\/(?:\s*)м²/i) ||
      tail.match(/\bна\b\s*(кв\.?\s*м|m2|㎡)/i) ||
      tail.match(/\b(кв\.?\s*м|m2|㎡|м²)\b/i)
  );
}

function pickTotalPrice(text) {
  if (!text) return null;
  const s = String(text);

  const labeled = /(Обща\s*цена|Цена)\s*[:\-]?\s*([0-9\s.,]{2,})\s*(€|EUR|лв\.?|BGN)\b/gi;
  let m;
  while ((m = labeled.exec(s))) {
    if (matchLooksPerM2(s, m)) continue;
    const amount = toNumberLoose(m[2]);
    const currency = normalizeCurrencyToken(m[3]);
    if (amount) return { amount, currency };
  }

  const generic = /([0-9\s.,]{4,})\s*(€|EUR|лв\.?|BGN)\b/gi;
  while ((m = generic.exec(s))) {
    if (matchLooksPerM2(s, m)) continue;
    const amount = toNumberLoose(m[1]);
    const currency = normalizeCurrencyToken(m[2]);
    if (amount) return { amount, currency };
  }

  return null;
}

function getMetaContents($, selectors) {
  for (const sel of selectors) {
    const v = normalizeSpace($(sel).attr('content'));
    if (v) return v;
  }
  return null;
}

function parseFromUrl(sourceUrl) {
  if (!sourceUrl) return {};
  let parsed;
  try {
    parsed = new URL(String(sourceUrl));
  } catch {
    return {};
  }

  const parts = parsed.pathname.split('/').filter(Boolean);
  // Example: /bg/obiava/prodava/sofia/suha-reka/ednostaen/6044296
  const idx = parts.findIndex(p => p.toLowerCase() === 'obiava');
  if (idx < 0) return {};

  const city = parts[idx + 2] || null;      // after prodava/naema
  const districtSlug = parts[idx + 3] || null;
  const typeSlug = parts[idx + 4] || null;

  function titleizeSlug(slug) {
    if (!slug) return null;
    return normalizeSpace(String(slug).replace(/-/g, ' ')).replace(/\b\w/g, c => c.toUpperCase());
  }

  function mapTypeSlug(slug) {
    const s = String(slug || '').toLowerCase();
    if (!s) return null;
    if (s.includes('ednostaen') || s.includes('studio')) return 'Studio';
    if (s.includes('dvustaen') || s.includes('tristaen') || s.includes('mnogostaen')) return 'Apartment';
    if (s.includes('kyshta') || s.includes('kushta') || s.includes('house')) return 'House';
    if (s.includes('ofis') || s.includes('office')) return 'Office';
    if (s.includes('garaj') || s.includes('garage')) return 'Garage';
    if (s.includes('penthaus') || s.includes('penthouse') || s.includes('mezonet')) return 'Penthouse';
    return titleizeSlug(slug);
  }

  const district = districtSlug ? titleizeSlug(districtSlug) : null;
  const property_type = typeSlug ? mapTypeSlug(typeSlug) : null;

  return { city, district, property_type };
}

function extractFromJsonLd($) {
  const scripts = $('script[type="application/ld+json"]');
  if (!scripts || scripts.length === 0) return {};

  for (let i = 0; i < scripts.length; i += 1) {
    const raw = scripts.eq(i).contents().text();
    if (!raw) continue;

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }

    const candidates = Array.isArray(json) ? json : [json];
    for (const node of candidates) {
      if (!node || typeof node !== 'object') continue;

      const offers = node.offers || node.Offers || null;
      const offerNode = Array.isArray(offers) ? offers[0] : offers;

      const price = offerNode?.price ?? node.price;
      const priceCurrency = offerNode?.priceCurrency ?? offerNode?.price_currency ?? node.priceCurrency ?? node.price_currency;
      const area = node.floorSize?.value ?? node.floorSize ?? node.area;
      const propertyType = node['@type'] || node.propertyType || node.category;

      const address = node.address || node.location;
      const district =
        (typeof address === 'object' ? (address.addressLocality || address.addressRegion) : null) ||
        (typeof node.address === 'string' ? node.address : null);

      const yearBuilt = node.yearBuilt || node.founded || null;

      const extracted = {
        price: typeof price === 'string' || typeof price === 'number' ? toNumberLoose(price) : null,
        price_currency: typeof priceCurrency === 'string' ? normalizeCurrencyToken(priceCurrency) : null,
        area_m2: typeof area === 'string' || typeof area === 'number' ? toNumberLoose(area) : null,
        property_type: typeof propertyType === 'string' ? normalizeSpace(propertyType) : null,
        district: typeof district === 'string' ? normalizeSpace(district) : null,
        year_built: typeof yearBuilt === 'string' || typeof yearBuilt === 'number' ? Math.trunc(toNumberLoose(yearBuilt) || 0) || null : null
      };

      return extracted;
    }
  }

  return {};
}

function extractMinimalImotiFields(html, { sourceUrl } = {}) {
  if (!html || typeof html !== 'string') {
    throw new ExtractionError('No HTML provided for extraction');
  }

  const $ = cheerio.load(html);

  // URL-derived hints (district/type) for /obiava/ pages
  const fromUrl = parseFromUrl(sourceUrl);

  // Prefer structured sources (JSON-LD), then fallback to regex on page text.
  const jsonLd = extractFromJsonLd($);

  // Meta tags often contain enough information for numeric extraction even when the page is JS-heavy.
  const ogTitle = getMetaContents($, ['meta[property="og:title"]']);
  const ogDesc = getMetaContents($, ['meta[property="og:description"]', 'meta[name="description"]']);
  const metaBlob = normalizeSpace([ogTitle, ogDesc].filter(Boolean).join(' '));

  const bodyText = normalizeSpace($('body').text());

  // Bulgarian labels are common on imoti.net.
  // We only extract numeric/enum-like structured fields; never return descriptions/images.
  const bodyPrice = pickTotalPrice(bodyText);

  const areaMatch =
    pickFirstMatch(bodyText, /(Площ|Квадратура|Обща\s+площ)\s*[:\-]?\s*([0-9\s.,]+)\s*(кв\.?\s*м|m2|㎡)/i) ||
    pickFirstMatch(bodyText, /([0-9\s.,]+)\s*(кв\.?\s*м|m2|㎡)/i);

  const districtMatch = pickFirstMatch(
    bodyText,
    /(Район|Квартал|Кв\.?|Р\-н)\s*[:\-]?\s*([A-Za-zА-Яа-я0-9\s\-]+?)(?=\s(?:Цена|Площ|Квадратура|Етаж|Строителство|Година|Тип|$))/i
  );

  const typeMatch = pickFirstMatch(
    bodyText,
    /(Тип\s*имот|Вид\s*имот|Имот)\s*[:\-]?\s*([A-Za-zА-Яа-я\s\-]+?)(?=\s(?:Цена|Площ|Квадратура|Етаж|Строителство|Година|Район|Квартал|$))/i
  );

  const floorMatch = pickFirstMatch(bodyText, /(Етаж)\s*[:\-]?\s*(\d{1,2})/i);
  const yearMatch =
    pickFirstMatch(bodyText, /(Година\s*на\s*строителство|Година\s*строителство)\s*[:\-]?\s*(\d{4})/i) ||
    pickFirstMatch(bodyText, /(Строителство)\s*[:\-]?\s*(\d{4})/i);

  // Meta-based numeric extraction (only numeric fields)
  const metaPrice = metaBlob ? pickTotalPrice(metaBlob) : null;
  const metaAreaMatch = metaBlob ? pickFirstMatch(metaBlob, /([0-9\s.,]+)\s*(кв\.?\s*м|m2|㎡)\b/i) : null;

  const price =
    jsonLd.price ??
    bodyPrice?.amount ??
    metaPrice?.amount ??
    null;

  const price_currency =
    jsonLd.price_currency ??
    bodyPrice?.currency ??
    metaPrice?.currency ??
    null;

  const area_m2 =
    jsonLd.area_m2 ??
    (areaMatch ? toNumberLoose(areaMatch[2] || areaMatch[1]) : null) ??
    (metaAreaMatch ? toNumberLoose(metaAreaMatch[1]) : null);

  const district =
    jsonLd.district ??
    (districtMatch ? normalizeSpace(districtMatch[2]) : null) ??
    fromUrl.district;

  const property_type =
    jsonLd.property_type ??
    (typeMatch ? normalizeSpace(typeMatch[2]) : null) ??
    fromUrl.property_type;
  const floor = floorMatch ? Math.trunc(toNumberLoose(floorMatch[2]) || 0) || null : null;
  const year_built = jsonLd.year_built ?? (yearMatch ? Math.trunc(toNumberLoose(yearMatch[2]) || 0) || null : null);

  if (!price || !area_m2 || !district || !property_type) {
    throw new ExtractionError('Missing required fields (price, area, district, property type)', {
      code: 'EXTRACTION_INCOMPLETE'
    });
  }

  return {
    price: Math.round(price),
    price_currency,
    area_m2: Number(area_m2),
    district,
    property_type,
    floor,
    year_built
  };
}

module.exports = { extractMinimalImotiFields };
