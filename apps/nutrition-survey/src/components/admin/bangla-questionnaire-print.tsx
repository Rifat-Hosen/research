"use client";

import { useEffect } from "react";
import { Noto_Sans_Bengali } from "next/font/google";
import {
  banglaFormText,
  surveySectionsBn,
} from "@workspace/backend/convex/survey/questionnaire-bn";
import type { SurveyField } from "@workspace/backend/convex/survey/questionnaire";

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sections = surveySectionsBn.filter((section) => section.id !== "metadata");
const metadata = (
  surveySectionsBn.find((section) => section.id === "metadata")?.fields ?? []
).filter((field) => field.id === "date" || field.id === "districtArea");

/** Bengali digits for question numbers, keeping the section letter as is. */
function bengaliNumber(id: string) {
  return id.replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
}

function Answer({ field }: { field: SurveyField }) {
  if (field.options?.length) {
    return (
      <div className="options">
        {field.options.map((option) => (
          <span key={option.value} className="option">
            <span className="box" />
            {option.label}
          </span>
        ))}
      </div>
    );
  }
  if (field.id === "A15") {
    return (
      <div className="written">
        <span className="rule short" /> {banglaFormText.feet}
        <span className="rule short" /> {banglaFormText.inch}
      </div>
    );
  }
  return (
    <div className="written">
      <span className={`rule ${field.type === "textarea" ? "long" : ""}`} />
      {field.unit ? <span className="unit">{field.unit}</span> : null}
    </div>
  );
}

/**
 * Print-ready Bangla questionnaire. Bengali script needs real font shaping,
 * so the browser lays it out and the print dialog produces the PDF.
 */
export function BanglaQuestionnairePrint({ autoPrint = true }: { autoPrint?: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setTimeout(() => window.print(), 300);
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return (
    <div className={`${bengali.className} sheet`}>
      <style>{`
        @page { size: A4; margin: 12mm 10mm 12mm 10mm; }
        html, body { background: #fff; margin: 0; }
        .sheet { color: #111827; font-size: 9.6pt; line-height: 1.35; max-width: 190mm; margin: 0 auto; padding: 8mm 0; }
        .toolbar { display: flex; gap: 8px; justify-content: flex-end; margin-bottom: 10px; }
        .toolbar button { font: inherit; font-size: 10pt; padding: 6px 14px; border: 1px solid #94a3b8; border-radius: 6px; background: #fff; cursor: pointer; }
        .toolbar button.primary { background: #065f46; border-color: #065f46; color: #fff; }
        .band { background: #0f6640; color: #fff; display: flex; justify-content: space-between; padding: 4px 8px; font-size: 8.5pt; }
        .band strong { font-weight: 700; }
        h1 { font-size: 15pt; margin: 8px 0 0; font-weight: 700; }
        .subtitle { margin: 1px 0 4px; color: #334155; font-size: 9pt; }
        .meta { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 1.2px solid #111827; padding-bottom: 5px; margin-bottom: 8px; font-size: 8.5pt; }
        .meta .fields { display: flex; gap: 14px; white-space: nowrap; }
        .meta .fields span { font-weight: 700; }
        .meta .fields i { display: inline-block; width: 30mm; border-bottom: 0.7px solid #475569; margin-left: 4px; }
        .columns { column-count: 2; column-gap: 8mm; column-rule: 0.6px solid #cbd5e1; }
        .section { break-inside: avoid-column; margin-bottom: 4px; }
        .section h2 { font-size: 10pt; font-weight: 700; border-bottom: 1.1px solid #111827; padding-bottom: 2px; margin: 4px 0 6px; }
        .section .desc { font-size: 7.6pt; color: #475569; margin: 0 0 5px; }
        .q { display: grid; grid-template-columns: 9mm 1fr; margin-bottom: 5px; break-inside: avoid; }
        .q .num { font-weight: 700; }
        .q .req { color: #b91c1c; font-weight: 700; margin-left: 2px; }
        .options { display: flex; flex-wrap: wrap; gap: 2px 9px; margin-top: 1px; font-size: 9pt; color: #1f2937; }
        .option { display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
        .box { display: inline-block; width: 8.5px; height: 8.5px; border: 0.8px solid #475569; }
        .written { margin-top: 3px; font-size: 9pt; color: #1f2937; }
        .rule { display: inline-block; width: 38mm; border-bottom: 0.7px solid #475569; vertical-align: baseline; }
        .rule.short { width: 16mm; margin-right: 3px; }
        .rule.long { width: 100%; height: 14px; }
        .rule + .rule.short { margin-left: 8px; }
        .unit { margin-left: 5px; }
        .footer { margin-top: 8px; border-top: 0.6px solid #cbd5e1; padding-top: 3px; font-size: 7.6pt; color: #64748b; }
        @media print {
          .toolbar { display: none; }
          .sheet { padding: 0; max-width: none; }
        }
      `}</style>

      <div className="toolbar">
        <button type="button" onClick={() => window.close()}>Close</button>
        <button type="button" className="primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className="band">
        <strong>{banglaFormText.headerLeft}</strong>
        <span>{banglaFormText.headerRight}</span>
      </div>
      <h1>{banglaFormText.title}</h1>
      <p className="subtitle">{banglaFormText.subtitle}</p>
      <div className="meta">
        <div>{banglaFormText.instructions}</div>
        <div className="fields">
          {metadata.map((field) => (
            <span key={field.id}>
              {field.label}: <i />
            </span>
          ))}
        </div>
      </div>

      <div className="columns">
        {sections.map((section) => (
          <div key={section.id} className="section">
            <h2>{section.title}</h2>
            {section.description ? <p className="desc">{section.description}</p> : null}
            {section.fields.map((field) => (
              <div key={field.id} className="q">
                <span className="num">{bengaliNumber(field.id)}.</span>
                <div>
                  <span>{field.label}</span>
                  {field.required ? <span className="req">*</span> : null}
                  <Answer field={field} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="footer">{banglaFormText.footer}</div>
    </div>
  );
}
