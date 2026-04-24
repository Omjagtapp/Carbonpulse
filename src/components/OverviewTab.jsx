import { useState } from "react";
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid, ReferenceLine,
} from "recharts";
import { PALETTE } from "../data/mockData.js";
import FilterBar from "./FilterBar.jsx";
import InsightsPanel from "./InsightsPanel.jsx";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";
const PIE_COLORS = [PALETTE.accent, PALETTE.scope1, "#ef4444"];
const INTENSITY_BENCHMARK = 0.00045;

function NumberTicker({ value, decimals = 2 }) {
  return <>{value.toFixed(decimals)}</>;
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
      borderRadius: 12, padding: "10px 14px", fontFamily: font,
      fontSize: 12, color: PALETTE.text,
    }}>
      <div style={{ color: PALETTE.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        {payload[0].value.toFixed(2)} <span style={{ color: PALETTE.textDim }}>tCO₂e</span>
      </div>
    </div>
  );
};

export default function OverviewTab({
  totalTons, scope1Tons, scope2Tons, totalKg, scope1, scope2,
  emissions, pieData, scopePie, trendData, avgTons, momChange, prevMonth,
  insights, intensity, filters, onFilterChange,
}) {
  const [chartMode, setChartMode] = useState("monthly"); // 'monthly' | 'quarterly'
  const targetValue = avgTons * 0.9;

  // Build quarterly data from trendData
  const quarterlyData = [];
  for (let i = 0; i < trendData.length; i += 3) {
    const slice = trendData.slice(i, i + 3);
    const avg = slice.reduce((s, d) => s + d.tons, 0) / slice.length;
    quarterlyData.push({
      month: `Q${Math.floor(i / 3) + 1}`,
      tons: parseFloat(avg.toFixed(2)),
    });
  }

  const displayData = chartMode === "quarterly" ? quarterlyData : trendData;
  const maxPoint = displayData.reduce((a, b) => (a.tons > b.tons ? a : b), displayData[0] || { tons: 0 });
  const minPoint = displayData.reduce((a, b) => (a.tons < b.tons ? a : b), displayData[0] || { tons: 0 });

  const benchmarkVal = INTENSITY_BENCHMARK;
  const intensityVal = parseFloat(intensity);
  const benchmarkDiffPct = benchmarkVal > 0 ? (((intensityVal - benchmarkVal) / benchmarkVal) * 100).toFixed(0) : 0;
  const aboveBenchmark = intensityVal > benchmarkVal;

  const maxIntensity = Math.max(intensityVal, benchmarkVal) * 1.2;
  const currentBarWidth = maxIntensity > 0 ? (intensityVal / maxIntensity) * 100 : 0;
  const benchmarkBarWidth = maxIntensity > 0 ? (benchmarkVal / maxIntensity) * 100 : 0;

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={onFilterChange} />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
        {[
          { label: "Total Emissions", value: totalTons, unit: "tCO₂e", sub: "Scope 1 + 2", color: PALETTE.accent },
          { label: "Scope 1 · Direct", value: scope1Tons, unit: "tCO₂e", sub: "Fuel combustion", color: PALETTE.scope1 },
          { label: "Scope 2 · Indirect", value: scope2Tons, unit: "tCO₂e", sub: "Purchased electricity", color: PALETTE.accent },
          {
            label: "Month-over-Month",
            value: momChange,
            unit: "%",
            sub: `vs ${prevMonth.month} (${prevMonth.tons}t)`,
            color: momChange > 0 ? PALETTE.danger : PALETTE.accent,
            isChange: true,
          },
        ].map((m, i) => (
          <div
            key={m.label}
            style={{
              background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
              borderRadius: 16, padding: "20px 22px",
              borderTop: `2px solid ${m.color}`,
              transition: "border-color 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = PALETTE.border;
              e.currentTarget.style.borderTopColor = m.color;
            }}
          >
            <div style={{ color: PALETTE.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>{m.label}</div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 28, marginTop: 8, color: m.color, display: "flex", alignItems: "baseline", gap: 6 }}>
              {m.isChange && (
                <span style={{ fontSize: 18, marginRight: 2 }}>
                  {m.value > 0 ? "↑" : "↓"}
                </span>
              )}
              {m.isChange && m.value > 0 && "+"}
              <NumberTicker value={m.value} />
              <span style={{ fontSize: 13, fontWeight: 500, color: PALETTE.textDim }}>{m.unit}</span>
            </div>
            <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Insights Panel */}
      <InsightsPanel insights={insights} />

      {/* Trend Chart + Scope Split */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{
          background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
          borderRadius: 16, padding: "22px 22px 10px",
          transition: "border-color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16 }}>Emissions Trend</div>
              <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 2 }}>
                6-month rolling · {chartMode === "quarterly" ? "Quarterly averages" : "March is live-calculated"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 11, color: PALETTE.textDim }}>
                AVG <span style={{ color: PALETTE.accent, fontWeight: 600 }}>{avgTons.toFixed(1)}t</span>
              </div>
              {/* Monthly / Quarterly toggle */}
              <div style={{
                display: "flex", background: PALETTE.bg, border: `1px solid ${PALETTE.border}`,
                borderRadius: 8, padding: 2,
              }}>
                {["monthly", "quarterly"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                      fontFamily: font, cursor: "pointer", border: "none",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      background: chartMode === mode ? PALETTE.accent : "transparent",
                      color: chartMode === mode ? PALETTE.bg : PALETTE.textMuted,
                      transition: "all 0.2s",
                    }}
                  >
                    {mode === "monthly" ? "Monthly" : "Quarterly"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={displayData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={PALETTE.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
              <XAxis
                dataKey="month"
                tick={{ fill: PALETTE.textDim, fontSize: 11, fontFamily: font }}
                axisLine={{ stroke: PALETTE.border }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: PALETTE.textDim, fontSize: 11, fontFamily: font }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={targetValue}
                stroke={PALETTE.accentDim}
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `Target ${targetValue.toFixed(1)}t`,
                  fill: PALETTE.accentDim,
                  fontSize: 10,
                  fontFamily: font,
                  position: "insideTopRight",
                }}
              />
              <Area
                type="monotone"
                dataKey="tons"
                stroke={PALETTE.accent}
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isMax = payload.month === maxPoint?.month;
                  const isMin = payload.month === minPoint?.month;
                  const isCurrent = payload.month === "Mar";
                  const r = isCurrent ? 7 : 4;
                  return (
                    <g key={payload.month}>
                      <circle cx={cx} cy={cy} r={r} fill={PALETTE.accent} stroke={isCurrent ? PALETTE.bg : "none"} strokeWidth={isCurrent ? 2 : 0} />
                      {isCurrent && (
                        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fill={PALETTE.accent} fontFamily={font}>Mar (live)</text>
                      )}
                      {isMax && !isCurrent && (
                        <text x={cx} y={cy - 10} textAnchor="middle" fontSize={9} fill={PALETTE.danger} fontFamily={font}>▲ {payload.tons}t</text>
                      )}
                      {isMin && !isCurrent && (
                        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={9} fill={PALETTE.accent} fontFamily={font}>▼ {payload.tons}t</text>
                      )}
                    </g>
                  );
                }}
                activeDot={{ r: 6, fill: PALETTE.accent, stroke: PALETTE.bg, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scope Split */}
        <div style={{
          background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
          borderRadius: 16, padding: 22,
          transition: "border-color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
        >
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
      </div>

      {/* Source Breakdown */}
      <div style={{
        background: PALETTE.card, border: `1px solid ${PALETTE.border}`,
        borderRadius: 16, padding: 22, marginBottom: 14,
        transition: "border-color 0.2s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
      >
        <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Source Breakdown</div>
        <div style={{ color: PALETTE.textDim, fontSize: 11, marginBottom: 18 }}>Emission factors applied to activity data</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={pieData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} horizontal={false} />
            <XAxis type="number" tick={{ fill: PALETTE.textDim, fontSize: 11, fontFamily: font }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
            <YAxis type="category" dataKey="name" tick={{ fill: PALETTE.textMuted, fontSize: 12, fontFamily: font }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              formatter={(v) => [`${(v / 1000).toFixed(2)} tCO₂e`, "Emissions"]}
              contentStyle={{ background: PALETTE.card, border: `1px solid ${PALETTE.border}`, borderRadius: 12, fontFamily: font, fontSize: 12 }}
              labelStyle={{ color: PALETTE.textMuted }}
              itemStyle={{ color: PALETTE.accent }}
            />
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
              <div style={{ fontSize: 11, color: PALETTE.textDim }}>{d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Intensity with Benchmark */}
      <div style={{
        background: `linear-gradient(135deg, ${PALETTE.card}, rgba(52,211,153,0.05))`,
        border: `1px solid ${PALETTE.borderLight}`,
        borderRadius: 16, padding: 24,
        transition: "border-color 0.2s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.accent + "66")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: PALETTE.textDim }}>Carbon Intensity</div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 36, marginTop: 8, color: PALETTE.accent }}>
              {intensityVal.toFixed(6)}
            </div>
            <div style={{ color: PALETTE.textMuted, fontSize: 12, marginTop: 4 }}>tCO₂e per kWh consumed</div>
            <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>
              Normalized metric for cross-facility benchmarking. Lower is better.
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: PALETTE.textDim, marginBottom: 14 }}>
              vs Industry Benchmark
            </div>

            {/* Current bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: PALETTE.textMuted }}>Current</span>
                <span style={{ fontSize: 11, fontFamily: font, color: aboveBenchmark ? PALETTE.danger : PALETTE.accent }}>
                  {intensityVal.toFixed(6)}
                </span>
              </div>
              <div style={{ height: 10, background: PALETTE.border, borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(currentBarWidth, 100).toFixed(1)}%`,
                  height: "100%",
                  background: aboveBenchmark ? PALETTE.danger : PALETTE.accent,
                  borderRadius: 5,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* Benchmark bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: PALETTE.textMuted }}>Benchmark</span>
                <span style={{ fontSize: 11, fontFamily: font, color: PALETTE.textDim }}>{benchmarkVal.toFixed(6)}</span>
              </div>
              <div style={{ height: 10, background: PALETTE.border, borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  width: `${benchmarkBarWidth.toFixed(1)}%`,
                  height: "100%",
                  background: PALETTE.textDim,
                  borderRadius: 5,
                }} />
              </div>
            </div>

            {/* Text indicator */}
            <div style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: aboveBenchmark ? "rgba(239,68,68,0.1)" : PALETTE.accentGlow,
              color: aboveBenchmark ? PALETTE.danger : PALETTE.accent,
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 8,
            }}>
              {Math.abs(benchmarkDiffPct)}% {aboveBenchmark ? "above benchmark" : "below benchmark"} {aboveBenchmark ? "" : "— good performance"}
            </div>

            {/* Source note */}
            <div style={{ fontSize: 10, color: PALETTE.textDim, lineHeight: 1.6 }}>
              Benchmark source: UK DEFRA SME Automotive Sector Average 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
