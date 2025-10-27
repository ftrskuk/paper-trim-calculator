import type { CalculatorSnapshot } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type ExportPayload = CalculatorSnapshot & {
  setWidthSums: number[];
  setWeightSums: number[];
};

export function exportToExcel(data: ExportPayload) {
  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Mill", data.mill],
    ["Substance (g/m²)", data.substance],
    ["Roll length (m)", data.length],
  ]);

  const setSummary = [
    ["Set", "Multiplier", "Width Sum", "Weight (tons)"],
    ...data.sets.map((set, index) => [
      `Set ${index + 1}`,
      set.multiplier,
      data.setWidthSums[index] ?? 0,
      (data.setWeightSums[index] ?? 0).toFixed(3),
    ]),
  ];

  const rollDetails = [
    ["Width (mm)", "Required Tons", ...data.sets.map((_, i) => `Set ${i + 1}`)],
    ...data.rolls.map((roll) => [
      roll.width || "",
      roll.requiredTons || "",
      ...roll.quantities,
    ]),
  ];

  const setSheet = XLSX.utils.aoa_to_sheet(setSummary);
  const rollSheet = XLSX.utils.aoa_to_sheet(rollDetails);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Overview");
  XLSX.utils.book_append_sheet(workbook, setSheet, "Set Summary");
  XLSX.utils.book_append_sheet(workbook, rollSheet, "Roll Details");

  XLSX.writeFile(workbook, `trim-calculation-${Date.now()}.xlsx`);
}

export function exportToPdf(data: ExportPayload) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Paper Trim Calculation", 14, 20);
  doc.setFontSize(10);
  doc.text(`Mill: ${data.mill}`, 14, 28);
  doc.text(`Substance: ${data.substance} g/m²`, 14, 34);
  doc.text(`Roll length: ${data.length} m`, 14, 40);

  autoTable(doc, {
    head: [["Set", "Multiplier", "Width Sum", "Weight (tons)"]],
    body: data.sets.map((set, index) => [
      `Set ${index + 1}`,
      set.multiplier,
      data.setWidthSums[index] ?? 0,
      (data.setWeightSums[index] ?? 0).toFixed(3),
    ]),
    startY: 48,
    theme: "striped",
  });

  autoTable(doc, {
    head: [["Width (mm)", "Required Tons", ...data.sets.map((_, i) => `Set ${i + 1}`)]],
    body: data.rolls.map((roll) => [
      roll.width || "",
      roll.requiredTons || "",
      ...roll.quantities,
    ]),
    startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 48,
    theme: "grid",
  });

  doc.save(`trim-calculation-${Date.now()}.pdf`);
}

