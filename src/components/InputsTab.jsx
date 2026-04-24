import { PALETTE, EMISSION_FACTORS } from "../data/mockData.js";
import CSVUpload from "./CSVUpload.jsx";
import AuditTrail from "./AuditTrail.jsx";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";
const INTENSITY_BENCHMARK = 0.00045;

export default function InputsTab({ inputs, emissions, totalKg, totalTons, scope2Tons, onUpdate, onCSVData }) {
  const intensity = totalTons > 0 ? (totalTons / inputs.electricity).toFixed(6) : "0.000000";
  const intensityVal = parseFloat(intensity);
  const aboveBenchmark = intensityVal > INTENSITY_BENCHMARK;

  return (
    <div>
      {/* CSV Upload */}
      <CSVUpload onDataParsed={onCSVData} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Manual Input */}
        <div style={{
          background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
          borderRadius: 16, padding: 24,
          transition: "border-color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
        >
          <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Activity Data Input</div>
          <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 24 }}>Adjust values to see emissions update in real-time</div>

          {Object.entries(EMISSION_FACTORS).map(([key, { label, unit, factor, scope }]) => (
            <div key={key} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 5, fontWeight: 600,
                    background: scope === 1 ? "rgba(245,158,11,0.15)" : PALETTE.accentGlow,
                    color: scope === 1 ? PALETTE.scope1 : PALETTE.accent,
                  }}>S{scope}</span>
                  {label}
                </label>
                <span style={{ fontSize: 10, color: PALETTE.textDim }}>× {factor} kg/{unit}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="number"
                  value={inputs[key]}
                  onChange={(e) => onUpdate(key, e.target.value)}
                  style={{
                    flex: 1, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
                    borderRadius: 10, padding: "12px 14px", color: PALETTE.text,
                    fontFamily: font, fontSize: 14, fontWeight: 600, outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = PALETTE.accent)}
                  onBlur={(e) => (e.target.style.borderColor = PALETTE.border)}
                />
                <span style={{ color: PALETTE.textDim, fontSize: 12, minWidth: 50 }}>{unit}</span>
              </div>
              <div style={{ fontSize: 11, color: PALETTE.textMuted, marginTop: 6 }}>
                = {(emissions[key] / 1000).toFixed(2)} tCO₂e
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Audit Trail */}
          <AuditTrail inputs={inputs} emissions={emissions} totalKg={totalKg} />

          {/* Carbon Intensity card */}
          <div style={{
            background: `linear-gradient(135deg, ${PALETTE.card}, rgba(52,211,153,0.05))`,
            border: `1px solid ${PALETTE.borderLight}`, borderRadius: 16, padding: 24,
            transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.accent + "66")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
          >
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: PALETTE.textDim }}>Carbon Intensity</div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 32, marginTop: 8, color: PALETTE.accent }}>
              {intensityVal.toFixed(6)}
            </div>
            <div style={{ color: PALETTE.textMuted, fontSize: 12, marginTop: 4 }}>tCO₂e per kWh consumed</div>

            {/* Benchmark comparison */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: PALETTE.textDim, marginBottom: 8 }}>vs SME Automotive Benchmark (0.000450)</div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: PALETTE.textMuted }}>Current</span>
                  <span style={{ fontSize: 10, color: aboveBenchmark ? PALETTE.danger : PALETTE.accent }}>{intensityVal.toFixed(6)}</span>
                </div>
                <div style={{ height: 8, background: PALETTE.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min((intensityVal / (INTENSITY_BENCHMARK * 2)) * 100, 100).toFixed(1)}%`,
                    height: "100%",
                    background: aboveBenchmark ? PALETTE.danger : PALETTE.accent,
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: PALETTE.textMuted }}>Benchmark</span>
                  <span style={{ fontSize: 10, color: PALETTE.textDim }}>0.000450</span>
                </div>
                <div style={{ height: 8, background: PALETTE.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${((INTENSITY_BENCHMARK / (INTENSITY_BENCHMARK * 2)) * 100).toFixed(1)}%`,
                    height: "100%", background: PALETTE.textDim, borderRadius: 4,
                  }} />
                </div>
              </div>

              <div style={{
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: aboveBenchmark ? "rgba(239,68,68,0.1)" : PALETTE.accentGlow,
                color: aboveBenchmark ? PALETTE.danger : PALETTE.accent,
                marginBottom: 8,
              }}>
                {Math.abs(((intensityVal - INTENSITY_BENCHMARK) / INTENSITY_BENCHMARK) * 100).toFixed(0)}%
                {" "}{aboveBenchmark ? "above" : "below"} benchmark
                {!aboveBenchmark && " — good performance"}
              </div>
              <div style={{ fontSize: 10, color: PALETTE.textDim }}>
                Source: UK DEFRA SME Automotive Sector Average 2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
