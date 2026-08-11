"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Download, Printer, Save } from "lucide-react";
import {
  surveySections,
  type SurveyField,
} from "@workspace/backend/convex/survey/questionnaire";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { surveyApi } from "@/lib/convex-api";
import { downloadSurveyRows } from "@/lib/export";

const sectionKeyById: Record<string, string> = {
  sociodemographic: "sociodemographic",
  dietaryDiversity: "dietaryDiversity",
  mealPatterns: "mealPatterns",
  psychosocial: "psychosocial",
};

function valueAsString(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  return value == null || value === "" ? "" : String(value);
}

function heightFromCm(value: unknown) {
  const cm = Number(valueAsString(value));
  if (!Number.isFinite(cm) || cm <= 0) return "";

  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches - feet * 12;
  return `${feet} ft ${inches} inch`;
}

function answerLabel(field: SurveyField, value: unknown) {
  if (field.id === "A15") return heightFromCm(value);

  if (field.options?.length) {
    const labelByValue = new Map(
      field.options.map((option) => [option.value, option.label]),
    );

    if (Array.isArray(value)) {
      return value
        .map((item) => labelByValue.get(String(item)) ?? String(item))
        .filter(Boolean)
        .join(", ");
    }

    const stringValue = valueAsString(value);
    return stringValue ? (labelByValue.get(stringValue) ?? stringValue) : "";
  }

  return valueAsString(value);
}

function answerRows(response: Record<string, any>) {
  const consentSection = surveySections.find((section) => section.id === "consent");
  const consentField = consentSection?.fields.find((field) => field.id === "C0");
  const consentRow = consentField
    ? [
        {
          id: consentField.id,
          question: consentField.label,
          answer: response.consentGiven ? "Yes [1]" : "No [0]",
        },
      ]
    : [];

  const surveyRows = surveySections.flatMap((section) => {
    const responseKey = sectionKeyById[section.id];
    if (!responseKey) return [];

    const values = response[responseKey] ?? {};
    return section.fields.map((field) => ({
      id: field.id,
      question: field.label,
      answer: answerLabel(field, values[field.id]),
    }));
  });

  return [...consentRow, ...surveyRows];
}

export function SubmissionDetailClient() {
  const params = useParams<{ id: string }>();
  const updateReviewStatus = useMutation(surveyApi.admin.updateReviewStatus);
  const response = useQuery(surveyApi.admin.getResponse, {
    id: params.id as any,
  });
  const [reviewed, setReviewed] = useState(false);
  const [excludedFromAnalysis, setExcludedFromAnalysis] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [exclusionReason, setExclusionReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!response) return;
    setReviewed(Boolean(response.reviewed));
    setExcludedFromAnalysis(Boolean(response.excludedFromAnalysis));
    setAdminNotes(response.adminNotes ?? "");
    setExclusionReason(response.exclusionReason ?? "");
  }, [response]);

  if (response === undefined) {
    return <div className="rounded-lg border bg-white p-5">Loading...</div>;
  }

  if (!response) {
    return <div className="rounded-lg border bg-white p-5">Not found.</div>;
  }

  const rows = answerRows(response);
  const singleExportRows = rows.map((row) => ({
    respondentId: response.respondentId,
    bmi: response.bmi ?? "",
    bmiClass: response.bmiClass ?? "",
    hddsScore: response.hddsScore ?? "",
    questionId: row.id,
    question: row.question,
    answer: row.answer,
  }));

  async function saveReview() {
    setSaving(true);
    setSaveMessage("");
    try {
      await updateReviewStatus({
        id: params.id as any,
        reviewed,
        excludedFromAnalysis,
        adminNotes,
        exclusionReason,
      });
      setSaveMessage("Review status saved.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to save review status.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Submission {response.respondentId}
          </h2>
          <p className="text-sm text-slate-600">
            {response.districtArea} - {response.date}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            Print
          </Button>
          <Button
            type="button"
            onClick={() =>
              downloadSurveyRows(
                singleExportRows,
                `${response.respondentId}-answers.csv`,
              )
            }
            variant="outline"
          >
            <Download className="size-4" />
            Export this record
          </Button>
          <Button asChild href="/admin/submissions" variant="outline">
            Back
          </Button>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-4">
        <div>
          <p className="text-sm text-slate-500">BMI</p>
          <p className="text-lg font-semibold">{response.bmi ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">BMI class</p>
          <p className="text-lg font-semibold">
            {response.bmiClass || response.bmiClassCode || "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">HDDS</p>
          <p className="text-lg font-semibold">{response.hddsScore ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Quality flags</p>
          <p className="text-lg font-semibold">
            {response.qualityFlagCount || 0}
          </p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h3 className="font-semibold">Data quality checks</h3>
          <p className="mt-1 text-sm text-slate-500">
            Automatic warnings for values that may need review.
          </p>
          <div className="mt-4 grid gap-2">
            {response.qualityFlags?.length ? (
              response.qualityFlags.map((flag: string) => (
                <div
                  key={flag}
                  className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{flag}</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                No automatic quality issue detected.
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Admin review</h3>
          <p className="mt-1 text-sm text-slate-500">
            Mark records after manual checking. Excluded records are ignored in
            dashboard analysis metrics.
          </p>
          <div className="mt-4 grid gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(event) => setReviewed(event.target.checked)}
              />
              Mark as reviewed
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={excludedFromAnalysis}
                onChange={(event) =>
                  setExcludedFromAnalysis(event.target.checked)
                }
              />
              Exclude from analysis
            </label>
            <Textarea
              value={exclusionReason}
              onChange={(event) => setExclusionReason(event.target.value)}
              rows={2}
              placeholder="Reason for exclusion, if any"
            />
            <Textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={4}
              placeholder="Admin notes"
            />
            <div className="flex items-center gap-3">
              <Button type="button" disabled={saving} onClick={saveReview}>
                <Save className="size-4" />
                {saving ? "Saving..." : "Save review"}
              </Button>
              {saveMessage ? (
                <p className="text-sm text-slate-600">{saveMessage}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h3 className="font-semibold">Questions and answers</h3>
          <p className="mt-1 text-sm text-slate-500">
            Human-readable submitted answers.
          </p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3">Question</th>
                <th className="p-3">Answer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="p-3">
                    <span className="font-medium">{row.id}</span>{" "}
                    {row.question}
                  </td>
                  <td className="p-3 text-slate-700">{row.answer || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
