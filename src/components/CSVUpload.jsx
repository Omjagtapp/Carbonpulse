import { useState, useRef } from "react";
import { PALETTE, KNOWN_SOURCES, EXPECTED_UNITS } from "../data/mockData.js";
import { generateSampleCSV } from "../utils/exports.js";

const font = "'JetBrains Mono', monospace";
const fontDisplay = "'Space Grotesk', sans-serif";

function normalizeSource(src) {
  const s = src.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (s === "electricity") return "electricity";
  if (s === "naturalgas" || s === "natural_gas") return "naturalGas";
  if (s === "diesel" || s === "gas oil") return "diesel";
  return null;
}

function validateRow(row) {
  const { source, usage, unit } = row;
  if (!source || !usage || !unit) return "missing";
  const normalSrc = normalizeSource(source);
  if (!normalSrc) return "invalid-source";
  const usageNum = parseFloat(usage);
  if (isNaN(usageNum) || usageNum <= 0) return "invalid-usage";
  const expectedUnits = EXPECTED_UNITS[normalSrc] || [];
  if (!expectedUnits.some((u) => u.toLowerCase() === unit.trim().toLowerCase())) return "invalid-unit";
  return "valid";
}

export default function CSVUpload({ onDataParsed }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [rows, setRows] = useState([]);
  const [validation, setValidation] = useState(null);
  const [status, setStatus] = useState(null); // 'validated' | 'needs-review' | 'invalid'
  const inputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });
      return row;
    });
  };

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      setRows(parsed);

      let validCount = 0;
      let missingCount = 0;
      let invalidUnitCount = 0;
      let excludedCount = 0;

      const validatedRows = parsed.map((row) => {
        const result = validateRow(row);
        if (result === "valid") validCount++;
        else if (result === "missing") missingCount++;
        else if (result === "invalid-unit") invalidUnitCount++;
        else excludedCount++;
        return { ...row, _status: result };
      });

      setValidation({ valid: validCount, missing: missingCount, invalidUnit: invalidUnitCount, excluded: excludedCount, rows: validatedRows });

      const totalIssues = missingCount + invalidUnitCount + excludedCount;
      if (validCount === 0) setStatus("invalid");
      else if (totalIssues > 0) setStatus("needs-review");
      else setStatus("validated");

      // Auto-populate inputs from valid rows
      if (validCount > 0 && onDataParsed) {
        const newInputs = {};
        validatedRows.forEach((row) => {
          if (row._status === "valid") {
            const normalSrc = normalizeSource(row.source);
            if (normalSrc) newInputs[normalSrc] = parseFloat(row.usage);
          }
        });
        if (Object.keys(newInputs).length > 0) onDataParsed(newInputs);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) processFile(file);
  };

  const statusConfig = {
    validated: { color: PALETTE.accent, label: "Validated", bg: PALETTE.accentGlow },
    "needs-review": { color: PALETTE.amber, label: "Needs Review", bg: "rgba(245,158,11,0.12)" },
    invalid: { color: PALETTE.danger, label: "Invalid", bg: "rgba(239,68,68,0.1)" },
  };

  return (
    <div style={{
      background: PALETTE.card,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 16,
      padding: 24,
      marginBottom: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 18 }}>Upload Activity Data</div>
          <div style={{ color: PALETTE.textDim, fontSize: 11, marginTop: 4 }}>
            Import a CSV to auto-populate the input fields below
          </div>
        </div>
        <button
          onClick={generateSampleCSV}
          style={{
            background: "transparent",
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 8,
            padding: "6px 12px",
            color: PALETTE.textMuted,
            fontFamily: font,
            fontSize: 11,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = PALETTE.accent; e.currentTarget.style.color = PALETTE.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = PALETTE.border; e.currentTarget.style.color = PALETTE.textMuted; }}
        >
          ↓ Download Template
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? PALETTE.accent : PALETTE.border}`,
          borderRadius: 12,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          background: dragging ? PALETTE.accentGlow : "transparent",
          marginBottom: 16,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => processFile(e.target.files[0])}
        />
        {/* Upload icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10, opacity: 0.5 }}>
          <path d="M12 15V3m0 0L8 7m4-4l4 4" stroke={PALETTE.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4" stroke={PALETTE.textDim} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div style={{ fontSize: 13, color: PALETTE.textMuted, marginBottom: 4 }}>
          {fileName ? fileName : "Drop CSV or click to browse"}
        </div>
        <div style={{ fontSize: 11, color: PALETTE.textDim }}>
          Expected columns: source, usage, unit
        </div>
      </div>

      {/* Validation summary */}
      {validation && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: PALETTE.textMuted, fontFamily: font }}>
              Validation Summary — {validation.rows.length} rows
            </div>
            {status && (
              <div style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                background: statusConfig[status].bg,
                color: statusConfig[status].color,
                fontFamily: font,
              }}>
                {statusConfig[status].label}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { icon: "✓", label: "Valid rows", val: validation.valid, color: PALETTE.accent },
              { icon: "⚠", label: "Missing values", val: validation.missing, color: PALETTE.amber },
              { icon: "✗", label: "Invalid units", val: validation.invalidUnit, color: PALETTE.danger },
              { icon: "—", label: "Excluded", val: validation.excluded, color: PALETTE.textDim },
            ].map((v) => (
              <div key={v.label} style={{
                background: PALETTE.accentGlow2,
                borderRadius: 8,
                padding: "10px 12px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 16, color: v.color, marginBottom: 4 }}>{v.icon}</div>
                <div style={{ fontFamily: font, fontWeight: 700, fontSize: 18, color: v.color }}>{v.val}</div>
                <div style={{ fontSize: 10, color: PALETTE.textDim, marginTop: 2 }}>{v.label}</div>
              </div>
            ))}
          </div>

          {/* Preview table */}
          {validation.rows.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: PALETTE.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Preview (up to 5 rows)
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: PALETTE.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {["Source", "Usage", "Unit", "Status"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${PALETTE.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validation.rows.slice(0, 5).map((row, i) => {
                      const isValid = row._status === "valid";
                      const statusColors = {
                        valid: PALETTE.accent,
                        missing: PALETTE.amber,
                        "invalid-unit": PALETTE.danger,
                        "invalid-source": PALETTE.danger,
                        "invalid-usage": PALETTE.amber,
                      };
                      const statusLabels = {
                        valid: "✓ Valid",
                        missing: "⚠ Missing",
                        "invalid-unit": "✗ Invalid unit",
                        "invalid-source": "✗ Unknown source",
                        "invalid-usage": "⚠ Bad value",
                      };
                      return (
                        <tr key={i} style={{ opacity: isValid ? 1 : 0.7 }}>
                          <td style={{ padding: "8px 8px", borderBottom: `1px solid ${PALETTE.border}`, fontFamily: font }}>{row.source || "—"}</td>
                          <td style={{ padding: "8px 8px", borderBottom: `1px solid ${PALETTE.border}`, fontFamily: font }}>{row.usage || "—"}</td>
                          <td style={{ padding: "8px 8px", borderBottom: `1px solid ${PALETTE.border}`, fontFamily: font }}>{row.unit || "—"}</td>
                          <td style={{ padding: "8px 8px", borderBottom: `1px solid ${PALETTE.border}` }}>
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 5, fontWeight: 600,
                              color: statusColors[row._status] || PALETTE.textDim,
                              background: `${statusColors[row._status]}22` || "transparent",
                            }}>
                              {statusLabels[row._status] || row._status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!validation && (
        <div style={{ textAlign: "center", padding: "12px 0", color: PALETTE.textDim, fontSize: 11 }}>
          No file uploaded yet. Download the template above to get started.
        </div>
      )}
    </div>
  );
}
