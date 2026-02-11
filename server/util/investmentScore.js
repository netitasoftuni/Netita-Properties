function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeTo100(value, { min, max }) {
  if (!Number.isFinite(value)) return 0;
  if (max === min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function typeRentMultiplier(propertyType) {
  const t = String(propertyType || '').toLowerCase();
  if (t.includes('studio')) return 1.1;
  if (t.includes('office')) return 0.9;
  if (t.includes('house')) return 0.95;
  return 1.0; // apartment/other
}

function computeInvestmentScore({ price, area_m2, districtMetrics, property_type, priceAnalysis }) {
  const avgRentPerM2 = Number(districtMetrics?.avg_rent_per_m2) || 10;
  const growth = Number(districtMetrics?.growth_pct_yoy) || 0;
  const demand = Number(districtMetrics?.demand_index) || 50;
  const liquidity = Number(districtMetrics?.liquidity_index) || 50;

  const estMonthlyRent = avgRentPerM2 * area_m2 * typeRentMultiplier(property_type);
  const grossYield = ((estMonthlyRent * 12) / price) * 100;

  // Favor undervalued (negative deviation) a bit.
  const deviation = Number(priceAnalysis?.deviation_pct);
  const priceEdge = Number.isFinite(deviation) ? -deviation : 0; // positive when below avg

  const yieldScore = normalizeTo100(grossYield, { min: 2, max: 8 });
  const growthScore = normalizeTo100(growth, { min: 0, max: 8 });
  const demandScore = clamp(demand, 0, 100);
  const liquidityScore = clamp(liquidity, 0, 100);
  const priceEdgeScore = normalizeTo100(priceEdge, { min: -10, max: 20 });

  // Weighted sum (must stay explainable and stable)
  const score =
    yieldScore * 0.35 +
    demandScore * 0.20 +
    liquidityScore * 0.20 +
    growthScore * 0.15 +
    priceEdgeScore * 0.10;

  return Math.round(clamp(score, 0, 100));
}

module.exports = { computeInvestmentScore };
