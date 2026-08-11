"use client";

import { useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Download,
  FileText,
  PlusCircle,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { surveyApi } from "@/lib/convex-api";
import { downloadSurveyRows } from "@/lib/export";

function display(value: unknown) {
  return value == null || value === "" ? "-" : String(value);
}

function percent(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{helper}</p>
    </section>
  );
}

function DistributionBar({
  label,
  count,
  percentValue,
  tone = "emerald",
}: {
  label: string;
  count: number;
  percentValue: number;
  tone?: "emerald" | "amber" | "rose" | "sky" | "slate";
}) {
  const colors = {
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    slate: "bg-slate-500",
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {count} · {percentValue}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors[tone]}`}
          style={{ width: percent(percentValue) }}
        />
      </div>
    </div>
  );
}

function MiniTrend({ days }: { days: Array<{ label: string; count: number }> }) {
  const max = Math.max(...days.map((day) => day.count), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {days.map((day) => (
        <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end rounded-t bg-slate-50">
            <div
              className="w-full rounded-t bg-emerald-600"
              style={{ height: `${Math.max(8, (day.count / max) * 100)}%` }}
              title={`${day.label}: ${day.count}`}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-slate-700">{day.count}</p>
            <p className="text-[10px] text-slate-400">{day.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardClient() {
  const stats = useQuery(surveyApi.admin.getDashboardStats);
  const exportRows = useQuery(surveyApi.admin.exportRows, { readable: false });

  if (stats === undefined) {
    return <div className="rounded-lg border bg-white p-5">Loading...</div>;
  }

  const bmiTones = ["amber", "emerald", "sky", "rose"] as const;
  const doubleBurdenClear =
    (stats.doubleBurdenAssessed ?? 0) - (stats.doubleBurdenCount ?? 0);

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-sm">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
              Nutrition Research Admin
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Survey Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50">
              Live overview of form submissions, BMI status, dietary diversity,
              and double burden risk indicators.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild href="/" variant="outline">
              <PlusCircle className="size-4" />
              New application
            </Button>
            <Button asChild href="/admin/questionnaire" variant="outline">
              <FileText className="size-4" />
              Preview form / PDF
            </Button>
            <Button
              type="button"
              disabled={!exportRows}
              onClick={() => downloadSurveyRows(exportRows ?? [])}
            >
              <Download className="size-4" />
              Export Excel
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total forms"
          value={stats.total}
          helper={`${stats.thisWeek} submitted in the last 7 days`}
          icon={ClipboardList}
        />
        <StatCard
          label="Today"
          value={stats.today}
          helper="Responses submitted since local midnight"
          icon={Activity}
        />
        <StatCard
          label="Average BMI"
          value={display(stats.averageBmi)}
          helper={`${stats.bmiRecorded} with BMI · ${stats.bmiMissing} missing`}
          icon={Scale}
        />
        <StatCard
          label="Double burden risk"
          value={`${stats.doubleBurdenPercent}%`}
          helper={`${stats.doubleBurdenCount} flagged of ${stats.doubleBurdenAssessed} assessed`}
          icon={AlertTriangle}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h3 className="font-semibold text-slate-950">
              Target sample progress
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Included records compared with the current target sample size.
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {stats.included} / {stats.targetSampleSize}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {stats.remainingSample} more valid records needed to reach target.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: percent(stats.sampleCompletionPercent) }}
              />
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Completed</p>
                <p className="mt-1 font-semibold">
                  {stats.sampleCompletionPercent}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Reviewed</p>
                <p className="mt-1 font-semibold">{stats.reviewed}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Excluded</p>
                <p className="mt-1 font-semibold">{stats.excluded}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Quality issues</p>
                <p className="mt-1 font-semibold">{stats.qualityIssueCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Included rate</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats.includedPercent}%
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {stats.included} included · {stats.excluded} excluded
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Review progress</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats.reviewedPercent}%
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {stats.reviewed} reviewed · {stats.unreviewed} pending
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Quality issue rate
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {stats.qualityIssuePercent}%
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {stats.qualityIssueCount} records need attention
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sample remaining</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats.remainingSample}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Based on included records only
          </p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">
                BMI classification
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Distribution among respondents with valid height and weight.
              </p>
            </div>
            <BarChart3 className="size-5 text-emerald-700" />
          </div>
          <div className="mt-5 grid gap-4">
            {stats.bmiDistribution.map((item: any, index: number) => (
              <DistributionBar
                key={item.code}
                label={item.label}
                count={item.count}
                percentValue={item.percent}
                tone={bmiTones[index] ?? "slate"}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">
                Double burden status
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Flagged versus not flagged based on current scoring.
              </p>
            </div>
            <TrendingUp className="size-5 text-emerald-700" />
          </div>
          <div className="mt-5 grid gap-4">
            <DistributionBar
              label="Flagged"
              count={stats.doubleBurdenCount}
              percentValue={stats.doubleBurdenPercent}
              tone="rose"
            />
            <DistributionBar
              label="Not flagged"
              count={doubleBurdenClear}
              percentValue={100 - stats.doubleBurdenPercent}
              tone="emerald"
            />
          </div>
          <div className="mt-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Average HDDS</p>
              <p className="mt-1 text-2xl font-semibold">
                {display(stats.averageHdds)}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">
                Last 7 days trend
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Daily submission count.
              </p>
            </div>
            <Activity className="size-5 text-emerald-700" />
          </div>
          <div className="mt-5">
            <MiniTrend days={stats.last7Days} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">
                Respondent profile
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Sex distribution and top recorded areas.
              </p>
            </div>
            <Users className="size-5 text-emerald-700" />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="grid gap-4">
              {stats.sexDistribution.map((item: any) => (
                <DistributionBar
                  key={item.code}
                  label={item.label}
                  count={item.count}
                  percentValue={item.percent}
                  tone="sky"
                />
              ))}
            </div>
            <div className="grid gap-2">
              {stats.areaCounts.length ? (
                stats.areaCounts.map((item: any) => (
                  <div
                    key={item.area}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {item.area}
                    </span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No area data available.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold text-slate-950">
              Latest submissions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Most recent survey records.
            </p>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Respondent</th>
                <th className="p-3">BMI</th>
                <th className="p-3">HDDS</th>
                <th className="p-3">Double burden</th>
                <th className="p-3">Review</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest.map((response: any) => (
                <tr key={response._id} className="border-t">
                  <td className="p-3 font-medium">{response.respondentId}</td>
                  <td className="p-3">{response.bmi ?? "-"}</td>
                  <td className="p-3">{response.hddsScore ?? "-"}</td>
                  <td className="p-3">
                    {response.doubleBurdenFlag ? "Flagged" : "Not flagged"}
                  </td>
                  <td className="p-3">
                    {response.excludedFromAnalysis
                      ? "Excluded"
                      : response.reviewed
                        ? "Reviewed"
                        : "Pending"}
                  </td>
                  <td className="p-3">
                    {response.qualityFlagCount
                      ? `${response.qualityFlagCount} issue`
                      : "Clear"}
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
              {stats.latest.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={8}>
                    No submissions yet.
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
