'use strict';

function median(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sum = values.reduce((acc, n) => acc + n, 0);
  return sum / values.length;
}

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function computeStats(list) {
  const prices = [];
  const sqfts = [];
  const pricePerSqft = [];

  (Array.isArray(list) ? list : []).forEach((p) => {
    const price = finiteNumber(p && p.price);
    const sqft = finiteNumber(p && p.sqft);

    if (price !== null) prices.push(price);
    if (sqft !== null) sqfts.push(sqft);
    if (price !== null && sqft !== null && sqft > 0) pricePerSqft.push(price / sqft);
  });

  return {
    count: Array.isArray(list) ? list.length : 0,
    avgPrice: average(prices),
    medianPrice: median(prices),
    avgSqft: average(sqfts),
    avgPricePerSqft: average(pricePerSqft)
  };
}

function normalizeListingType(value) {
  const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (v === 'sale' || v === 'rent' || v === 'rent_per_day') return v;
  return 'sale';
}

function computePropertiesAnalytics(properties) {
  const list = Array.isArray(properties) ? properties : [];

  const sale = [];
  const rent = [];
  const rentPerDay = [];

  list.forEach((p) => {
    const t = normalizeListingType(p && p.listingType);
    if (t === 'rent') rent.push(p);
    else if (t === 'rent_per_day') rentPerDay.push(p);
    else sale.push(p);
  });

  return {
    byListingType: {
      sale: computeStats(sale),
      rent: computeStats(rent),
      rent_per_day: computeStats(rentPerDay)
    }
  };
}

module.exports = {
  computePropertiesAnalytics
};
