"use client";

export function downloadSurveyRows(rows: Record<string, unknown>[]) {
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );
  const escapeCell = (value: unknown) => {
    const text = Array.isArray(value)
      ? value.join("; ")
      : value == null
        ? ""
        : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(",")),
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nutrition-survey-responses.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
