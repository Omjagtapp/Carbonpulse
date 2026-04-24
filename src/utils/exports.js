// Export utilities — PDF, CSV, GHG Protocol, Clipboard
// Preserves original export logic, extended with improved UI state

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EMISSION_FACTORS } from "../data/mockData.js";

export function exportCSV({ inputs, emissions, totalKg, totalTons, scope1Tons, scope2Tons, creditsNeeded, creditCostLow, creditCostHigh, company }) {
  const rows = [
    ["CarbonPulse Emissions Report", "", "", ""],
    ["Reporting Entity", company, "", ""],
    ["Period", "March 2026", "", ""],
    ["Generated", new Date().toLocaleString(), "", ""],
    ["", "", "", ""],
    ["Source", "Usage", "Unit", "Emission Factor (kg/unit)", "Emissions (kg)", "Emissions (tCO2e)", "Scope"],
    ...Object.entries(EMISSION_FACTORS).map(([key, { label, unit, factor, scope }]) => [
      label,
      inputs[key],
      unit,
      factor,
      emissions[key].toFixed(2),
      (emissions[key] / 1000).toFixed(4),
      `Scope ${scope}`,
    ]),
    ["", "", "", "", "", "", ""],
    ["TOTAL", "", "", "", totalKg.toFixed(2), totalTons.toFixed(4), ""],
    ["Scope 1 Total", "", "", "", "", scope1Tons.toFixed(4), ""],
    ["Scope 2 Total", "", "", "", "", scope2Tons.toFixed(4), ""],
    ["", "", "", "", "", "", ""],
    ["Carbon Credits Required", creditsNeeded, "", "", "", "", ""],
    ["Estimated Cost (Low $10/credit)", `$${creditCostLow}`, "", "", "", "", ""],
    ["Estimated Cost (High $15/credit)", `$${creditCostHigh}`, "", "", "", "", ""],
  ];
  const csvContent = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
  downloadBlob(csvContent, "text/csv;charset=utf-8;", `CarbonPulse_March2026_${company.replace(/\s+/g, "_")}.csv`);
}

export function exportGHGCSV({ inputs, emissions, scope1Tons, scope2Tons, totalTons, company }) {
  const rows = [
    ["GHG Protocol Corporate Standard — Activity Data Template", "", "", ""],
    ["Company", company, "", ""],
    ["Reporting Period", "March 2026", "", ""],
    ["", "", "", ""],
    ["Category", "Emission Source", "Activity Data", "Unit", "Emission Factor", "GHG Emissions (tCO2e)", "Scope"],
    ["Stationary Combustion", "Natural Gas", inputs.naturalGas, "therms", "5.3 kg/therm", (emissions.naturalGas / 1000).toFixed(4), "Scope 1"],
    ["Mobile Combustion", "Diesel", inputs.diesel, "gallons", "10.2 kg/gallon", (emissions.diesel / 1000).toFixed(4), "Scope 1"],
    ["Purchased Electricity", "Grid Electricity", inputs.electricity, "kWh", "0.4 kg/kWh", (emissions.electricity / 1000).toFixed(4), "Scope 2"],
    ["", "", "", "", "", "", ""],
    ["SCOPE 1 TOTAL", "", "", "", "", scope1Tons.toFixed(4), ""],
    ["SCOPE 2 TOTAL", "", "", "", "", scope2Tons.toFixed(4), ""],
    ["GRAND TOTAL", "", "", "", "", totalTons.toFixed(4), ""],
  ];
  const csvContent = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
  downloadBlob(csvContent, "text/csv;charset=utf-8;", `GHGProtocol_Template_${company.replace(/\s+/g, "_")}.csv`);
}

export function exportPDF({ inputs, emissions, totalKg, totalTons, scope1Tons, scope2Tons, creditsNeeded, creditCostLow, creditCostHigh, momChange, intensity, company }) {
  const doc = new jsPDF();
  const green = [52, 211, 153];
  const dark = [17, 25, 22];
  const muted = [122, 153, 136];

  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(...green);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CarbonPulse", 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("Scope 1 & 2 Emissions Report — March 2026", 14, 24);
  doc.text(`Reporting Entity: ${company}`, 14, 31);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);

  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Emissions Summary", 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [["Metric", "Value"]],
    body: [
      ["Total Emissions", `${totalTons.toFixed(2)} tCO₂e`],
      ["Scope 1 (Direct)", `${scope1Tons.toFixed(2)} tCO₂e`],
      ["Scope 2 (Indirect)", `${scope2Tons.toFixed(2)} tCO₂e`],
      ["Month-over-Month Change", `${momChange > 0 ? "+" : ""}${momChange.toFixed(1)}%`],
      ["Carbon Intensity", `${intensity} tCO₂e/kWh`],
    ],
    headStyles: { fillColor: green, textColor: dark, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 248, 244] },
    styles: { fontSize: 10 },
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Activity Data & Calculations", 14, doc.lastAutoTable.finalY + 14);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [["Source", "Scope", "Usage", "Unit", "Factor (kg/unit)", "Emissions (kg)", "Emissions (tCO₂e)"]],
    body: Object.entries(EMISSION_FACTORS).map(([key, { label, unit, factor, scope }]) => [
      label,
      `Scope ${scope}`,
      inputs[key].toLocaleString(),
      unit,
      factor,
      emissions[key].toLocaleString(),
      (emissions[key] / 1000).toFixed(4),
    ]),
    foot: [["TOTAL", "", "", "", "", totalKg.toLocaleString(), totalTons.toFixed(4)]],
    headStyles: { fillColor: green, textColor: dark, fontStyle: "bold" },
    footStyles: { fillColor: dark, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 248, 244] },
    styles: { fontSize: 9 },
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Carbon Credit Offset Estimate", 14, doc.lastAutoTable.finalY + 14);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head: [["Item", "Value"]],
    body: [
      ["Credits Required (1 credit = 1 tCO₂e)", `${creditsNeeded} credits`],
      ["Market Price Range", "$10 – $15 per credit"],
      ["Low Estimate", `$${creditCostLow.toLocaleString()}`],
      ["High Estimate", `$${creditCostHigh.toLocaleString()}`],
    ],
    headStyles: { fillColor: green, textColor: dark, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 248, 244] },
    styles: { fontSize: 10 },
  });

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("CarbonPulse · Prototype · Not for regulatory submission", 14, 285);
  doc.text("Emission factors: EPA eGRID 2024 · GHG Protocol methodology", 14, 290);

  doc.save(`CarbonPulse_Report_March2026_${company.replace(/\s+/g, "_")}.pdf`);
}

export function exportClipboard({ totalTons, scope1Tons, scope2Tons, momChange, intensity, creditsNeeded, creditCostLow, creditCostHigh, company }) {
  const text = [
    "CarbonPulse — Emissions Summary",
    `Reporting Entity: ${company}`,
    `Period: March 2026`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Total Emissions: ${totalTons.toFixed(2)} tCO₂e`,
    `Scope 1 (Direct): ${scope1Tons.toFixed(2)} tCO₂e`,
    `Scope 2 (Indirect): ${scope2Tons.toFixed(2)} tCO₂e`,
    `Month-over-Month: ${momChange > 0 ? "+" : ""}${momChange.toFixed(1)}%`,
    `Carbon Intensity: ${intensity} tCO₂e/kWh`,
    "",
    `Carbon Credits Required: ${creditsNeeded}`,
    `Estimated Cost: $${creditCostLow.toLocaleString()} – $${creditCostHigh.toLocaleString()}`,
    "",
    "Source: EPA eGRID 2024 · GHG Protocol methodology",
  ].join("\n");

  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateSampleCSV() {
  const content = [
    "source,usage,unit",
    "electricity,120000,kWh",
    "naturalGas,1500,therms",
    "diesel,300,gallons",
  ].join("\n");
  downloadBlob(content, "text/csv;charset=utf-8;", "CarbonPulse_Activity_Template.csv");
}
