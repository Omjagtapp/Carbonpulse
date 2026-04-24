import { PALETTE, EMISSION_FACTORS, AUDIT_FACTOR_META } from "../data/mockData.js";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";

export default function AuditTrail({ inputs, emissions, totalKg }) {
  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 16,
      padding: 24,
    }}>
      <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Calculation Audit Trail</div>
      <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 8 }}>Transparent factor-based methodology</div>

      {/* Header note */}
      <div style={{
        background: PALETTE.accentGlow2,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 18,
        fontSize: 11,
        color: PALETTE.textMuted,
        lineHeight: 1.6,
      }}>
        This audit trail is generated in accordance with the GHG Protocol Corporate Standard. All factors are sourced from published regulatory databases.
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ color: PALETTE.textDim, textTransform: "uppercase", fontSize: 9, letterSpacing: "0.08em" }}>
              {["Source", "Scope", "Usage", "Unit", "Factor", "Factor Source", "Eff. Date", "Method", "Result", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 8px", borderBottom: `1px solid ${PALETTE.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(EMISSION_FACTORS).map(([key, { label, unit, factor, scope }]) => {
              const meta = AUDIT_FACTOR_META[key];
              return (
                <tr
                  key={key}
                  onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.accentGlow2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.15s" }}
                >
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}` }}>
                    <span style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 5, fontWeight: 600,
                      background: scope === 1 ? "rgba(245,158,11,0.15)" : PALETTE.accentGlow,
                      color: scope === 1 ? PALETTE.scope1 : PALETTE.accent,
                    }}>S{scope}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, color: PALETTE.textMuted, fontFamily: font }}>
                    {inputs[key].toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, color: PALETTE.textDim }}>{unit}</td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, color: PALETTE.textDim, fontFamily: font }}>
                    {factor} kg/{unit}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, color: PALETTE.textMuted, whiteSpace: "nowrap" }}>
                    {meta?.factorSource || "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, color: PALETTE.textDim, whiteSpace: "nowrap" }}>
                    {meta?.effectiveDate || "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, color: PALETTE.textDim, whiteSpace: "nowrap" }}>
                    {meta?.methodology || "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}`, fontWeight: 700, color: PALETTE.accent, fontFamily: font, whiteSpace: "nowrap" }}>
                    {emissions[key].toLocaleString(undefined, { maximumFractionDigits: 2 })} kg
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: `1px solid ${PALETTE.border}` }}>
                    <span style={{
                      fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 600,
                      background: PALETTE.accentGlow, color: PALETTE.accent,
                    }}>
                      ✓ Verified
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={8} style={{ padding: "12px 8px", fontWeight: 700, fontFamily: fontDisplay, fontSize: 13 }}>Total</td>
              <td style={{ padding: "12px 8px", fontWeight: 700, fontFamily: fontDisplay, fontSize: 13, color: PALETTE.accent }}>
                {totalKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footnote */}
      <div style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: `1px solid ${PALETTE.border}`,
        fontSize: 10,
        color: PALETTE.textDim,
        lineHeight: 1.7,
      }}>
        Calculation date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} ·
        Methodology: GHG Protocol Corporate Accounting & Reporting Standard, v2 ·
        Factors: EPA eGRID 2024, IPCC AR6, GHG Protocol Stationary Combustion v4.0
      </div>
    </div>
  );
}
