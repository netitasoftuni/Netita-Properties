function round2(n) {
  return Math.round(n * 100) / 100;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computePriceAnalysis({ price, area_m2, district, districtMetrics }) {
  const pricePerM2 = price / area_m2;
  const districtAvg = Number(districtMetrics?.avg_price_per_m2) || pricePerM2;

  const deviationPct = ((pricePerM2 - districtAvg) / districtAvg) * 100;

  let classification = 'Fair';
  if (deviationPct <= -8) classification = 'Undervalued';
  else if (deviationPct >= 8) classification = 'Overpriced';

  const explanation =
    `Based on an estimated district average of ${Math.round(districtAvg)} €/m² in ${district}, ` +
    `this listing is ${Math.abs(round2(deviationPct))}% ${deviationPct < 0 ? 'below' : 'above'} the benchmark.`;

  return {
    price_per_m2: Math.round(pricePerM2),
    district_avg_price_per_m2: Math.round(districtAvg),
    deviation_pct: round2(deviationPct),
    classification,
    explanation
  };
}

module.exports = { computePriceAnalysis };
