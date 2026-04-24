import { PALETTE } from "../data/mockData.js";

const font = "'JetBrains Mono', monospace";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = [2024, 2025, 2026];
const FACILITIES = ["All Facilities", "Plant A – Detroit", "Plant B – Chicago", "Plant C – Toledo"];
const SCENARIOS = ["Baseline", "Optimized", "High Production"];

const selectStyle = {
  background: PALETTE.bg,
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 8,
  padding: "8px 12px",
  color: PALETTE.text,
  fontFamily: font,
  fontSize: 12,
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  paddingRight: 28,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a6b58' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
};

export default function FilterBar({ filters, onChange }) {
  const handleChange = (key, val) => onChange({ ...filters, [key]: val });

  const onFocus = (e) => (e.target.style.borderColor = PALETTE.accent);
  const onBlur = (e) => (e.target.style.borderColor = PALETTE.border);

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 14,
      padding: "14px 20px",
      marginBottom: 20,
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      alignItems: "center",
    }}>
      <span style={{ fontSize: 10, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
        Filters
      </span>

      {[
        { label: "Month", key: "month", options: MONTHS },
        { label: "Year", key: "year", options: YEARS },
        { label: "Facility", key: "facility", options: FACILITIES },
        { label: "Scenario", key: "scenario", options: SCENARIOS },
      ].map(({ label, key, options }) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 10, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
          <div style={{ position: "relative" }}>
            <select
              value={filters[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              style={selectStyle}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: PALETTE.accent, boxShadow: `0 0 6px ${PALETTE.accent}` }} />
        <span style={{ fontSize: 10, color: PALETTE.textMuted }}>
          {filters.facility !== "All Facilities" ? filters.facility : filters.scenario !== "Baseline" ? filters.scenario + " scenario" : "All data"} · {filters.month} {filters.year}
        </span>
      </div>
    </div>
  );
}
