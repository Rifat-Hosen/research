"use client";

import { surveySections } from "@workspace/backend/convex/survey/questionnaire";

const visibleSections = surveySections.filter(
  (section) => section.id !== "metadata",
);

type PdfLineKind = "title" | "meta" | "section" | "description" | "field" | "option";
type PdfLine = { text: string; kind: PdfLineKind; options?: string[] };

const a4Width = 595.28;
const a4Height = 841.89;
const pageTop = 807;
const pageBottom = 28;

function cleanText(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[≥]/g, ">=")
    .replace(/[≤]/g, "<=")
    .replace(/[^\x20-\x7E]/g, " ");
}

function escapePdfText(value: string) {
  return cleanText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text: string, maxChars: number) {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function manualAnswerText(field: (typeof visibleSections)[number]["fields"][number]) {
  if (field.options?.length) {
    return field.options.map((option) => option.label);
  }

  if (field.type === "textarea") {
    return "Answer: ______________________________________________";
  }

  if (field.id === "A15") {
    return "Answer: _____ ft _____ inch";
  }

  return "Answer: ____________________";
}

function chunkOptions(options: string[]) {
  const rows: string[][] = [];
  let row: string[] = [];
  let rowWidth = 0;
  const maxWidth = 70;

  for (const option of options) {
    const optionWidth = Math.min(32, option.length + 4);
    if (row.length && rowWidth + optionWidth > maxWidth) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }

    row.push(option);
    rowWidth += optionWidth;
  }

  if (row.length) rows.push(row);
  return rows;
}

function questionnaireLines() {
  const lines: PdfLine[] = [
    {
      text: "Nutrition Assessment Survey",
      kind: "title",
    },
    {
      text: "Healthy Eating Index, Double Burden of Malnutrition and BMI among Adults",
      kind: "meta",
    },
    {
      text: "Manual paper form: tick one option where options are provided; write values in blank spaces.",
      kind: "meta",
    },
  ];

  for (const section of visibleSections) {
    lines.push({ text: section.title, kind: "section" });

    if (section.description) {
      for (const line of wrapText(section.description, 72).slice(0, 2)) {
        lines.push({ text: line, kind: "description" });
      }
    }

    for (const field of section.fields) {
      const required = field.required ? " *" : "";
      const unit = field.unit ? ` (${field.unit})` : "";
      const question = `${field.id}. ${field.label}${unit}${required}`;
      for (const line of wrapText(question, 70)) {
        lines.push({ text: line, kind: "field" });
      }

      const answer = manualAnswerText(field);
      if (Array.isArray(answer)) {
        for (const optionRow of chunkOptions(answer)) {
          lines.push({ text: "", kind: "option", options: optionRow });
        }
      } else {
        for (const line of wrapText(answer, 76)) {
          lines.push({ text: line, kind: "option" });
        }
      }
    }
  }

  return lines;
}

function splitIntoTwoPages(lines: PdfLine[]) {
  const splitAt = Math.ceil(lines.length / 2);
  return [lines.slice(0, splitAt), lines.slice(splitAt)];
}

function buildContent(pageLines: PdfLine[], pageNumber: number) {
  const columns = [
    { x: 18, y: pageTop },
    { x: 207, y: pageTop },
    { x: 396, y: pageTop },
  ];
  const linesPerColumn = Math.ceil(pageLines.length / 3);
  const lineHeight = (pageTop - pageBottom) / Math.max(linesPerColumn - 1, 1);
  const ops: string[] = [
    `0.985 0.995 0.99 rg 0 0 ${a4Width} ${a4Height} re f`,
    `0.08 0.42 0.28 rg 0 824 ${a4Width} 18 re f`,
    "1 1 1 rg BT /F1 8 Tf 24 830 Td (Nutrition Assessment Survey - Manual Form) Tj ET",
    `1 1 1 rg BT /F1 5 Tf 542 830 Td (Page ${pageNumber}/2) Tj ET`,
    "0.78 0.85 0.82 rg 196 24 1 784 re f",
    "0.78 0.85 0.82 rg 385 24 1 784 re f",
  ];

  pageLines.forEach((line, index) => {
    const columnIndex = Math.min(2, Math.floor(index / linesPerColumn));
    const rowIndex = index - columnIndex * linesPerColumn;
    const column = columns[columnIndex];
    const x = column.x;
    const y = column.y - rowIndex * lineHeight;

    if (line.kind === "title") {
      ops.push(`0.03 0.25 0.17 rg BT /F1 7 Tf ${x} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
      return;
    }

    if (line.kind === "meta") {
      ops.push(`0.26 0.30 0.36 rg BT /F1 4.9 Tf ${x} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
      return;
    }

    if (line.kind === "section") {
      ops.push(`0.82 0.93 0.88 rg ${x - 2} ${y - 2} 174 7.5 re f`);
      ops.push(`0.02 0.30 0.20 rg BT /F1 5.6 Tf ${x} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
      return;
    }

    if (line.kind === "description") {
      ops.push(`0.35 0.39 0.45 rg BT /F1 4.35 Tf ${x} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
      return;
    }

    if (line.kind === "option") {
      if (line.options?.length) {
        let currentX = x + 4;
        const optionGap = 8;

        for (const option of line.options) {
          const optionWidth = Math.min(78, option.length * 2.25 + 10);
          ops.push(`0.98 1 0.99 rg ${currentX} ${y - 1.5} 4 4 re f`);
          ops.push(`0.08 0.42 0.28 RG ${currentX} ${y - 1.5} 4 4 re S`);
          ops.push(`0.24 0.28 0.34 rg BT /F1 4.25 Tf ${currentX + 6} ${y} Td (${escapePdfText(option)}) Tj ET`);
          currentX += optionWidth + optionGap;
        }
        return;
      }

      ops.push(`0.28 0.32 0.38 rg BT /F1 4.35 Tf ${x + 5} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
      return;
    }

    ops.push(`0.08 0.10 0.14 rg BT /F1 4.75 Tf ${x} ${y} Td (${escapePdfText(line.text)}) Tj ET`);
  });

  return ops.join("\n");
}

function createPdfBlob() {
  const pages = splitIntoTwoPages(questionnaireLines());
  const contents = pages.map((page, index) => buildContent(page, index + 1));
  const objects: string[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>");
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${a4Width} ${a4Height}] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>`);
  objects.push(`<< /Length ${contents[0].length} >>\nstream\n${contents[0]}\nendstream`);
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${a4Width} ${a4Height}] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>`);
  objects.push(`<< /Length ${contents[1].length} >>\nstream\n${contents[1]}\nendstream`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadQuestionnairePdf() {
  const blob = createPdfBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nutrition-assessment-questionnaire-2-page-manual-v2.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

export { visibleSections as questionnairePreviewSections };
