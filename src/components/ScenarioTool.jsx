import { useState } from "react";
import { PALETTE } from "../data/mockData.js";
import { applyScenario } from "../utils/calculations.js";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";

function SliderRow({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: PALETTE.textMuted }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.accent, fontFamily: font }}>{value}%</span>
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min={0}
          max={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            appearance: "none",
            WebkitAppearance: "none",
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(to right, ${PALETTE.accent} ${value * 2}%, ${PALETTE.border} ${value * 2}%)`,
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}

export default function ScenarioTool({ totalTons, scope1Tons, scope2Tons, electricityShare, creditsNeeded }) {
  const [elecReduction, setElecReduction] = useState(15);
  const [gasReduction, setGasReduction] = useState(10);
  const [renewableSwitch, setRenewableSwitch] = useState(25);

  const { scenarioTons, reductionTons, reductionPct } = applyScenario(
    totalTons, scope1Tons, scope2Tons, electricityShare,
    elecReduction, gasReduction, renewableSwitch
  );

  const scenarioCredits = Math.ceil(scenarioTons);
  const creditsSaved = creditsNeeded - scenarioCredits;
  const costSavingLow = Math.max(0, creditsSaved * 10);
  const costSavingHigh = Math.max(0, creditsSaved * 15);

  const baselineWidth = 100;
  const scenarioWidth = totalTons > 0 ? (scenarioTons / totalTons) * 100 : 0;

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 18 }}>Emissions Scenario Planner</div>
          <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 4 }}>
            Adjust levers below to model reduction scenarios in real time
          </div>
        </div>
        <div style={{
          fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
          background: "rgba(245,158,11,0.12)", color: PALETTE.amber,
          padding: "3px 8px", borderRadius: 6, fontWeight: 600,
        }}>
          Planner
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Sliders */}
        <div>
          <div style={{ fontSize: 11, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            Reduction Levers
          </div>
          <SliderRow label="Reduce electricity by" value={elecReduction} onChange={setElecReduction} />
          <SliderRow label="Reduce natural gas by" value={gasReduction} onChange={setGasReduction} />
          <SliderRow label="Switch to renewable electricity" value={renewableSwitch} onChange={setRenewableSwitch} />
          <div style={{ fontSize: 10, color: PALETTE.textDim, lineHeight: 1.6, marginTop: 4 }}>
            Renewable switch reduces Scope 2 proportionally. Sliders are independent and additive.
          </div>
        </div>

        {/* Results */}
        <div style={{
          background: PALETTE.accentGlow2,
          border: `1px solid ${PALETTE.borderLight}`,
          borderRadius: 12,
          padding: 20,
        }}>
          <div style={{ fontSize: 11, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            Scenario Results
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: PALETTE.textDim, marginBottom: 4 }}>Scenario emissions</div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 26, color: PALETTE.accent }}>
              {scenarioTons.toFixed(2)}
              <span style={{ fontSize: 13, fontWeight: 400, color: PALETTE.textDim }}> tCO₂e</span>
            </div>
            <div style={{ fontSize: 11, color: PALETTE.textMuted, marginTop: 2 }}>
              vs baseline {totalTons.toFixed(2)} tCO₂e
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Reduction achieved", val: `${reductionTons.toFixed(2)} t`, sub: `${reductionPct}%` },
              { label: "Credits needed", val: `${scenarioCredits}`, sub: `saved ${creditsSaved}` },
              { label: "Cost saving (low)", val: `$${costSavingLow.toLocaleString()}`, sub: "at $10/credit" },
              { label: "Cost saving (high)", val: `$${costSavingHigh.toLocaleString()}`, sub: "at $15/credit" },
            ].map((r) => (
              <div key={r.label} style={{ background: PALETTE.card, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: PALETTE.textDim, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: PALETTE.text }}>{r.val}</div>
                <div style={{ fontSize: 10, color: PALETTE.textMuted }}>{r.sub}</div>
              </div>
            ))}
          </div>

          {/* Comparison bar */}
          <div>
            <div style={{ fontSize: 10, color: PALETTE.textDim, marginBottom: 8 }}>Baseline vs Scenario</div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: PALETTE.textDim }}>Baseline</span>
                <span style={{ fontSize: 10, color: PALETTE.textDim }}>{totalTons.toFixed(1)}t</span>
              </div>
              <div style={{ height: 8, background: PALETTE.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${baselineWidth}%`, height: "100%", background: PALETTE.danger, borderRadius: 4 }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: PALETTE.accent }}>Scenario</span>
                <span style={{ fontSize: 10, color: PALETTE.accent }}>{scenarioTons.toFixed(1)}t</span>
              </div>
              <div style={{ height: 8, background: PALETTE.border, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${scenarioWidth.toFixed(1)}%`, height: "100%", background: PALETTE.accent, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
