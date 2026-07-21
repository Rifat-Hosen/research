"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { surveyApi } from "@/lib/convex-api";

const sectionKeys = [
  "sociodemographic",
  "anthropometry",
  "heiFoodGroups",
  "heiFatsSodiumSugars",
  "dietaryDiversity",
  "mealPatterns",
  "doubleBurden",
  "physicalActivity",
  "enumeratorChecks",
  "psychosocial",
  "nutritionKnowledge",
];

export function SubmissionDetailClient() {
  const params = useParams<{ id: string }>();
  const response = useQuery(surveyApi.admin.getResponse, {
    id: params.id as any,
  });

  if (response === undefined) {
    return <div className="rounded-lg border bg-white p-5">Loading...</div>;
  }

  if (!response) {
    return <div className="rounded-lg border bg-white p-5">Not found.</div>;
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Submission {response.respondentId}
          </h2>
          <p className="text-sm text-slate-600">{response.email}</p>
        </div>
        <Button asChild href="/admin/submissions" variant="outline">
          Back
        </Button>
      </div>
      <section className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4">
        <div>
          <p className="text-sm text-slate-500">BMI</p>
          <p className="text-lg font-semibold">{response.bmi ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">BMI class code</p>
          <p className="text-lg font-semibold">
            {response.bmiClassCode ?? "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">HDDS</p>
          <p className="text-lg font-semibold">{response.hddsScore ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Double burden</p>
          <p className="text-lg font-semibold">
            {response.doubleBurdenFlag ? "Yes" : "No"}
          </p>
        </div>
      </section>
      {sectionKeys.map((key) => {
        const values = response[key] ?? {};
        return (
          <section key={key} className="rounded-lg border bg-white">
            <div className="border-b p-4">
              <h3 className="font-semibold">{key}</h3>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(values).map(([fieldId, value]) => (
                <div key={fieldId} className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    {fieldId}
                  </p>
                  <p className="mt-1 text-sm">{String(value || "-")}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {response.notes ? (
        <section className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Notes</h3>
          <p className="mt-2 text-sm text-slate-700">{response.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
