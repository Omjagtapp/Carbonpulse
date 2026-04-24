import { useState } from "react";
import { PALETTE } from "../data/mockData.js";
import ScenarioTool from "./ScenarioTool.jsx";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";

const COVERAGE_OPTIONS = [25, 50, 75, 100];

export default function OffsetsTab({ totalTons, scope1Tons, scope2Tons, electricityShare, creditsNeeded, onExportPDF, onExportCSV, onExportGHG, onExportClipboard, exportStates }) {
  const [coverage, setCoverage] = useState(100);
  const [marketType, setMarketType] = useState("VCM"); // 'VCM' | 'ETS'

  const priceLow = marketType === "VCM" ? 10 : 45;
  const priceHigh = marketType === "VCM" ? 15 : 65;

  const coveredCredits = Math.ceil(creditsNeeded * (coverage / 100));
  const uncoveredCredits = creditsNeeded - coveredCredits;
  const costLow = coveredCredits * priceLow;
  const costHigh = coveredCredits * priceHigh;

  const coveredPct = creditsNeeded > 0 ? (coveredCredits / creditsNeeded) * 100 : 0;

  const exportButtons = [
    {
      key: "pdf",
      label: "Full Report",
      sub: "Scope 1 & 2 summary, methodology, calculations",
      onClick: onExportPDF,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="2" width="12" height="16" rx="2" stroke={PALETTE.accent} strokeWidth="1.5" />
          <path d="M8 6h8M8 10h8M8 14h5" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 2v4h4" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: "csv",
      label: "Raw Data (CSV)",
      sub: "Activity data with emission factors applied",
      onClick: onExportCSV,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke={PALETTE.accent} strokeWidth="1.5" />
          <path d="M3 9h18M9 9v10M15 9v10" stroke={PALETTE.accent} strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      key: "ghg",
      label: "GHG Protocol Template",
      sub: "Pre-filled corporate standard worksheet",
      onClick: onExportGHG,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.5 3.8 10 8 11 4.2-1 8-5.5 8-11V6l-8-4z" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: "clipboard",
      label: "Copy Summary",
      sub: "Plain-text summary for email or docs",
      onClick: onExportClipboard,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="8" y="4" width="12" height="16" rx="2" stroke={PALETTE.accent} strokeWidth="1.5" />
          <path d="M8 8H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 8h4M12 12h4M12 16h2" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Credit Estimator */}
        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Carbon Credit Estimator</div>
          <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 20 }}>Voluntary offset purchase planning</div>

          {/* Coverage selector */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Coverage Target</div>
            <div style={{ display: "flex", gap: 8 }}>
              {COVERAGE_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => setCoverage(pct)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    fontFamily: font, cursor: "pointer", border: "none",
                    background: coverage === pct ? PALETTE.accent : PALETTE.accentGlow2,
                    color: coverage === pct ? PALETTE.bg : PALETTE.textMuted,
                    transition: "all 0.2s",
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Market type toggle */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Market Type</div>
            <div style={{ display: "flex", background: PALETTE.bg, borderRadius: 10, padding: 3, border: `1px solid ${PALETTE.border}` }}>
              {[
                { key: "VCM", label: "Voluntary (VCM)", sub: "$10–$15" },
                { key: "ETS", label: "Compliance (ETS)", sub: "$45–$65" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMarketType(m.key)}
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                    fontFamily: font, cursor: "pointer", border: "none",
                    background: marketType === m.key ? PALETTE.accent : "transparent",
                    color: marketType === m.key ? PALETTE.bg : PALETTE.textMuted,
                    transition: "all 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                  }}
                >
                  <span>{m.label}</span>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{m.sub}/credit</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coverage bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, color: PALETTE.textDim }}>
              <span>Emissions covered</span>
              <span>Uncovered</span>
            </div>
            <div style={{ height: 12, background: PALETTE.border, borderRadius: 6, overflow: "hidden", display: "flex" }}>
              <div style={{
                width: `${coveredPct.toFixed(1)}%`,
                background: `linear-gradient(90deg, ${PALETTE.accent}, ${PALETTE.accentDim})`,
                borderRadius: "6px 0 0 6px",
                transition: "width 0.4s ease",
              }} />
              <div style={{
                flex: 1,
                background: PALETTE.danger + "44",
                borderRadius: "0 6px 6px 0",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10 }}>
              <span style={{ color: PALETTE.accent }}>{coveredCredits} credits ({coverage}%)</span>
              <span style={{ color: PALETTE.danger }}>{uncoveredCredits} credits uncovered</span>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Credits Required", val: `${creditsNeeded}`, unit: "total", desc: "1 credit = 1 tCO₂e" },
              { label: "Credits to Purchase", val: `${coveredCredits}`, unit: `${coverage}% coverage`, desc: `${uncoveredCredits} remaining` },
              { label: "Cost Estimate (Low)", val: `$${costLow.toLocaleString()}`, unit: "", desc: `At $${priceLow}/credit` },
              { label: "Cost Estimate (High)", val: `$${costHigh.toLocaleString()}`, unit: "", desc: `At $${priceHigh}/credit` },
            ].map((c) => (
              <div key={c.label} style={{ background: PALETTE.accentGlow2, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
                <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 20, marginTop: 6, color: PALETTE.text }}>
                  {c.val}
                  {c.unit && <span style={{ fontSize: 11, fontWeight: 400, color: PALETTE.textDim }}> {c.unit}</span>}
                </div>
                <div style={{ fontSize: 10, color: PALETTE.textDim, marginTop: 3 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Net-Zero banner */}
          <div style={{
            background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentDim})`,
            borderRadius: 12, padding: 18, color: PALETTE.bg,
          }}>
            <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 15 }}>Net-Zero Pathway</div>
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85, lineHeight: 1.6 }}>
              At current levels, fully offsetting emissions requires {creditsNeeded} verified credits.
              Reducing electricity by 20% would lower the requirement to {Math.ceil(totalTons * 0.84)} credits.
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: 14,
            background: "rgba(245,158,11,0.06)",
            border: `1px solid rgba(245,158,11,0.2)`,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 10,
            color: PALETTE.textMuted,
            lineHeight: 1.7,
          }}>
            This is a planning tool. Credits shown are estimates only. Actual procurement requires verification through an accredited registry (e.g. Gold Standard, Verra VCS).
          </div>
        </div>

        {/* Export Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Compliance Export</div>
            <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 16 }}>All exports are formatted for regulatory submission</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {exportButtons.map((exp) => {
                const st = exportStates?.[exp.key];
                return (
                  <button
                    key={exp.key}
                    onClick={exp.onClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
                      borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                      color: PALETTE.text, fontFamily: font, textAlign: "left",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
                  >
                    <div style={{ flexShrink: 0 }}>{exp.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{exp.label}</div>
                      <div style={{ fontSize: 11, color: PALETTE.textDim, marginTop: 2 }}>{exp.sub}</div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 10, color: PALETTE.textDim, minWidth: 80 }}>
                      {st === "generating" && <span style={{ color: PALETTE.amber }}>Generating...</span>}
                      {st === "done" && <span style={{ color: PALETTE.accent }}>✓ Downloaded</span>}
                      {st === "copied" && <span style={{ color: PALETTE.accent }}>✓ Copied!</span>}
                      {!st && <span>Last: Never</span>}
                      <div style={{ marginTop: 2, fontSize: 14, color: PALETTE.textDim }}>↗</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{
            background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 20,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: PALETTE.textDim }}>Quick Stats</div>
            {[
              { label: "Scope 1 : Scope 2", val: `${totalTons > 0 ? ((scope1Tons / totalTons) * 100).toFixed(0) : 0}% : ${totalTons > 0 ? ((scope2Tons / totalTons) * 100).toFixed(0) : 0}%` },
              { label: "CO₂e Per Day (est.)", val: `${(totalTons / 31).toFixed(2)} t/day` },
              { label: "Annualized (est.)", val: `${(totalTons * 12).toFixed(0)} t/yr` },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
                <span style={{ fontSize: 12, color: PALETTE.textMuted }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: font }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Tool */}
      <ScenarioTool
        totalTons={totalTons}
        scope1Tons={scope1Tons}
        scope2Tons={scope2Tons}
        electricityShare={electricityShare}
        creditsNeeded={creditsNeeded}
      />
    </div>
  );
}
