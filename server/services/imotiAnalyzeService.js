const { validateImotiUrl } = require('../util/validateImotiUrl');
const { fetchHtml } = require('../util/fetchHtml');
const { extractMinimalImotiFields } = require('../util/extractImoti');
const { getDistrictMetrics } = require('../util/metrics');
const { computePriceAnalysis } = require('../util/priceAnalysis');
const { computeInvestmentScore } = require('../util/investmentScore');
const { generateAreaInsights } = require('../util/areaInsights');

function normalizePriceToEur(price, currency) {
  const amount = typeof price === 'number' ? price : Number(price);
  if (!Number.isFinite(amount)) return null;

  const c = String(currency || '').toUpperCase();
  if (c === 'BGN') {
    // Bulgarian lev is pegged: 1 EUR = 1.95583 BGN
    return Math.round(amount / 1.95583);
  }

  return Math.round(amount);
}

async function analyzeImotiUrl({ url }) {
  const normalizedUrl = validateImotiUrl(url);

  const html = await fetchHtml(normalizedUrl);

  const extracted = extractMinimalImotiFields(html, { sourceUrl: normalizedUrl });
  // Ensure we do not retain full HTML beyond this point.

  const priceEur = normalizePriceToEur(extracted.price, extracted.price_currency) ?? extracted.price;

  const districtMetrics = getDistrictMetrics(extracted.district);

  const priceAnalysis = computePriceAnalysis({
    price: priceEur,
    area_m2: extracted.area_m2,
    district: extracted.district,
    districtMetrics
  });

  const investmentScore = computeInvestmentScore({
    price: priceEur,
    area_m2: extracted.area_m2,
    district: extracted.district,
    property_type: extracted.property_type,
    districtMetrics,
    priceAnalysis
  });

  const areaInsights = generateAreaInsights({
    district: extracted.district,
    districtMetrics
  });

  return {
    price_analysis: priceAnalysis,
    investment_score: investmentScore,
    area_insights: areaInsights
  };
}

module.exports = { analyzeImotiUrl };
