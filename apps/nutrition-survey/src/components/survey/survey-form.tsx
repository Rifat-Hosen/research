"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import {
  surveySections,
  type SurveyField,
} from "@workspace/backend/convex/survey/questionnaire";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { surveyApi } from "@/lib/convex-api";
import { buildSurveyPayload, type SurveyValues } from "@/lib/survey-payload";

function today() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
}

const initialValues: SurveyValues = {
  date: today(),
  C0: "1",
};

function valueAsString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(", ") : (value ?? "");
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SurveyField;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  const inputId = `field-${field.id}`;

  if (field.type === "radio") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {field.options?.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
              value === option.value
                ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <input
              className="size-4"
              name={field.id}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkboxes") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {field.options?.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <input
              className="size-4"
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(event) => {
                onChange(
                  event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value),
                );
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        id={inputId}
        value={valueAsString(value)}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
      />
    );
  }

  return (
    <Input
      id={inputId}
      type={field.type === "number" ? "number" : field.type}
      min={field.min}
      max={field.max}
      value={valueAsString(value)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function SurveyForm() {
  const router = useRouter();
  const submitSurvey = useMutation(surveyApi.public.submitSurvey);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<SurveyValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentSection = surveySections[step];
  const isReview = step === surveySections.length;
  const progress = Math.round((step / surveySections.length) * 100);

  const reviewRows = useMemo(
    () =>
      surveySections.flatMap((section) =>
        section.fields.map((field) => ({
          section: section.title,
          id: field.id,
          label: field.label,
          value: valueAsString(values[field.id]),
        })),
      ),
    [values],
  );

  function setField(fieldId: string, value: string | string[]) {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function validateSection(sectionIndex: number) {
    const section = surveySections[sectionIndex];
    const nextErrors: Record<string, string> = {};
    if (!section) return true;

    for (const field of section.fields) {
      const value = values[field.id];
      const empty =
        value == null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (field.required && empty) {
        nextErrors[field.id] = "Required";
      }

      if (field.type === "email" && valueAsString(value)) {
        const email = valueAsString(value).trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          nextErrors[field.id] = "Enter a valid email";
        }
      }

      if (field.type === "number" && valueAsString(value)) {
        const parsed = Number(valueAsString(value));
        if (!Number.isFinite(parsed)) {
          nextErrors[field.id] = "Enter a valid number";
        }
        if (field.min != null && parsed < field.min) {
          nextErrors[field.id] = `Minimum ${field.min}`;
        }
        if (field.max != null && parsed > field.max) {
          nextErrors[field.id] = `Maximum ${field.max}`;
        }
      }
    }

    if (section.id === "consent" && values.C0 !== "1") {
      nextErrors.C0 = "Consent is required before submitting";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!validateSection(step)) return;
    setStep((current) => Math.min(current + 1, surveySections.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitError("");
    for (let index = 0; index < surveySections.length; index += 1) {
      if (!validateSection(index)) {
        setStep(index);
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitSurvey(buildSurveyPayload(values) as any);
      router.push("/success");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Survey submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Nutrition Assessment
              </p>
              <h1 className="mt-1 text-2xl font-semibold">
                Healthy Eating Index, Double Burden of Malnutrition and BMI
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Complete each section, review the answers, then submit.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-600">
              Step {Math.min(step + 1, surveySections.length + 1)} of{" "}
              {surveySections.length + 1}
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!isReview && currentSection ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">{currentSection.title}</h2>
              {currentSection.description ? (
                <p className="mt-2 text-sm text-slate-600">
                  {currentSection.description}
                </p>
              ) : null}
            </div>
            <div className="grid gap-5">
              {currentSection.fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`field-${field.id}`}
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    <span className="font-semibold text-slate-500">
                      {field.id}
                    </span>{" "}
                    {field.label}
                    {field.unit ? (
                      <span className="text-slate-500"> ({field.unit})</span>
                    ) : null}
                    {field.required ? (
                      <span className="text-red-600"> *</span>
                    ) : null}
                  </label>
                  <FieldInput
                    field={field}
                    value={values[field.id]}
                    onChange={(value) => setField(field.id, value)}
                  />
                  {errors[field.id] ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.id]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold">Review and Submit</h2>
            <p className="mt-2 text-sm text-slate-600">
              Check the key coded answers before final submission.
            </p>
            <div className="mt-5 max-h-[620px] overflow-auto rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2">Section</th>
                    <th className="p-2">Field</th>
                    <th className="p-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewRows.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2 text-slate-500">{row.section}</td>
                      <td className="p-2">
                        <span className="font-medium">{row.id}</span>{" "}
                        {row.label}
                      </td>
                      <td className="p-2">{row.value || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {submitError ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </p>
            ) : null}
          </section>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || submitting}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            Back
          </Button>
          {!isReview ? (
            <Button type="button" onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button type="button" disabled={submitting} onClick={submit}>
              {submitting ? "Submitting..." : "Submit Survey"}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
