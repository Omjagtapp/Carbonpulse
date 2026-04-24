// Emission calculation utilities
// MOCK: factors are hardcoded — replace with dynamic factor API

import { EMISSION_FACTORS } from "../data/mockData.js";

/**
 * Calculate raw emissions from activity inputs.
 * Returns { emissions, scope1, scope2, totalKg, totalTons, scope1Tons, scope2Tons }
 */
export function calculateEmissions(inputs, multiplier = 1.0) {
  const emissions = {};
  let scope1 = 0;
  let scope2 = 0;

  Object.entries(EMISSION_FACTORS).forEach(([key, { factor, scope }]) => {
    const baseKg = inputs[key] * factor;
    const kg = baseKg * multiplier;
    emissions[key] = kg;
    if (scope === 1) scope1 += kg;
    else scope2 += kg;
  });

  const totalKg = scope1 + scope2;
  const totalTons = totalKg / 1000;
  const scope1Tons = scope1 / 1000;
  const scope2Tons = scope2 / 1000;

  return { emissions, scope1, scope2, totalKg, totalTons, scope1Tons, scope2Tons };
}

/**
 * Calculate carbon intensity: totalTons / electricity kWh
 */
export function calcIntensity(totalTons, electricityKwh) {
  if (!electricityKwh) return "0.0000";
  return (totalTons / electricityKwh).toFixed(6);
}

/**
 * Build pie chart data from emissions object
 */
export function buildPieData(emissions, totalKg) {
  return Object.entries(EMISSION_FACTORS).map(([key, { label }]) => ({
    key,
    name: label,
    value: emissions[key],
    pct: totalKg > 0 ? ((emissions[key] / totalKg) * 100).toFixed(1) : "0.0",
  }));
}

/**
 * Build quarterly trend data from monthly trend data
 */
export function buildQuarterlyData(trendData) {
  // Group every 3 months into quarters
  const quarters = [];
  for (let i = 0; i < trendData.length; i += 3) {
    const slice = trendData.slice(i, i + 3);
    const avg = slice.reduce((s, d) => s + d.tons, 0) / slice.length;
    const label = `Q${Math.floor(i / 3) + 1}`;
    quarters.push({ month: label, tons: parseFloat(avg.toFixed(2)) });
  }
  // If remaining months don't form a full quarter, still include them
  return quarters;
}

/**
 * Generate dynamic insights from calculated values
 */
export function generateInsights(emissions, totalKg, totalTons, scope2Tons, momChange, prevMonthName, intensity, benchmark) {
  if (totalKg === 0) return [];

  const electricityPct = ((emissions.electricity / totalKg) * 100).toFixed(0);
  const scope2Pct = totalTons > 0 ? ((scope2Tons / totalTons) * 100).toFixed(0) : 0;
  const elecSavingTons = (totalTons * 0.15 * (emissions.electricity / totalKg)).toFixed(2);
  const creditSaving = Math.ceil(parseFloat(elecSavingTons));
  const creditSavingLow = creditSaving * 10;
  const creditSavingHigh = creditSaving * 15;

  const benchmarkVal = parseFloat(benchmark.value);
  const intensityVal = parseFloat(intensity);
  const diffPct = benchmarkVal > 0 ? (((intensityVal - benchmarkVal) / benchmarkVal) * 100).toFixed(0) : 0;
  const aboveBenchmark = intensityVal > benchmarkVal;

  const insights = [
    {
      color: "#ef4444",
      title: `Electricity accounts for ${electricityPct}% of total emissions — the dominant source this period.`,
      action: "Consider switching to renewable energy tariffs or on-site solar to reduce this share.",
    },
    {
      color: momChange > 0 ? "#ef4444" : "#34d399",
      title: `Emissions ${momChange > 0 ? "increased" : "decreased"} by ${Math.abs(momChange).toFixed(1)}% compared to ${prevMonthName}.`,
      action: momChange > 0
        ? "Review electricity procurement contracts and shift heavy loads to off-peak hours."
        : "Continue current efficiency measures — trajectory is on track.",
    },
    {
      color: "#f59e0b",
      title: `Scope 2 emissions (${scope2Tons.toFixed(2)} tCO₂e) represent ${scope2Pct}% of total.`,
      action: "Switching to renewable energy contracts (RECs or PPAs) could eliminate Scope 2 entirely.",
    },
    {
      color: "#34d399",
      title: `Reducing electricity consumption by 15% would save approximately ${elecSavingTons} tCO₂e and ${creditSaving} carbon credits.`,
      action: `Estimated cost saving: $${creditSavingLow.toLocaleString()}–$${creditSavingHigh.toLocaleString()} at current market rates.`,
    },
    {
      color: aboveBenchmark ? "#ef4444" : "#34d399",
      title: `Carbon intensity is ${intensityVal.toFixed(6)} tCO₂e/kWh — ${Math.abs(diffPct)}% ${aboveBenchmark ? "above" : "below"} the SME automotive benchmark of 0.000450.`,
      action: aboveBenchmark
        ? "Intensity reduction is needed. Target operational efficiency improvements in Q2."
        : "Good performance. Maintain current efficiency standards and document for reporting.",
    },
  ];

  return insights;
}

/**
 * Apply scenario sliders to baseline emissions
 * elecReduction: 0–50 (%)
 * gasReduction: 0–50 (%)
 * renewableSwitch: 0–50 (%) of electricity Scope 2 eliminated
 */
export function applyScenario(totalTons, scope1Tons, scope2Tons, elecShare, elecReduction, gasReduction, renewableSwitch) {
  const elecBaseEmissions = totalTons * elecShare;
  const gasBaseEmissions = scope1Tons * 0.9; // approximate

  const elecSaved = elecBaseEmissions * (elecReduction / 100);
  const gasSaved = gasBaseEmissions * (gasReduction / 100);
  const renewableSaved = scope2Tons * (renewableSwitch / 100);

  const scenarioTons = Math.max(0, totalTons - elecSaved - gasSaved - renewableSaved);
  const reductionTons = totalTons - scenarioTons;
  const reductionPct = totalTons > 0 ? ((reductionTons / totalTons) * 100).toFixed(1) : 0;

  return { scenarioTons, reductionTons, reductionPct };
}
