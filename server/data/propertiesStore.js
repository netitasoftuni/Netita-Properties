const fs = require('fs/promises');
const path = require('path');

const storePath = path.join(__dirname, 'properties.json');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

async function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.tmp`);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tmpPath, json, 'utf8');
  await fs.rename(tmpPath, filePath);
}

async function loadSeedProperties() {
  // Seed comes from the existing dataset file used in the frontend demo.
  // eslint-disable-next-line global-require
  const seed = require('../../data/properties');
  return Array.isArray(seed) ? seed : [];
}

async function ensureStoreInitialized() {
  const exists = await fileExists(storePath);
  if (exists) return;

  const seed = await loadSeedProperties();
  await atomicWriteJson(storePath, seed);
}

async function readAll() {
  await ensureStoreInitialized();
  const raw = await fs.readFile(storePath, 'utf8');
  const data = JSON.parse(raw);
  const list = Array.isArray(data) ? data : [];

  // Keep API responses resilient even if the JSON file is manually edited.
  // Do not auto-write defaults back to disk here; just normalize the returned shape.
  return list.map((item) => normalizeStoredProperty(item));
}

async function writeAll(list) {
  await ensureStoreInitialized();
  await atomicWriteJson(storePath, list);
}

function nextId(list) {
  const max = list.reduce((acc, item) => {
    const id = Number(item && item.id);
    return Number.isFinite(id) && id > acc ? id : acc;
  }, 0);
  return max + 1;
}

function normalizeNumber(value, { allowFloat = false } = {}) {
  if (value === null || value === undefined || value === '') return null;
  const n = allowFloat ? Number(value) : parseInt(value, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

function validateCreate(payload) {
  const errors = [];
  const address = typeof payload?.address === 'string' ? payload.address.trim() : '';
  const location = typeof payload?.location === 'string' ? payload.location.trim() : '';
  const type = typeof payload?.type === 'string' ? payload.type.trim() : '';

  const price = normalizeNumber(payload?.price, { allowFloat: true });
  const bedrooms = normalizeNumber(payload?.bedrooms);
  const bathrooms = normalizeNumber(payload?.bathrooms, { allowFloat: true });
  const sqft = normalizeNumber(payload?.sqft, { allowFloat: true });

  if (!address) errors.push('address is required');
  if (!location) errors.push('location is required');
  if (price === null) errors.push('price must be a number');
  if (bedrooms === null) errors.push('bedrooms must be a number');
  if (bathrooms === null) errors.push('bathrooms must be a number');
  if (sqft === null) errors.push('sqft must be a number');

  const image = typeof payload?.image === 'string' ? payload.image.trim() : '';
  if (!image) errors.push('image is required');

  const images = Array.isArray(payload?.images)
    ? payload.images.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
    : [];

  const amenities = Array.isArray(payload?.amenities)
    ? payload.amenities.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
    : [];

  const listingDate = typeof payload?.listingDate === 'string' ? payload.listingDate.trim() : '';

  return {
    ok: errors.length === 0,
    errors,
    value: {
      address,
      location,
      price,
      bedrooms,
      bathrooms,
      sqft,
      image,
      images,
      yearBuilt: normalizeNumber(payload?.yearBuilt),
      type,
      description: typeof payload?.description === 'string' ? payload.description.trim() : '',
      amenities,
      listingDate
    }
  };
}

function applyPatch(existing, patch) {
  const updated = { ...existing };

  const stringFields = ['address', 'location', 'image', 'type', 'description', 'listingDate'];
  stringFields.forEach((f) => {
    if (patch && Object.prototype.hasOwnProperty.call(patch, f)) {
      const v = patch[f];
      updated[f] = typeof v === 'string' ? v.trim() : v;
    }
  });

  const numFields = [
    ['price', true],
    ['bedrooms', false],
    ['bathrooms', true],
    ['sqft', true],
    ['yearBuilt', false]
  ];

  numFields.forEach(([field, allowFloat]) => {
    if (patch && Object.prototype.hasOwnProperty.call(patch, field)) {
      const n = normalizeNumber(patch[field], { allowFloat });
      if (n !== null) updated[field] = n;
    }
  });

  if (patch && Object.prototype.hasOwnProperty.call(patch, 'images')) {
    updated.images = Array.isArray(patch.images)
      ? patch.images.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
      : [];
  }

  if (patch && Object.prototype.hasOwnProperty.call(patch, 'amenities')) {
    updated.amenities = Array.isArray(patch.amenities)
      ? patch.amenities.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
      : [];
  }

  return updated;
}

function normalizeStoredProperty(item) {
  const safe = item && typeof item === 'object' ? { ...item } : {};

  // Strings
  const stringFields = ['address', 'location', 'image', 'type', 'description', 'listingDate'];
  stringFields.forEach((f) => {
    if (typeof safe[f] === 'string') safe[f] = safe[f].trim();
    else if (safe[f] === undefined || safe[f] === null) safe[f] = '';
  });

  // Arrays
  safe.images = Array.isArray(safe.images)
    ? safe.images.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
    : [];

  safe.amenities = Array.isArray(safe.amenities)
    ? safe.amenities.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
    : [];

  // Numbers: keep as-is if already numeric; otherwise coerce when possible.
  const numFields = [
    ['id', false],
    ['price', true],
    ['bedrooms', false],
    ['bathrooms', true],
    ['sqft', true],
    ['yearBuilt', false]
  ];

  numFields.forEach(([field, allowFloat]) => {
    if (!Object.prototype.hasOwnProperty.call(safe, field)) return;
    const n = normalizeNumber(safe[field], { allowFloat });
    if (n !== null) safe[field] = n;
  });

  return safe;
}

module.exports = {
  storePath,
  ensureStoreInitialized,
  readAll,
  writeAll,
  nextId,
  validateCreate,
  applyPatch
};
