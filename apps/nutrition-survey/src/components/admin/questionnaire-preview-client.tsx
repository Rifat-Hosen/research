"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadQuestionnairePdf,
  questionnairePreviewSections,
} from "@/lib/questionnaire-pdf";

export function QuestionnairePreviewClient() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Questionnaire Preview</h2>
          <p className="text-sm text-slate-600">
            Compact respondent questionnaire preview. The PDF download is
            generated as a 2-page A4 manual-fill form with small font size.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={downloadQuestionnairePdf}>
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm print:border-0 print:shadow-none">
        <div className="mb-4 rounded-xl bg-emerald-900 p-4 text-white print:bg-white print:p-0 print:text-slate-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100 print:text-slate-500">
            Research Survey Form
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            Healthy Eating Index, Double Burden of Malnutrition and BMI among
            Adults
          </h3>
          <p className="mt-1 text-xs text-emerald-50 print:text-slate-600">
            Admin preview of all respondent-facing questions and coded answer
            options.
          </p>
        </div>

        <div className="columns-1 gap-4 text-[11px] leading-snug sm:columns-2 xl:columns-3 print:columns-3 print:text-[7px]">
          {questionnairePreviewSections.map((section) => (
            <div
              key={section.id}
              className="mb-3 break-inside-avoid rounded-lg border border-slate-200 bg-slate-50 p-3 print:mb-1 print:rounded-none print:border-slate-300 print:bg-white print:p-1"
            >
              <h4 className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900 print:px-1 print:py-0 print:text-[7px]">
                {section.title}
              </h4>
              {section.description ? (
                <p className="mt-2 text-[10px] text-slate-500 print:mt-1 print:text-[6px]">
                  {section.description}
                </p>
              ) : null}
              <div className="mt-2 grid gap-1.5 print:gap-0.5">
                {section.fields.map((field) => (
                  <div key={field.id} className="rounded bg-white p-2 print:p-0">
                    <p className="font-medium text-slate-900">
                      {field.id}. {field.label}
                      {field.unit ? ` (${field.unit})` : ""}
                      {field.required ? " *" : ""}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-600 print:text-[6px]">
                      {field.options?.length
                        ? field.options.map((option) => option.label).join("; ")
                        : field.type === "textarea"
                          ? "Open text"
                          : "Open value"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
