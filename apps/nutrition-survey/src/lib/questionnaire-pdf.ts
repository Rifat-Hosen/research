"use client";

import {
  surveySections,
  type SurveyField,
} from "@workspace/backend/convex/survey/questionnaire";

const visibleSections = surveySections.filter(
  (section) => section.id !== "metadata",
);

const pageWidth = 595.28;
const pageHeight = 841.89;
const marginX = 34;
const headerHeight = 34;
const columnGap = 16;
const columnCount = 2;
const contentWidth = pageWidth - marginX * 2;
const columnWidth =
  (contentWidth - columnGap * (columnCount - 1)) / columnCount;
const contentTop = pageHeight - headerHeight - 16;
const contentBottom = 30;

const brandGreen = "0.06 0.40 0.27";
const bandGreen = "0.90 0.955 0.925";
const darkText = "0.09 0.11 0.15";
const optionText = "0.20 0.24 0.30";
const mutedText = "0.40 0.44 0.50";
const ruleGrey = "0.70 0.74 0.78";
const requiredRed = "0.78 0.24 0.24";

/** Helvetica advance widths (per 1000 units) for ASCII 32-126. */
const helvetica = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015,
  667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667,
  778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  278, 278, 278, 469, 556, 333,
  556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556,
  556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
  334, 260, 334, 584,
];

/** Helvetica-Bold advance widths (per 1000 units) for ASCII 32-126. */
const helveticaBold = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  333, 333, 584, 584, 584, 611, 975,
  722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667,
  778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  333, 278, 333, 584, 556, 333,
  556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611,
  611, 389, 556, 333, 611, 556, 778, 556, 556, 500,
  389, 280, 389, 584,
];

function cleanText(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/[^\x20-\x7E]/g, " ");
}

function escapePdfText(value: string) {
  return cleanText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/** Measured width in points, so wrapping matches what actually renders. */
function measure(value: string, size: number, bold = false) {
  const widths = bold ? helveticaBold : helvetica;
  let total = 0;
  const text = cleanText(value);
  for (let index = 0; index < text.length; index += 1) {
    total += widths[text.charCodeAt(index) - 32] ?? 556;
  }
  return (total * size) / 1000;
}

function wrap(value: string, maxWidth: number, size: number, bold = false) {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, bold) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/**
 * Wrap where the first line is shortened by an already-drawn prefix (the
 * question number) and later lines are indented to line up under the text.
 */
function wrapIndented(
  value: string,
  firstWidth: number,
  restWidth: number,
  size: number,
) {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    const limit = lines.length === 0 ? firstWidth : restWidth;
    if (line && measure(next, size) > limit) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

type Page = string[];

const fullColumnHeight = contentTop - contentBottom;

class Doc {
  pages: Page[] = [];
  ops: Page = [];
  y = contentTop;
  column = 0;
  /** Where columns begin on this page; page 1 starts below the title block. */
  columnStartY = contentTop;
  /** How much of each column to fill before wrapping, used to balance columns. */
  columnTarget: number;

  constructor(columnTarget = fullColumnHeight) {
    this.columnTarget = columnTarget;
    this.pages.push(this.ops);
  }

  get x() {
    return marginX + this.column * (columnWidth + columnGap);
  }

  breakPage() {
    this.ops = [];
    this.pages.push(this.ops);
    this.column = 0;
    this.columnStartY = contentTop;
    this.y = contentTop;
  }

  /** Move to the next column, or the next page once columns run out. */
  nextColumn() {
    if (this.column < columnCount - 1) {
      this.column += 1;
      this.y = this.columnStartY;
    } else {
      this.breakPage();
    }
  }

  /** Advance the flow when the next block will not fit in this column. */
  reserve(height: number) {
    const limit = Math.max(
      contentBottom,
      this.columnStartY - this.columnTarget,
    );
    if (this.y - height < limit) this.nextColumn();
  }

  text(
    value: string,
    x: number,
    y: number,
    size: number,
    color = darkText,
    bold = false,
  ) {
    this.ops.push(
      `${color} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(value)}) Tj ET`,
    );
  }

  rect(x: number, y: number, width: number, height: number, color: string) {
    this.ops.push(
      `${color} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`,
    );
  }

  line(x: number, y: number, width: number, color = ruleGrey, thickness = 0.6) {
    this.ops.push(
      `${color} RG ${thickness} w ${x.toFixed(2)} ${y.toFixed(2)} m ${(x + width).toFixed(2)} ${y.toFixed(2)} l S`,
    );
  }

  checkbox(x: number, y: number, size: number) {
    this.ops.push(
      `0.97 0.985 0.975 rg ${x.toFixed(2)} ${y.toFixed(2)} ${size} ${size} re f`,
    );
    this.ops.push(
      `${brandGreen} RG 0.65 w ${x.toFixed(2)} ${y.toFixed(2)} ${size} ${size} re S`,
    );
  }
}

const questionSize = 10.8;
const optionSize = 9.8;
const questionLeading = 13.1;
const optionLeading = 14;
const boxSize = 8.4;
const optionGap = 8;
const answerIndent = 10;

/** Lay out one field's options into rows that fit the column width. */
function optionRows(field: SurveyField) {
  const available = columnWidth - answerIndent;
  const rows: { label: string; width: number }[][] = [];
  let row: { label: string; width: number }[] = [];
  let used = 0;

  for (const option of field.options ?? []) {
    const width = boxSize + 4 + measure(option.label, optionSize) + optionGap;
    if (row.length && used + width > available) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ label: option.label, width });
    used += width;
  }

  if (row.length) rows.push(row);
  return rows;
}

function answerRuleCount(field: SurveyField) {
  if (field.type === "textarea") return 3;
  return 1;
}

function fieldHeight(field: SurveyField, questionLines: number) {
  const head = questionLines * questionLeading;
  if (field.options?.length) {
    return head + optionRows(field).length * optionLeading + 5;
  }
  return head + answerRuleCount(field) * 14 + 4;
}

function drawField(doc: Doc, field: SurveyField) {
  const prefix = `${field.id}.`;
  const prefixWidth = measure(prefix, questionSize, true) + 4;
  const unit = field.unit ? ` (${field.unit})` : "";
  const label = `${field.label}${unit}`;
  // Leave room for the required marker drawn after the final line.
  const textWidth = columnWidth - prefixWidth - (field.required ? 8 : 0);

  const lines = wrapIndented(label, textWidth, textWidth, questionSize);

  doc.reserve(fieldHeight(field, lines.length));
  const left = doc.x;

  lines.forEach((line, index) => {
    if (index === 0) {
      doc.text(prefix, left, doc.y, questionSize, brandGreen, true);
    }
    doc.text(line, left + prefixWidth, doc.y, questionSize);
    if (field.required && index === lines.length - 1) {
      doc.text(
        "*",
        left + prefixWidth + measure(line, questionSize) + 2,
        doc.y,
        questionSize,
        requiredRed,
        true,
      );
    }
    doc.y -= questionLeading;
  });

  if (field.options?.length) {
    for (const row of optionRows(field)) {
      let x = left + answerIndent;
      for (const option of row) {
        doc.checkbox(x, doc.y - 1, boxSize);
        doc.text(option.label, x + boxSize + 3, doc.y, optionSize, optionText);
        x += option.width;
      }
      doc.y -= optionLeading;
    }
    doc.y -= 4;
    return;
  }

  // Open-value answers get real rules to write on.
  if (field.id === "A15") {
    const segment = 58;
    doc.line(left + answerIndent, doc.y - 2, segment);
    doc.text("ft", left + answerIndent + segment + 4, doc.y, optionSize, mutedText);
    const second = left + answerIndent + segment + 20;
    doc.line(second, doc.y - 2, segment);
    doc.text("inch", second + segment + 4, doc.y, optionSize, mutedText);
    doc.y -= 14;
  } else {
    const rules = answerRuleCount(field);
    const unitWidth = field.unit ? measure(field.unit, optionSize) + 8 : 0;
    const width =
      field.type === "textarea"
        ? columnWidth - answerIndent
        : Math.min(150, columnWidth - answerIndent - unitWidth);
    for (let index = 0; index < rules; index += 1) {
      doc.line(left + answerIndent, doc.y - 2, width);
      if (index === 0 && field.unit && field.type !== "textarea") {
        doc.text(
          field.unit,
          left + answerIndent + width + 5,
          doc.y,
          optionSize,
          mutedText,
        );
      }
      doc.y -= 14;
    }
  }

  doc.y -= 4;
}

function buildDocument(columnTarget = fullColumnHeight) {
  const doc = new Doc(columnTarget);

  // Title block spans both columns on the first page only.
  doc.text(
    "Nutrition Assessment Questionnaire",
    marginX,
    doc.y,
    15,
    brandGreen,
    true,
  );
  doc.y -= 14;
  doc.text(
    "Healthy Eating Index and BMI among Adults",
    marginX,
    doc.y,
    9.6,
    "0.24 0.28 0.34",
  );
  doc.y -= 9;
  doc.rect(marginX, doc.y, 46, 2.2, brandGreen);
  doc.line(marginX + 52, doc.y + 1, contentWidth - 52, "0.87 0.90 0.92", 0.7);
  doc.y -= 14;

  // Columns on page 1 start below the title block.
  doc.columnStartY = doc.y;

  for (const section of visibleSections) {
    // Keep a section heading with at least the start of its first question.
    doc.reserve(62);

    doc.rect(doc.x - 5, doc.y - 5.5, columnWidth + 10, 19, bandGreen);
    doc.rect(doc.x - 5, doc.y - 5.5, 2.6, 19, brandGreen);
    doc.text(section.title, doc.x + 1, doc.y, 11.4, "0.02 0.30 0.20", true);
    doc.y -= 24;

    if (section.description) {
      for (const line of wrap(section.description, columnWidth, 7.6)) {
        doc.text(line, doc.x, doc.y, 7.6, mutedText);
        doc.y -= 9;
      }
      doc.y -= 4;
    }

    for (const field of section.fields) {
      drawField(doc, field);
    }

    doc.y -= 6;
  }

  return doc.pages;
}

function decoratePage(ops: Page, pageNumber: number, pageCount: number) {
  const chrome: string[] = [
    `1 1 1 rg 0 0 ${pageWidth} ${pageHeight} re f`,
    `${brandGreen} rg 0 ${pageHeight - headerHeight} ${pageWidth} ${headerHeight} re f`,
    `1 1 1 rg BT /F2 9.5 Tf ${marginX} ${pageHeight - 22} Td (Nutrition Assessment Survey) Tj ET`,
  ];

  const label = `Page ${pageNumber} of ${pageCount}`;
  const labelX = pageWidth - marginX - measure(label, 8);
  chrome.push(
    `0.85 0.93 0.89 rg BT /F1 8 Tf ${labelX.toFixed(2)} ${pageHeight - 22} Td (${escapePdfText(label)}) Tj ET`,
  );

  // Divider between the two columns.
  const dividerX = marginX + columnWidth + columnGap / 2;
  chrome.push(
    `0.88 0.91 0.93 RG 0.6 w ${dividerX.toFixed(2)} ${contentBottom - 4} m ${dividerX.toFixed(2)} ${(pageHeight - headerHeight - 8).toFixed(2)} l S`,
  );

  return [...chrome, ...ops].join("\n");
}

const maxPages = 2;

/**
 * Fill each column only as much as needed, so the last column is not left
 * empty. Uses the tightest column height that still fits within maxPages,
 * falling back to full-height columns if the content cannot be squeezed in.
 */
function layoutWithinPageLimit() {
  const full = buildDocument();
  if (full.length > maxPages) return full;

  let best = full;
  for (let target = 240; target <= fullColumnHeight; target += 4) {
    const attempt = buildDocument(target);
    if (attempt.length <= maxPages) {
      best = attempt;
      break;
    }
  }

  return best;
}

function createPdfBlob() {
  const pages = layoutWithinPageLimit();
  const contents = pages.map((ops, index) =>
    decoratePage(ops, index + 1, pages.length),
  );

  const pageCount = pages.length;
  const fontRegular = 3 + pageCount * 2;
  const fontBold = fontRegular + 1;
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);

  contents.forEach((content, index) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${4 + index * 2} 0 R >>`,
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

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
  anchor.download = "nutrition-assessment-questionnaire.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

export { visibleSections as questionnairePreviewSections };
