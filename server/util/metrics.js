const fs = require('fs');
const path = require('path');
const { ExtractionError } = require('./errors');

const metricsPath = path.join(__dirname, '..', 'data', 'districtMetrics.json');

function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function loadMetrics() {
  const raw = fs.readFileSync(metricsPath, 'utf8');
  return JSON.parse(raw);
}

let _cache = null;

function getDistrictMetrics(districtName) {
  if (!_cache) _cache = loadMetrics();

  const district = String(districtName || '').trim();
  if (!district) {
    throw new ExtractionError('District is required for metrics lookup', { code: 'DISTRICT_MISSING' });
  }

  const norm = normalizeKey(district);
  const districts = Array.isArray(_cache.districts) ? _cache.districts : [];

  const exact = districts.find(d => normalizeKey(d.name) === norm);
  if (exact) return exact;

  // Loose match: contains either way
  const loose = districts.find(d => {
    const dn = normalizeKey(d.name);
    return norm.includes(dn) || dn.includes(norm);
  });
  if (loose) return loose;

  // Fallback to default metrics to keep the engine working.
  return { name: district, ..._cache.default };
}

module.exports = { getDistrictMetrics };
