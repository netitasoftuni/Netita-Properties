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

function computePropertiesAnalytics(properties) {
  const list = Array.isArray(properties) ? properties : [];

  const prices = [];
  const sqfts = [];
  const pricePerSqft = [];

  list.forEach((p) => {
    const price = finiteNumber(p && p.price);
    const sqft = finiteNumber(p && p.sqft);

    if (price !== null) prices.push(price);
    if (sqft !== null) sqfts.push(sqft);

    if (price !== null && sqft !== null && sqft > 0) {
      pricePerSqft.push(price / sqft);
    }
  });

  return {
    count: list.length,

    avgPrice: average(prices),
    medianPrice: median(prices),

    avgSqft: average(sqfts),

    avgPricePerSqft: average(pricePerSqft)
  };
}

module.exports = {
  computePropertiesAnalytics
};
