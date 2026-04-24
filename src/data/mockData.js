// MOCK: replace with API calls to your backend data service

export const EMISSION_FACTORS = {
  electricity: { factor: 0.4, unit: "kWh", label: "Electricity", scope: 2 },
  naturalGas: { factor: 5.3, unit: "therms", label: "Natural Gas", scope: 1 },
  diesel: { factor: 10.2, unit: "gallons", label: "Diesel", scope: 1 },
};

export const PALETTE = {
  bg: "#0a0f0d",
  card: "#111916",
  cardHover: "#162019",
  border: "#1e2e25",
  borderLight: "#2a4035",
  accent: "#34d399",
  accentDim: "#10b981",
  accentGlow: "rgba(52,211,153,0.15)",
  accentGlow2: "rgba(52,211,153,0.06)",
  text: "#e8f0ec",
  textMuted: "#7a9988",
  textDim: "#4a6b58",
  scope1: "#f59e0b",
  scope2: "#34d399",
  danger: "#ef4444",
  amber: "#f59e0b",
};

// MOCK: historical emissions data — replace with API
export const MONTHS_HISTORY = [
  { month: "Oct", tons: 61.2 },
  { month: "Nov", tons: 58.7 },
  { month: "Dec", tons: 55.3 },
  { month: "Jan", tons: 52.4 },
  { month: "Feb", tons: 55.1 },
];

// MOCK: facility multipliers — replace with real facility config
export const FACILITY_MULTIPLIERS = {
  "All Facilities": 1.0,
  "Plant A – Detroit": 1.0,
  "Plant B – Chicago": 1.15,
  "Plant C – Toledo": 0.9,
};

// MOCK: scenario multipliers — replace with real scenario modeling
export const SCENARIO_MULTIPLIERS = {
  Baseline: 1.0,
  Optimized: 0.85,
  "High Production": 1.2,
};

// MOCK: audit trail factor metadata — replace with live factor registry
export const AUDIT_FACTOR_META = {
  electricity: {
    factorSource: "EPA eGRID 2024",
    effectiveDate: "Jan 2024",
    methodology: "Location-based",
  },
  naturalGas: {
    factorSource: "GHG Protocol v2",
    effectiveDate: "Jan 2024",
    methodology: "Tier 2",
  },
  diesel: {
    factorSource: "IPCC AR6",
    effectiveDate: "Jan 2024",
    methodology: "Market-based",
  },
};

// MOCK: carbon benchmark data — replace with sector benchmark API
export const CARBON_INTENSITY_BENCHMARK = {
  value: 0.00045,
  label: "SME Automotive",
  source: "UK DEFRA SME Automotive Sector Average 2024",
};

// MOCK: expected CSV units per source — replace with configurable schema
export const EXPECTED_UNITS = {
  electricity: ["kWh", "kwh", "KWH"],
  naturalGas: ["therms", "therm", "Therms"],
  diesel: ["gallons", "gallon", "Gallons", "gal"],
};

export const KNOWN_SOURCES = ["electricity", "naturalGas", "diesel", "natural_gas", "natural gas"];
