"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { AlertTriangle, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadSurveyRows } from "@/lib/export";
import { surveyApi } from "@/lib/convex-api";

const pageSize = 25;

function compactArgs(args: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(args).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  );
}

function Select({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 ${className}`}
    >
      {children}
    </select>
  );
}

export function SubmissionsClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [bmiClassCode, setBmiClassCode] = useState("");
  const [doubleBurden, setDoubleBurden] = useState("");
  const [sex, setSex] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const queryArgs = useMemo(
    () =>
      compactArgs({
        search,
        page,
        limit: pageSize,
        bmiClassCode: bmiClassCode ? Number(bmiClassCode) : undefined,
        doubleBurden,
        sex,
        status,
        fromDate,
        toDate,
        sortBy,
        sortDir,
      }),
    [
      search,
      page,
      bmiClassCode,
      doubleBurden,
      sex,
      status,
      fromDate,
      toDate,
      sortBy,
      sortDir,
    ],
  );
  const exportArgs = useMemo(
    () =>
      compactArgs({
        search,
        bmiClassCode: bmiClassCode ? Number(bmiClassCode) : undefined,
        doubleBurden,
        sex,
        status,
        fromDate,
        toDate,
        sortBy,
        sortDir,
      }),
    [
      search,
      bmiClassCode,
      doubleBurden,
      sex,
      status,
      fromDate,
      toDate,
      sortBy,
      sortDir,
    ],
  );

  const responsePage = useQuery(surveyApi.admin.listResponses, queryArgs);
  const codedExportRows = useQuery(surveyApi.admin.exportRows, {
    ...exportArgs,
    readable: false,
  });
  const readableExportRows = useQuery(surveyApi.admin.exportRows, {
    ...exportArgs,
    readable: true,
  });
  const rows = responsePage?.rows ?? [];

  function resetFilters() {
    setSearch("");
    setBmiClassCode("");
    setDoubleBurden("");
    setSex("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setSortBy("createdAt");
    setSortDir("desc");
    setPage(1);
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Submissions</h2>
          <p className="text-sm text-slate-600">
            Filter, inspect, review, and export submitted survey records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!codedExportRows}
            onClick={() =>
              downloadSurveyRows(
                codedExportRows ?? [],
                "nutrition-survey-coded-export.csv",
              )
            }
            variant="outline"
          >
            <Download className="size-4" />
            Export coded
          </Button>
          <Button
            type="button"
            disabled={!readableExportRows}
            onClick={() =>
              downloadSurveyRows(
                readableExportRows ?? [],
                "nutrition-survey-readable-export.csv",
              )
            }
          >
            <Download className="size-4" />
            Export readable
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search respondent, email, name, or area"
              className="bg-white pl-9"
            />
          </div>
          <Input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            <option value="reviewed">Reviewed</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="included">Included in analysis</option>
            <option value="excluded">Excluded from analysis</option>
          </Select>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Select
            value={bmiClassCode}
            onChange={(value) => {
              setBmiClassCode(value);
              setPage(1);
            }}
          >
            <option value="">All BMI classes</option>
            <option value="0">Underweight</option>
            <option value="1">Normal</option>
            <option value="2">Overweight</option>
            <option value="3">Obesity</option>
          </Select>
          <Select
            value={doubleBurden}
            onChange={(value) => {
              setDoubleBurden(value);
              setPage(1);
            }}
          >
            <option value="">All double burden</option>
            <option value="flagged">Flagged</option>
            <option value="not_flagged">Not flagged</option>
          </Select>
          <Select
            value={sex}
            onChange={(value) => {
              setSex(value);
              setPage(1);
            }}
          >
            <option value="">All sex</option>
            <option value="0">Male</option>
            <option value="1">Female</option>
            <option value="2">Other</option>
          </Select>
          <Select value={sortBy} onChange={setSortBy}>
            <option value="createdAt">Sort by submitted date</option>
            <option value="bmi">Sort by BMI</option>
            <option value="hddsScore">Sort by HDDS</option>
            <option value="heiScore">Sort by HEI</option>
            <option value="name">Sort by name</option>
          </Select>
          <div className="flex gap-2">
            <Select value={sortDir} onChange={setSortDir} className="flex-1">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {rows.length} of {responsePage?.total ?? 0} matching records
          </p>
          <p className="text-sm text-slate-500">
            Page {responsePage?.page ?? page} of {responsePage?.totalPages ?? 1}
          </p>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Respondent ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">BMI</th>
                <th className="p-3">BMI class</th>
                <th className="p-3">HDDS</th>
                <th className="p-3">Double burden</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Review</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((response: any) => (
                <tr key={response._id} className="border-t align-top">
                  <td className="p-3 font-medium">{response.respondentId}</td>
                  <td className="p-3">{response.name || "-"}</td>
                  <td className="p-3">{response.email}</td>
                  <td className="p-3">{response.bmi ?? "-"}</td>
                  <td className="p-3">{response.bmiClass || "-"}</td>
                  <td className="p-3">{response.hddsScore ?? "-"}</td>
                  <td className="p-3">
                    {response.doubleBurdenFlag ? "Flagged" : "Not flagged"}
                  </td>
                  <td className="p-3">
                    {response.qualityFlagCount ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        <AlertTriangle className="size-3" />
                        {response.qualityFlagCount} issue
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        Clear
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {response.excludedFromAnalysis ? (
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                        Excluded
                      </span>
                    ) : response.reviewed ? (
                      <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                        Reviewed
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        Pending
                      </span>
                    )}
                  </td>
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
              {responsePage?.total === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={11}>
                    No submissions found.
                  </td>
                </tr>
              ) : null}
              {responsePage === undefined ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={11}>
                    Loading...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-4">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={page >= (responsePage?.totalPages ?? 1)}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </section>
    </div>
  );
}
