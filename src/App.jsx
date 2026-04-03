import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const EMISSION_FACTORS = {
  electricity: { factor: 0.4, unit: "kWh", label: "Electricity", scope: 2 },
  naturalGas: { factor: 5.3, unit: "therms", label: "Natural Gas", scope: 1 },
  diesel: { factor: 10.2, unit: "gallons", label: "Diesel", scope: 1 },
};

const PALETTE = {
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
};

const MONTHS_HISTORY = [
  { month: "Oct", tons: 61.2 },
  { month: "Nov", tons: 58.7 },
  { month: "Dec", tons: 55.3 },
  { month: "Jan", tons: 52.4 },
  { month: "Feb", tons: 55.1 },
];

function AnimateIn({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {children}
    </div>
  );
}

function NumberTicker({ value, decimals = 2 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = display;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

function GlowDot({ color = PALETTE.accent }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, boxShadow: `0 0 8px ${color}`,
    }} />
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
      borderRadius: 12, padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12, color: PALETTE.text,
    }}>
      <div style={{ color: PALETTE.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        {payload[0].value.toFixed(2)} <span style={{ color: PALETTE.textDim }}>tCO₂e</span>
      </div>
    </div>
  );
};

export default function App() {
  const [inputs, setInputs] = useState({
    electricity: 120000,
    naturalGas: 1500,
    diesel: 300,
  });
  const [company] = useState("Midwest Auto Components");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {}, []);

  const update = (key, val) => {
    const n = parseFloat(val) || 0;
    setInputs((p) => ({ ...p, [key]: n }));
  };

  const emissions = {};
  let scope1 = 0, scope2 = 0;
  Object.entries(EMISSION_FACTORS).forEach(([key, { factor, scope }]) => {
    const kg = inputs[key] * factor;
    emissions[key] = kg;
    if (scope === 1) scope1 += kg;
    else scope2 += kg;
  });
  const totalKg = scope1 + scope2;
  const totalTons = totalKg / 1000;
  const scope1Tons = scope1 / 1000;
  const scope2Tons = scope2 / 1000;

  const currentMonth = { month: "Mar", tons: Number(totalTons.toFixed(2)) };
  const trendData = [...MONTHS_HISTORY, currentMonth];
  const avgTons = trendData.reduce((s, d) => s + d.tons, 0) / trendData.length;
  const prevMonth = MONTHS_HISTORY[MONTHS_HISTORY.length - 1];
  const momChange = ((currentMonth.tons - prevMonth.tons) / prevMonth.tons) * 100;

  const pieData = Object.entries(EMISSION_FACTORS).map(([key, { label }]) => ({
    name: label,
    value: emissions[key],
    pct: ((emissions[key] / totalKg) * 100).toFixed(1),
  }));
  const PIE_COLORS = [PALETTE.accent, PALETTE.scope1, "#ef4444"];

  const scopePie = [
    { name: "Scope 1", value: scope1, color: PALETTE.scope1 },
    { name: "Scope 2", value: scope2, color: PALETTE.scope2 },
  ];

  const creditsNeeded = Math.ceil(totalTons);
  const creditCostLow = creditsNeeded * 10;
  const creditCostHigh = creditsNeeded * 15;

  const intensity = (totalTons / 120000).toFixed(4);

  const font = "'JetBrains Mono', monospace";
  const fontDisplay = "'Space Grotesk', sans-serif";

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
          <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentDim})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 16, color: PALETTE.bg,
                  fontFamily: fontDisplay,
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
                fontFamily: fontDisplay, fontWeight: 700, fontSize: "clamp(26px,4vw,38px)",
                letterSpacing: "-0.03em", lineHeight: 1.1, margin: "4px 0",
              }}>
                Emissions Analytics
              </h1>
              <p style={{ color: PALETTE.textMuted, fontSize: 12, marginTop: 6 }}>
                Audit-ready Scope 1 & 2 reporting · March 2026
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
            </div>
          </header>
        </AnimateIn>

        {/* Tab bar */}
        <AnimateIn delay={80}>
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: PALETTE.card, borderRadius: 12, padding: 4, border: `1px solid ${PALETTE.border}`, width: "fit-content" }}>
            {["overview", "inputs", "offsets"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "8px 18px", borderRadius: 9, fontSize: 12, fontWeight: 500,
                fontFamily: font, cursor: "pointer", border: "none", letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: activeTab === tab ? PALETTE.accent : "transparent",
                color: activeTab === tab ? PALETTE.bg : PALETTE.textMuted,
                transition: "all 0.2s",
              }}>
                {tab}
              </button>
            ))}
          </div>
        </AnimateIn>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Emissions", value: totalTons, unit: "tCO₂e", sub: "Scope 1 + 2", color: PALETTE.accent },
                { label: "Scope 1 · Direct", value: scope1Tons, unit: "tCO₂e", sub: "Fuel combustion", color: PALETTE.scope1 },
                { label: "Scope 2 · Indirect", value: scope2Tons, unit: "tCO₂e", sub: "Purchased electricity", color: PALETTE.accent },
                { label: "Month-over-Month", value: momChange, unit: "%", sub: `vs ${prevMonth.month} (${prevMonth.tons}t)`, color: momChange > 0 ? PALETTE.danger : PALETTE.accent, isChange: true },
              ].map((m, i) => (
                <AnimateIn key={m.label} delay={140 + i * 60}>
                  <div style={{
                    background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
                    borderRadius: 16, padding: "20px 22px",
                    borderTop: `2px solid ${m.color}`,
                  }}>
                    <div style={{ color: PALETTE.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>{m.label}</div>
                    <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 28, marginTop: 8, color: m.color, display: "flex", alignItems: "baseline", gap: 6 }}>
                      {m.isChange && m.value > 0 && "+"}
                      <NumberTicker value={m.value} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: PALETTE.textDim }}>{m.unit}</span>
                    </div>
                    <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 6 }}>{m.sub}</div>
                  </div>
                </AnimateIn>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
              <AnimateIn delay={400}>
                <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: "22px 22px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16 }}>Emissions Trend</div>
                      <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 2 }}>6-month rolling · March is live-calculated</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: PALETTE.textDim }}>
                      AVG <span style={{ color: PALETTE.accent, fontWeight: 600 }}>{avgTons.toFixed(1)}t</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={PALETTE.accent} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={PALETTE.accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
                      <XAxis dataKey="month" tick={{ fill: PALETTE.textDim, fontSize: 11, fontFamily: font }} axisLine={{ stroke: PALETTE.border }} tickLine={false} />
                      <YAxis tick={{ fill: PALETTE.textDim, fontSize: 11, fontFamily: font }} axisLine={false} tickLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="tons" stroke={PALETTE.accent} strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: PALETTE.accent, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: PALETTE.accent, stroke: PALETTE.bg, strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </AnimateIn>

              <AnimateIn delay={460}>
                <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 22 }}>
                  <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Scope Split</div>
                  <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 12 }}>Direct vs. Indirect</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={scopePie} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
                        {scopePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {scopePie.map((s) => (
                      <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                          <span style={{ fontSize: 12 }}>{s.name}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{(s.value / 1000).toFixed(2)}t</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            </div>

            <AnimateIn delay={520}>
              <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 22 }}>
                <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Source Breakdown</div>
                <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 18 }}>Emission factors applied to activity data</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={pieData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} horizontal={false} />
                    <XAxis type="number" tick={{ fill: PALETTE.textDim, fontSize: 11, fontFamily: font }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: PALETTE.textMuted, fontSize: 12, fontFamily: font }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip formatter={(v) => [`${(v / 1000).toFixed(2)} tCO₂e`, "Emissions"]}
                      contentStyle={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, fontFamily: font, fontSize: 12 }}
                      labelStyle={{ color: PALETTE.textMuted }} itemStyle={{ color: PALETTE.accent }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ background: PALETTE.accentGlow2, borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i] }} />
                        <span style={{ fontSize: 11, color: PALETTE.textMuted }}>{d.name}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{d.pct}%</div>
                      <div style={{ fontSize: 11, color: PALETTE.textDim }}>{d.value.toLocaleString()} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </>
        )}

        {/* INPUTS TAB */}
        {activeTab === "inputs" && (
          <AnimateIn delay={80}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 24 }}>
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
                        onChange={(e) => update(key, e.target.value)}
                        style={{
                          flex: 1, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
                          borderRadius: 10, padding: "12px 14px", color: PALETTE.text,
                          fontFamily: font, fontSize: 14, fontWeight: 600,
                          outline: "none",
                        }}
                        onFocus={(e) => e.target.style.borderColor = PALETTE.accent}
                        onBlur={(e) => e.target.style.borderColor = PALETTE.border}
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
                <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Calculation Audit Trail</div>
                  <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 18 }}>Transparent factor-based methodology</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: PALETTE.textDim, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", borderBottom: `1px solid ${PALETTE.border}` }}>Source</th>
                        <th style={{ textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${PALETTE.border}` }}>Usage</th>
                        <th style={{ textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${PALETTE.border}` }}>Factor</th>
                        <th style={{ textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${PALETTE.border}` }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(EMISSION_FACTORS).map(([key, { label, unit, factor }]) => (
                        <tr key={key}>
                          <td style={{ padding: "12px 0", borderBottom: `1px solid ${PALETTE.border}`, fontWeight: 500 }}>{label}</td>
                          <td style={{ padding: "12px 0", borderBottom: `1px solid ${PALETTE.border}`, textAlign: "right", color: PALETTE.textMuted }}>{inputs[key].toLocaleString()} {unit}</td>
                          <td style={{ padding: "12px 0", borderBottom: `1px solid ${PALETTE.border}`, textAlign: "right", color: PALETTE.textDim }}>{factor} kg/{unit}</td>
                          <td style={{ padding: "12px 0", borderBottom: `1px solid ${PALETTE.border}`, textAlign: "right", fontWeight: 600, color: PALETTE.accent }}>{emissions[key].toLocaleString()} kg</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ padding: "14px 0", fontWeight: 700, fontFamily: fontDisplay, fontSize: 14 }}>Total</td>
                        <td style={{ padding: "14px 0", textAlign: "right", fontWeight: 700, fontFamily: fontDisplay, fontSize: 14, color: PALETTE.accent }}>{totalKg.toLocaleString()} kg</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{
                  background: `linear-gradient(135deg, ${PALETTE.card}, rgba(52,211,153,0.05))`,
                  border: `1px solid ${PALETTE.borderLight}`, borderRadius: 16, padding: 24,
                }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: PALETTE.textDim }}>Carbon Intensity</div>
                  <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 32, marginTop: 8, color: PALETTE.accent }}>{intensity}</div>
                  <div style={{ color: PALETTE.textMuted, fontSize: 12, marginTop: 4 }}>tCO₂e per kWh consumed</div>
                  <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>
                    Normalized metric for cross-facility benchmarking. Lower is better.
                  </div>
                </div>
              </div>
            </div>
          </AnimateIn>
        )}

        {/* OFFSETS TAB */}
        {activeTab === "offsets" && (
          <AnimateIn delay={80}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Carbon Credit Estimator</div>
                <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 24 }}>Voluntary offset purchase planning</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Credits Required", val: creditsNeeded, unit: "credits", desc: "1 credit = 1 tCO₂e", isNum: true },
                    { label: "Market Price Range", val: "$10–$15", unit: "/credit", desc: "Verified carbon offset", isNum: false },
                    { label: "Low Estimate", val: `$${creditCostLow}`, unit: "", desc: "At $10/credit", isNum: false },
                    { label: "High Estimate", val: `$${creditCostHigh}`, unit: "", desc: "At $15/credit", isNum: false },
                  ].map((c) => (
                    <div key={c.label} style={{ background: PALETTE.accentGlow2, borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, color: PALETTE.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.label}</div>
                      <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 22, marginTop: 6 }}>
                        {c.isNum ? <NumberTicker value={c.val} decimals={0} /> : c.val}
                        <span style={{ fontSize: 12, fontWeight: 400, color: PALETTE.textDim }}> {c.unit}</span>
                      </div>
                      <div style={{ fontSize: 10, color: PALETTE.textDim, marginTop: 4 }}>{c.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentDim})`,
                  borderRadius: 14, padding: 20, color: PALETTE.bg,
                }}>
                  <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16 }}>Net-Zero Pathway</div>
                  <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8, lineHeight: 1.6 }}>
                    At current levels, fully offsetting March emissions requires {creditsNeeded} verified credits. Reducing electricity consumption by 20% would lower the requirement to {Math.ceil(totalTons * 0.84)} credits.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
                  borderRadius: 16, padding: 24,
                }}>
                  <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Compliance Export</div>
                  <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 16 }}>Audit-ready documentation</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Full Report (PDF)", desc: "Scope 1 & 2 summary, methodology, calculations" },
                      { label: "Raw Data (CSV)", desc: "Activity data with emission factors applied" },
                      { label: "GHG Protocol Template", desc: "Pre-filled corporate standard worksheet" },
                    ].map((exp) => (
                      <button key={exp.label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
                        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                        color: PALETTE.text, fontFamily: font, textAlign: "left",
                        transition: "border-color 0.2s",
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = PALETTE.accent}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = PALETTE.border}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{exp.label}</div>
                          <div style={{ fontSize: 11, color: PALETTE.textDim, marginTop: 2 }}>{exp.desc}</div>
                        </div>
                        <span style={{ fontSize: 16, color: PALETTE.textDim }}>↗</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 20,
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: PALETTE.textDim }}>Quick Stats</div>
                  {[
                    { label: "Largest Source", val: "Electricity", extra: `${((emissions.electricity / totalKg) * 100).toFixed(0)}% of total` },
                    { label: "Scope 1 : Scope 2", val: `${((scope1 / totalKg) * 100).toFixed(0)}% : ${((scope2 / totalKg) * 100).toFixed(0)}%` },
                    { label: "CO₂e Per Day (est.)", val: `${(totalTons / 31).toFixed(2)} t/day` },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
                      <span style={{ fontSize: 12, color: PALETTE.textMuted }}>{s.label}</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.val}</span>
                        {s.extra && <div style={{ fontSize: 10, color: PALETTE.textDim }}>{s.extra}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimateIn>
        )}

        {/* Footer */}
        <AnimateIn delay={600}>
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${PALETTE.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: PALETTE.textDim, fontSize: 10 }}>CarbonPulse · Prototype · Not for regulatory submission</div>
            <div style={{ color: PALETTE.textDim, fontSize: 10 }}>Emission factors: EPA eGRID 2024 · GHG Protocol methodology</div>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
