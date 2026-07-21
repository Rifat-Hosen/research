"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadSurveyRows } from "@/lib/export";
import { surveyApi } from "@/lib/convex-api";

export function SubmissionsClient() {
  const [search, setSearch] = useState("");
  const responses = useQuery(surveyApi.admin.listResponses, {
    search,
    limit: 500,
  });
  const exportRows = useQuery(surveyApi.admin.exportRows);
  const rows = useMemo(() => responses ?? [], [responses]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Submissions</h2>
          <p className="text-sm text-slate-600">
            Search, inspect, and export submitted survey records.
          </p>
        </div>
        <Button
          type="button"
          disabled={!exportRows}
          onClick={() => downloadSurveyRows(exportRows ?? [])}
        >
          <Download />
          Export Excel
        </Button>
      </div>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by respondent, email, name, or area"
        className="max-w-xl bg-white"
      />
      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Respondent ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Area</th>
                <th className="p-3">BMI</th>
                <th className="p-3">HDDS</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((response: any) => (
                <tr key={response._id} className="border-t">
                  <td className="p-3 font-medium">{response.respondentId}</td>
                  <td className="p-3">{response.name || "-"}</td>
                  <td className="p-3">{response.email}</td>
                  <td className="p-3">{response.districtArea}</td>
                  <td className="p-3">{response.bmi ?? "-"}</td>
                  <td className="p-3">{response.hddsScore ?? "-"}</td>
                  <td className="p-3">
                    {new Date(response.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <Button
                      asChild
                      href={`/admin/submissions/${response._id}`}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {responses?.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={8}>
                    No submissions found.
                  </td>
                </tr>
              ) : null}
              {responses === undefined ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
