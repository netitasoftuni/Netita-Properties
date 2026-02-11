function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function generateAreaInsights({ district, districtMetrics }) {
  const avgPrice = Math.round(Number(districtMetrics?.avg_price_per_m2) || 0);
  const avgRent = Math.round(Number(districtMetrics?.avg_rent_per_m2) || 0);
  const growth = Number(districtMetrics?.growth_pct_yoy) || 0;
  const demand = clamp(Number(districtMetrics?.demand_index) || 50, 0, 100);
  const liquidity = clamp(Number(districtMetrics?.liquidity_index) || 50, 0, 100);

  const demandLabel = demand >= 75 ? 'high' : demand >= 55 ? 'steady' : 'mixed';
  const liquidityLabel = liquidity >= 75 ? 'high' : liquidity >= 55 ? 'moderate' : 'lower';

  return (
    `${district} shows ${demandLabel} demand with ${liquidityLabel} liquidity. ` +
    `Typical pricing is around ${avgPrice} €/m², with average rents near ${avgRent} €/m². ` +
    `Recent growth is approximately ${growth.toFixed(1)}% YoY.`
  );
}

module.exports = { generateAreaInsights };
