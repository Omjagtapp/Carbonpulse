import { useState, useEffect } from "react";
import { PALETTE, EMISSION_FACTORS, MONTHS_HISTORY, FACILITY_MULTIPLIERS, SCENARIO_MULTIPLIERS } from "./data/mockData.js";
import { calculateEmissions, buildPieData, generateInsights, calcIntensity } from "./utils/calculations.js";
import { exportCSV, exportGHGCSV, exportPDF, exportClipboard } from "./utils/exports.js";
import OverviewTab from "./components/OverviewTab.jsx";
import InputsTab from "./components/InputsTab.jsx";
import OffsetsTab from "./components/OffsetsTab.jsx";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";

function AnimateIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: "opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1)",
    }}>
      {children}
    </div>
  );
}

function GlowDot({ color = PALETTE.accent }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, boxShadow: `0 0 8px ${color}`,
    }} />
  );
}

export default function App() {
  const [company] = useState("Midwest Auto Components");
  const [activeTab, setActiveTab] = useState("overview");

  // Base activity inputs — MOCK: replace with API
  const [inputs, setInputs] = useState({
    electricity: 120000,
    naturalGas: 1500,
    diesel: 300,
  });

  // Filters state
  const [filters, setFilters] = useState({
    month: "Mar",
    year: "2026",
    facility: "All Facilities",
    scenario: "Baseline",
  });

  // Export states per button: null | 'generating' | 'done' | 'copied'
  const [exportStates, setExportStates] = useState({});

  // CSV validation issue count (for tab badge)
  const [csvIssues, setCSVIssues] = useState(0);

  const updateInput = (key, val) => {
    const n = parseFloat(val) || 0;
    setInputs((p) => ({ ...p, [key]: n }));
  };

  const handleCSVData = (newInputs) => {
    setInputs((prev) => ({ ...prev, ...newInputs }));
  };

  // Compute combined multiplier from filters
  const facilityMult = FACILITY_MULTIPLIERS[filters.facility] ?? 1.0;
  const scenarioMult = SCENARIO_MULTIPLIERS[filters.scenario] ?? 1.0;
  const combinedMult = facilityMult * scenarioMult;

  // Core calculations
  const { emissions, scope1, scope2, totalKg, totalTons, scope1Tons, scope2Tons } =
    calculateEmissions(inputs, combinedMult);

  const currentMonth = { month: filters.month, tons: parseFloat(totalTons.toFixed(2)) };
  const trendData = [...MONTHS_HISTORY, currentMonth];
  const avgTons = trendData.reduce((s, d) => s + d.tons, 0) / trendData.length;
  const prevMonth = MONTHS_HISTORY[MONTHS_HISTORY.length - 1];
  const momChange = prevMonth.tons > 0
    ? ((currentMonth.tons - prevMonth.tons) / prevMonth.tons) * 100
    : 0;

  const pieData = buildPieData(emissions, totalKg);
  const PIE_COLORS = [PALETTE.accent, PALETTE.scope1, "#ef4444"];
  const scopePie = [
    { name: "Scope 1", value: scope1, color: PALETTE.scope1 },
    { name: "Scope 2", value: scope2, color: PALETTE.scope2 },
  ];

  const creditsNeeded = Math.ceil(totalTons);
  const creditCostLow = creditsNeeded * 10;
  const creditCostHigh = creditsNeeded * 15;

  const intensity = calcIntensity(totalTons, inputs.electricity);
  const electricityShare = totalKg > 0 ? emissions.electricity / totalKg : 0;

  const insights = generateInsights(
    emissions, totalKg, totalTons, scope2Tons,
    momChange, prevMonth.month, intensity,
    { value: 0.00045, label: "SME Automotive" }
  );

  // Export helpers with state tracking
  const triggerExport = async (key, fn) => {
    setExportStates((p) => ({ ...p, [key]: "generating" }));
    await new Promise((r) => setTimeout(r, 600));
    await fn();
    const doneKey = key === "clipboard" ? "copied" : "done";
    setExportStates((p) => ({ ...p, [key]: doneKey }));
    setTimeout(() => setExportStates((p) => ({ ...p, [key]: null })), 4000);
  };

  const exportPayload = {
    inputs, emissions, totalKg, totalTons, scope1Tons, scope2Tons,
    creditsNeeded, creditCostLow, creditCostHigh, momChange, intensity, company,
  };

  const handleExportPDF = () => triggerExport("pdf", () => exportPDF(exportPayload));
  const handleExportCSV = () => triggerExport("csv", () => exportCSV(exportPayload));
  const handleExportGHG = () => triggerExport("ghg", () => exportGHGCSV(exportPayload));
  const handleExportClipboard = () => triggerExport("clipboard", () => exportClipboard(exportPayload));

  // Tab badge: show ⚠ N if there are CSV validation issues
  const tabLabels = {
    overview: "Overview",
    inputs: csvIssues > 0 ? `Inputs ⚠${csvIssues}` : "Inputs",
    offsets: "Offsets",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 20% 0%, rgba(52,211,153,0.04) 0%, transparent 60%), ${PALETTE.bg}`,
      color: PALETTE.text,
      fontFamily: font,
      fontSize: 13,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Header */}
        <AnimateIn delay={0}>
          <header style={{
            display: "flex", flexWrap: "wrap",
            justifyContent: "space-between", alignItems: "flex-start",
            gap: 20, marginBottom: 32,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentDim})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 16, color: PALETTE.bg, fontFamily: fontDisplay,
                }}>C</div>
                <span style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em" }}>
                  CarbonPulse
                </span>
                <span style={{
                  fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                  background: PALETTE.accentGlow, color: PALETTE.accent,
                  padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                }}>BETA</span>
              </div>
              <h1 style={{
                fontFamily: fontDisplay, fontWeight: 700,
                fontSize: "clamp(26px,4vw,38px)",
                letterSpacing: "-0.03em", lineHeight: 1.1, margin: "4px 0",
              }}>
                Emissions Analytics
              </h1>
              <p style={{ color: PALETTE.textMuted, fontSize: 12, marginTop: 6 }}>
                Audit-ready Scope 1 &amp; 2 reporting · {filters.month} {filters.year}
              </p>
            </div>

            <div style={{
              background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
              borderRadius: 14, padding: "14px 18px", minWidth: 200,
            }}>
              <div style={{ color: PALETTE.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>Reporting Entity</div>
              <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 15, marginTop: 4 }}>{company}</div>
              <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <GlowDot /> Live calculations
              </div>
              {filters.scenario !== "Baseline" && (
                <div style={{ marginTop: 6, fontSize: 10, color: PALETTE.amber, fontFamily: font }}>
                  ⚡ {filters.scenario} scenario active ({combinedMult.toFixed(2)}x)
                </div>
              )}
            </div>
          </header>
        </AnimateIn>

        {/* Tab bar */}
        <AnimateIn delay={80}>
          <div style={{
            display: "flex", gap: 4, marginBottom: 24,
            background: PALETTE.card, borderRadius: 12, padding: 4,
            border: `1px solid ${PALETTE.border}`, width: "fit-content",
          }}>
            {["overview", "inputs", "offsets"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 18px", borderRadius: 9, fontSize: 12, fontWeight: 500,
                  fontFamily: font, cursor: "pointer", border: "none",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  background: activeTab === tab ? PALETTE.accent : "transparent",
                  color: activeTab === tab ? PALETTE.bg : PALETTE.textMuted,
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </AnimateIn>

        {/* Tab content */}
        {activeTab === "overview" && (
          <AnimateIn delay={120}>
            <OverviewTab
              totalTons={totalTons}
              scope1Tons={scope1Tons}
              scope2Tons={scope2Tons}
              totalKg={totalKg}
              scope1={scope1}
              scope2={scope2}
              emissions={emissions}
              pieData={pieData}
              scopePie={scopePie}
              trendData={trendData}
              avgTons={avgTons}
              momChange={momChange}
              prevMonth={prevMonth}
              insights={insights}
              intensity={intensity}
              filters={filters}
              onFilterChange={setFilters}
            />
          </AnimateIn>
        )}

        {activeTab === "inputs" && (
          <AnimateIn delay={80}>
            <InputsTab
              inputs={inputs}
              emissions={emissions}
              totalKg={totalKg}
              totalTons={totalTons}
              scope2Tons={scope2Tons}
              onUpdate={updateInput}
              onCSVData={handleCSVData}
            />
          </AnimateIn>
        )}

        {activeTab === "offsets" && (
          <AnimateIn delay={80}>
            <OffsetsTab
              totalTons={totalTons}
              scope1Tons={scope1Tons}
              scope2Tons={scope2Tons}
              electricityShare={electricityShare}
              creditsNeeded={creditsNeeded}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              onExportGHG={handleExportGHG}
              onExportClipboard={handleExportClipboard}
              exportStates={exportStates}
            />
          </AnimateIn>
        )}

        {/* Footer */}
        <AnimateIn delay={600}>
          <div style={{
            marginTop: 36, paddingTop: 20,
            borderTop: `1px solid ${PALETTE.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ color: PALETTE.textDim, fontSize: 10 }}>
              CarbonPulse · Prototype · Not for regulatory submission
            </div>
            <div style={{ color: PALETTE.textDim, fontSize: 10 }}>
              Emission factors: EPA eGRID 2024 · GHG Protocol methodology · {new Date().toLocaleDateString()}
            </div>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
