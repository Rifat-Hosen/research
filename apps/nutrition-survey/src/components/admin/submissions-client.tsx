"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Download,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadSurveyRows } from "@/lib/export";
import { surveyApi } from "@/lib/convex-api";
import {
  OptionList,
  Select,
  ageBandOptions,
  bmiClassOptions,
  ckdOptions,
  compactArgs,
  hddsTierOptions,
  qualityOptions,
  residenceOptions,
  sexOptions,
} from "./filter-controls";

const pageSize = 25;

export function SubmissionsClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [bmiClassCode, setBmiClassCode] = useState("");
  const [sex, setSex] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [ckd, setCkd] = useState("");
  const [residence, setResidence] = useState("");
  const [hddsTier, setHddsTier] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [quality, setQuality] = useState("");
  const [interviewerCode, setInterviewerCode] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteText, setDeleteText] = useState("");
  const deleteResponse = useMutation(surveyApi.admin.deleteResponse);

  const queryArgs = useMemo(
    () =>
      compactArgs({
        search,
        page,
        limit: pageSize,
        bmiClassCode: bmiClassCode ? Number(bmiClassCode) : undefined,
        sex,
        status,
        fromDate,
        toDate,
        sortBy,
        sortDir,
        ckd,
        residence,
        hddsTier,
        ageBand,
        quality,
        interviewerCode,
      }),
    [
      search,
      page,
      bmiClassCode,
      sex,
      status,
      fromDate,
      toDate,
      sortBy,
      sortDir,
      ckd,
      residence,
      hddsTier,
      ageBand,
      quality,
      interviewerCode,
    ],
  );
  const exportArgs = useMemo(
    () =>
      compactArgs({
        search,
        bmiClassCode: bmiClassCode ? Number(bmiClassCode) : undefined,
        sex,
        status,
        fromDate,
        toDate,
        sortBy,
        sortDir,
        ckd,
        residence,
        hddsTier,
        ageBand,
        quality,
        interviewerCode,
      }),
    [
      search,
      bmiClassCode,
      sex,
      status,
      fromDate,
      toDate,
      sortBy,
      sortDir,
      ckd,
      residence,
      hddsTier,
      ageBand,
      quality,
      interviewerCode,
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
    setSex("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setSortBy("createdAt");
    setSortDir("desc");
    setCkd("");
    setResidence("");
    setHddsTier("");
    setAgeBand("");
    setQuality("");
    setInterviewerCode("");
    setPage(1);
  }

  /** Every filter change returns to the first page. */
  function filterSetter(set: (value: string) => void) {
    return (value: string) => {
      set(value);
      setPage(1);
    };
  }

  const activeFilterCount = [
    bmiClassCode,
    sex,
    status,
    fromDate,
    toDate,
    ckd,
    residence,
    hddsTier,
    ageBand,
    quality,
    interviewerCode,
  ].filter(Boolean).length;

  function openDeleteModal(response: any) {
    setDeleteTarget(response);
    setDeleteText("");
    setActionMessage("");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setBusyId(deleteTarget._id);
    setActionMessage("");
    try {
      await deleteResponse({
        id: deleteTarget._id,
        confirmationText: deleteText,
      });
      setActionMessage("Submission deleted.");
      setDeleteTarget(null);
      setDeleteText("");
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Failed to delete submission.",
      );
    } finally {
      setBusyId("");
    }
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
              placeholder="Search respondent ID or area"
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

        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Select
            value={bmiClassCode}
            onChange={filterSetter(setBmiClassCode)}
            ariaLabel="BMI class"
          >
            <OptionList placeholder="All BMI classes" options={bmiClassOptions} />
          </Select>
          <Select value={sex} onChange={filterSetter(setSex)} ariaLabel="Sex">
            <OptionList placeholder="All sex" options={sexOptions} />
          </Select>
          <Select
            value={ckd}
            onChange={filterSetter(setCkd)}
            ariaLabel="CKD status"
          >
            <OptionList placeholder="All CKD status" options={ckdOptions} />
          </Select>
          <Select
            value={residence}
            onChange={filterSetter(setResidence)}
            ariaLabel="Residence"
          >
            <OptionList placeholder="All residence" options={residenceOptions} />
          </Select>
          <Select
            value={ageBand}
            onChange={filterSetter(setAgeBand)}
            ariaLabel="Age group"
          >
            <OptionList placeholder="All age groups" options={ageBandOptions} />
          </Select>
          <Select
            value={hddsTier}
            onChange={filterSetter(setHddsTier)}
            ariaLabel="Dietary diversity tier"
          >
            <OptionList placeholder="All HDDS tiers" options={hddsTierOptions} />
          </Select>
          <Select
            value={quality}
            onChange={filterSetter(setQuality)}
            ariaLabel="Quality"
          >
            <OptionList placeholder="All quality" options={qualityOptions} />
          </Select>
          <Input
            value={interviewerCode}
            onChange={(event) =>
              filterSetter(setInterviewerCode)(event.target.value)
            }
            placeholder="Interviewer code"
            aria-label="Interviewer code"
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Select value={sortBy} onChange={setSortBy} ariaLabel="Sort by">
            <option value="createdAt">Sort by submitted date</option>
            <option value="bmi">Sort by BMI</option>
            <option value="hddsScore">Sort by HDDS</option>
            <option value="respondentId">Sort by respondent ID</option>
            <option value="districtArea">Sort by area</option>
            <option value="interviewerCode">Sort by interviewer</option>
          </Select>
          <Select value={sortDir} onChange={setSortDir} ariaLabel="Sort direction">
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>
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
        {actionMessage ? (
          <div className="border-b bg-slate-50 px-4 py-2 text-sm text-slate-700">
            {actionMessage}
          </div>
        ) : null}
        <div className="overflow-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Respondent ID</th>
                <th className="p-3">Sex</th>
                <th className="p-3">CKD</th>
                <th className="p-3">BMI</th>
                <th className="p-3">BMI class</th>
                <th className="p-3">HDDS</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Review</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((response: any) => (
                <tr key={response._id} className="border-t align-top">
                  <td className="p-3 font-medium">
                    {response.respondentId}
                    <p className="text-xs font-normal text-slate-500">
                      {response.districtArea} · {response.interviewerCode}
                    </p>
                  </td>
                  <td className="p-3">{response.sexLabel || "-"}</td>
                  <td className="p-3">
                    {response.ckdStatus === "CKD" ? (
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                        CKD
                      </span>
                    ) : (
                      <span className="text-slate-500">{response.ckdStatus}</span>
                    )}
                  </td>
                  <td className="p-3">{response.bmi ?? "-"}</td>
                  <td className="p-3">{response.bmiClass || "-"}</td>
                  <td className="p-3">{response.hddsScore ?? "-"}</td>
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
                    <div className="flex flex-wrap gap-2">
                      <Button
                        asChild
                        href={`/admin/submissions/${response._id}`}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyId === response._id}
                        onClick={() => openDeleteModal(response)}
                        className="h-9 w-9 shrink-0 border-rose-200 px-0 text-rose-700 hover:bg-rose-50"
                        aria-label={`Delete ${response.respondentId}`}
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {responsePage?.total === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={10}>
                    No submissions found.
                  </td>
                </tr>
              ) : null}
              {responsePage === undefined ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={10}>
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

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-rose-50 p-2 text-rose-700">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Delete submission?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  This will permanently delete{" "}
                  <span className="font-medium">
                    {deleteTarget.respondentId}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type DELETE to confirm
              </label>
              <Input
                value={deleteText}
                onChange={(event) => setDeleteText(event.target.value)}
                placeholder="DELETE"
                autoFocus
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteText("");
                }}
                disabled={busyId === deleteTarget._id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  deleteText.trim() !== "DELETE" || busyId === deleteTarget._id
                }
                onClick={confirmDelete}
                className="bg-rose-700 hover:bg-rose-800"
              >
                {busyId === deleteTarget._id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
