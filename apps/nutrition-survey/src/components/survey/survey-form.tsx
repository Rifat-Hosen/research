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

function generatedRespondentId() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RS-${stamp}-${random}`;
}

function createInitialValues(): SurveyValues {
  return {
    respondentId: generatedRespondentId(),
    date: today(),
    districtArea: "Not collected",
    interviewerCode: "WEB",
  };
}

const respondentSections = surveySections.filter(
  (section) => section.id !== "metadata",
);

function valueAsString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(", ") : (value ?? "");
}

function heightPartsFromCm(value: string | string[] | undefined) {
  const cm = Number(valueAsString(value));
  if (!Number.isFinite(cm) || cm <= 0) {
    return { feet: "", inches: "" };
  }

  let totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  let inches = totalInches - feet * 12;

  if (inches === 12) {
    totalInches += 1;
    return {
      feet: String(Math.floor(totalInches / 12)),
      inches: "0",
    };
  }

  return { feet: String(feet), inches: String(inches) };
}

function feetInchesToCm(feet: string, inches: string) {
  const parsedFeet = Number(feet || 0);
  const parsedInches = Number(inches || 0);
  if (!Number.isFinite(parsedFeet) || !Number.isFinite(parsedInches)) return "";

  const totalInches = parsedFeet * 12 + parsedInches;
  if (totalInches <= 0) return "";

  return String(Math.round(totalInches * 2.54 * 10) / 10);
}

function reviewValue(field: SurveyField, value: string | string[] | undefined) {
  if (field.id === "A15") {
    const heightParts = heightPartsFromCm(value);
    if (!heightParts.feet && !heightParts.inches) return "";
    return `${heightParts.feet || "0"} ft ${heightParts.inches || "0"} inch`;
  }

  if (field.options?.length) {
    const labelByValue = new Map(
      field.options.map((option) => [option.value, option.label]),
    );

    if (Array.isArray(value)) {
      return value
        .map((item) => labelByValue.get(item) ?? item)
        .filter(Boolean)
        .join(", ");
    }

    return value ? (labelByValue.get(value) ?? value) : "";
  }

  return valueAsString(value);
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

  if (field.id === "A15") {
    const heightParts = heightPartsFromCm(value);
    const cmValue = valueAsString(value);

    return (
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              id={`${inputId}-feet`}
              inputMode="numeric"
              min={2}
              max={8}
              type="number"
              value={heightParts.feet}
              onChange={(event) =>
                onChange(feetInchesToCm(event.target.value, heightParts.inches))
              }
              placeholder="Feet"
            />
            <p className="mt-1 text-xs text-slate-500">Feet</p>
          </div>
          <div>
            <Input
              id={`${inputId}-inches`}
              inputMode="numeric"
              min={0}
              max={11}
              type="number"
              value={heightParts.inches}
              onChange={(event) =>
                onChange(feetInchesToCm(heightParts.feet, event.target.value))
              }
              placeholder="Inches"
            />
            <p className="mt-1 text-xs text-slate-500">Inches</p>
          </div>
        </div>
        {cmValue ? (
          <p className="text-xs text-slate-500">
            Height will be converted automatically for BMI calculation.
          </p>
        ) : null}
      </div>
    );
  }

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
  const [values, setValues] = useState<SurveyValues>(() =>
    createInitialValues(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentSection = respondentSections[step];
  const isReview = step === respondentSections.length;
  const progress = Math.round((step / respondentSections.length) * 100);

  const reviewRows = useMemo(
    () =>
      respondentSections.flatMap((section) =>
        section.fields.map((field) => ({
          id: field.id,
          label: field.label,
          value: reviewValue(field, values[field.id]),
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
    const section = respondentSections[sectionIndex];
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
    setStep((current) => Math.min(current + 1, respondentSections.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitError("");
    for (let index = 0; index < respondentSections.length; index += 1) {
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
                Healthy Eating Index and Its Association with BMI Among
                Adults
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Complete each section, review the answers, then submit.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-600">
              Step {Math.min(step + 1, respondentSections.length + 1)} of{" "}
              {respondentSections.length + 1}
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            This survey is being collected for academic research purposes and is
            completely anonymous - no name or email is collected. Please submit
            the form only once and provide accurate information as much as
            possible. Duplicate or incorrect responses may affect the quality of
            the research results.
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
                    <th className="p-3">Question</th>
                    <th className="p-3">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewRows.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-3">
                        <span className="font-medium">{row.id}</span>{" "}
                        {row.label}
                      </td>
                      <td className="p-3">{row.value || "-"}</td>
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
