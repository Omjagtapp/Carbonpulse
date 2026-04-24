import { PALETTE } from "../data/mockData.js";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";

export default function InsightsPanel({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 16 }}>Recommended Actions</div>
          <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 2 }}>
            AI-assisted insights based on current period data
          </div>
        </div>
        <div style={{
          fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
          background: PALETTE.accentGlow, color: PALETTE.accent,
          padding: "3px 8px", borderRadius: 6, fontWeight: 600,
        }}>
          {insights.length} insights
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {insights.map((insight, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 16px",
              background: PALETTE.accentGlow2,
              borderRadius: 12,
              border: `1px solid ${PALETTE.border}`,
              borderLeft: `3px solid ${insight.color}`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = PALETTE.borderLight)}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = PALETTE.border;
              e.currentTarget.style.borderLeftColor = insight.color;
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: insight.color,
                boxShadow: `0 0 8px ${insight.color}`,
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: PALETTE.text, lineHeight: 1.5, marginBottom: 4, fontFamily: font }}>
                {insight.title}
              </div>
              <div style={{ fontSize: 11, color: PALETTE.textMuted, lineHeight: 1.5 }}>
                → {insight.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
