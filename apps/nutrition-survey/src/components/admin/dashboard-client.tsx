"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Briefcase,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  HeartPulse,
  MapPin,
  PlusCircle,
  Salad,
  Scale,
  Stethoscope,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { surveyApi } from "@/lib/convex-api";
import { downloadSurveyRows } from "@/lib/export";
import {
  compactArgs,
  emptyPopulationFilters,
  type PopulationFilters,
} from "./filter-controls";
import { PopulationFilterBar } from "./population-filter-bar";
import {
  BreakdownTable,
  DistributionBar,
  DistributionList,
  GroupComparisonTable,
  MetricTile,
  MiniTrend,
  Panel,
  StatCard,
  display,
  percent,
  shareTile,
} from "./stats-widgets";

export function DashboardClient() {
  const [filters, setFilters] = useState<PopulationFilters>(
    emptyPopulationFilters,
  );
  const queryArgs = useMemo(() => compactArgs(filters), [filters]);
  const stats = useQuery(surveyApi.admin.getDashboardStats, queryArgs);
  const exportRows = useQuery(surveyApi.admin.exportRows, {
    ...queryArgs,
    readable: false,
  });

  if (stats === undefined) {
    return (
      <div className="grid gap-6">
        <PopulationFilterBar filters={filters} onChange={setFilters} />
        <div className="rounded-lg border bg-white p-5">Loading...</div>
      </div>
    );
  }

  const bmiTones = [
    "amber",
    "emerald",
    "sky",
    "rose",
    "rose",
    "rose",
  ] as const;
  const hddsTones = ["rose", "amber", "emerald"] as const;
  const activityTones = ["rose", "amber", "emerald", "emerald"] as const;

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
              Live overview of submissions, BMI status, chronic kidney disease,
              dietary diversity, meal patterns, psychosocial indicators and field
              progress.
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
            <Button asChild href="/admin/report" variant="outline">
              <ClipboardList className="size-4" />
              Summary report
            </Button>
            <Button
              type="button"
              disabled={!exportRows}
              onClick={() => downloadSurveyRows(exportRows ?? [])}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      <PopulationFilterBar
        filters={filters}
        onChange={setFilters}
        matching={stats.total}
        totalUnfiltered={stats.totalUnfiltered}
      />

      {stats.filtersActive ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Filters are active. All figures below describe the {stats.total}{" "}
          matching records, and the target progress uses included records within
          that subset.
        </p>
      ) : null}

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
          helper={`Average ${stats.dailyAverageLast7} per day over the last week`}
          icon={Activity}
        />
        <StatCard
          label="Average BMI"
          value={display(stats.averageBmi)}
          helper={`${stats.bmiRecorded} with BMI · ${stats.bmiMissing} missing`}
          icon={Scale}
        />
        <StatCard
          label="CKD patients"
          value={stats.ckdPatients.base ? `${stats.ckdPatients.percent}%` : "-"}
          helper={
            stats.ckdPatients.base
              ? `${stats.ckdPatients.count} of ${stats.ckdPatients.base} asked · ${stats.ckdNotAsked} not asked`
              : "No respondent has answered A17 yet"
          }
          icon={Stethoscope}
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
              {stats.remainingSample} more valid records needed.
              {stats.projectedDaysToTarget != null && stats.remainingSample > 0
                ? ` At the current pace, about ${stats.projectedDaysToTarget} days remain.`
                : ""}
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
                <p className="mt-1 font-semibold">
                  {stats.reviewed}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    ({stats.reviewedPercent}%)
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Excluded</p>
                <p className="mt-1 font-semibold">{stats.excluded}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Quality issues</p>
                <p className="mt-1 font-semibold">
                  {stats.qualityIssueCount}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    ({stats.qualityIssuePercent}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="BMI classification (Asian cut-offs)"
          description="Asian / WHO Asia-Pacific cut-offs: under 18.5 underweight, 18.5-22.9 normal, 23.0-27.4 overweight, 27.5+ obesity classes I-III. Included respondents with valid height and weight."
          icon={BarChart3}
        >
          <div className="grid gap-4">
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
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile
              label="Average BMI"
              value={display(stats.averageBmi)}
              note="kg/m²"
            />
            <MetricTile
              label="Underweight (under 18.5)"
              value={stats.bmiRecorded ? `${stats.underweight.percent}%` : "-"}
              note={`${stats.underweight.count} respondents`}
              tone="amber"
            />
            <MetricTile
              label="Overweight / obese (23.0+)"
              value={
                stats.bmiRecorded ? `${stats.overweightObese.percent}%` : "-"
              }
              note={`${stats.overweightObese.count} respondents`}
              tone="rose"
            />
            <MetricTile
              label="BMI missing"
              value={stats.bmiMissing}
              note="No valid height/weight"
            />
          </div>
        </Panel>

        <Panel
          title="Dietary diversity (HDDS)"
          description="FANTA tiers from the 24-hour recall in section B."
          icon={Salad}
        >
          <div className="grid gap-4">
            {stats.hddsDistribution.map((item: any, index: number) => (
              <DistributionBar
                key={item.code}
                label={item.label}
                count={item.count}
                percentValue={item.percent}
                tone={hddsTones[index] ?? "slate"}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MetricTile
              label="Average HDDS"
              value={display(stats.averageHdds)}
              note="Of 12 food groups"
            />
            {shareTile("Food insecurity", stats.foodInsecurity, "amber")}
          </div>
        </Panel>
      </div>

      <Panel
        title="Chronic kidney disease (A17)"
        description="Self-reported CKD status and how CKD patients compare with other respondents."
        icon={Stethoscope}
      >
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4">
            <DistributionList items={stats.ckdDistribution} tones={["emerald", "rose"]} />
            <div className="grid grid-cols-2 gap-3">
              {shareTile("CKD patients", stats.ckdPatients, "rose")}
              <MetricTile
                label="Not asked"
                value={stats.ckdNotAsked}
                note="Submitted before A17 was added"
              />
            </div>
          </div>
          <GroupComparisonTable groups={stats.bmiByCkd} />
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Respondent profile"
          description="Sex, age and background of included records."
          icon={Users}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionList title="Sex" items={stats.sexDistribution} tone="sky" />
            <DistributionList
              title="Age group"
              items={stats.ageDistribution}
              tone="emerald"
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile
              label="Average age"
              value={display(stats.averageAge)}
              note="Years"
            />
            <MetricTile
              label="Household size"
              value={display(stats.averageHouseholdSize)}
              note="Average persons"
            />
            {shareTile("Joint family", stats.jointFamily, "sky")}
            {shareTile("Current smoker", stats.currentSmoker, "amber")}
          </div>
        </Panel>

        <Panel
          title="BMI by sex and residence"
          description="Subgroup comparison for the double-burden analysis."
          icon={Scale}
        >
          <GroupComparisonTable groups={stats.bmiBySex} />
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Residence</th>
                  <th className="px-3 py-2 text-right">Records</th>
                  <th className="px-3 py-2 text-right">Avg BMI</th>
                  <th className="px-3 py-2 text-right">Underweight</th>
                  <th className="px-3 py-2 text-right">Overweight+</th>
                  <th className="px-3 py-2 text-right">Avg HDDS</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {stats.bmiByResidence.map((group: any) => (
                  <tr key={group.label} className="border-t">
                    <td className="px-3 py-2 font-medium">{group.label}</td>
                    <td className="px-3 py-2 text-right">{group.count}</td>
                    <td className="px-3 py-2 text-right">
                      {display(group.averageBmi)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {group.count ? `${group.underweightPercent}%` : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {group.count ? `${group.overweightObesePercent}%` : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {display(group.averageHdds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Education and residence"
          description="Socioeconomic background from section A."
          icon={GraduationCap}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionList
              title="Education"
              items={stats.educationDistribution}
              tone="slate"
            />
            <DistributionList
              title="Residence"
              items={stats.residenceDistribution}
              tone="sky"
            />
          </div>
        </Panel>

        <Panel
          title="Occupation and family income"
          description="Livelihood and household income from section A."
          icon={Briefcase}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionList
              title="Occupation"
              items={stats.occupationDistribution}
              tone="emerald"
            />
            <div className="grid gap-5">
              <DistributionList
                title="Family income (BDT / month)"
                items={stats.familyIncomeDistribution}
                tone="amber"
              />
              <DistributionList
                title="Marital status"
                items={stats.maritalDistribution}
                tone="slate"
              />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Meal patterns"
          description="Eating behaviour indicators from section C."
          icon={UtensilsCrossed}
        >
          <DistributionList
            title="Main meals per day"
            items={stats.mealsPerDayDistribution}
            tone="emerald"
          />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricTile
              label="Meals per day"
              value={display(stats.averageMealsPerDay)}
              note="Average"
            />
            <MetricTile
              label="Water intake"
              value={display(stats.averageWaterLitres)}
              note="Litres per day"
            />
            <MetricTile
              label="Meals skipped"
              value={display(stats.averageSkipDays)}
              note="Days per week"
            />
            {shareTile("Skips breakfast", stats.breakfastSkipped, "amber")}
            {shareTile("Mostly outside food", stats.mostlyOutsideFood, "amber")}
            {shareTile("Irregular timing", stats.irregularMealTiming, "amber")}
            {shareTile("Eats after 9 PM 5+ days", stats.frequentLateEating, "amber")}
            {shareTile("Snacks 5+ days/week", stats.frequentSnacking, "slate")}
            {shareTile("Eats with screens 5+ days", stats.frequentScreenEating, "slate")}
            {shareTile("Usually eats alone", stats.eatsAlone, "slate")}
            {shareTile("On a special diet", stats.specialDiet, "sky")}
            {shareTile("No safe drinking water", stats.noSafeWater, "rose")}
          </div>
        </Panel>

        <Panel
          title="Activity and sleep"
          description="Physical activity and rest from section D."
          icon={Activity}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionList
              title="Physical activity"
              items={stats.physicalActivityDistribution}
              tones={activityTones}
            />
            <DistributionList
              title="Sleep quality"
              items={stats.sleepQualityDistribution}
              tones={["rose", "amber", "slate", "emerald", "emerald"]}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricTile
              label="Sleep"
              value={display(stats.averageSleepHours)}
              note="Hours per night"
            />
            <MetricTile
              label="Sitting time"
              value={display(stats.averageSittingHours)}
              note="Hours per day"
            />
            {shareTile("Poor sleep", stats.poorSleepQuality, "amber")}
            {shareTile("Sleeps under 6 h", stats.shortSleep, "amber")}
            {shareTile("Sits 8+ h/day", stats.prolongedSitting, "rose")}
          </div>
        </Panel>
      </div>

      <Panel
        title="Psychosocial indicators"
        description="Self-reported wellbeing and eating behaviour from section D. Percentages are over respondents who answered each question."
        icon={HeartPulse}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {shareTile("Depressive symptoms", stats.depressiveSymptoms, "rose")}
          {shareTile("Anxiety symptoms", stats.anxietySymptoms, "rose")}
          {shareTile("High stress", stats.highStress, "rose")}
          {shareTile("Emotional overeating", stats.emotionalOvereating, "amber")}
          {shareTile("Skips meals when low", stats.emotionalUndereating, "amber")}
          {shareTile("Low social support", stats.lowSupport, "amber")}
          {shareTile("Unhappy with food relationship", stats.poorFoodRelationship, "amber")}
          {shareTile(
            "Body image differs from BMI",
            stats.bodyImageMismatch,
            "slate",
          )}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DistributionList
            title="Overall stress (last month)"
            items={stats.stressDistribution}
            tones={["emerald", "emerald", "amber", "rose", "rose"]}
          />
          <DistributionList
            title="Self-perceived weight"
            items={stats.bodyImageDistribution}
            tone="sky"
          />
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Submission trend"
          description="Daily counts for the last 7 days and weekly counts for the last 8 weeks."
          icon={Activity}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Last 7 days
          </p>
          <MiniTrend days={stats.last7Days} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Last 8 weeks (week starting)
          </p>
          <MiniTrend days={stats.last8Weeks} tone="bg-sky-500" />
        </Panel>

        <Panel
          title="Data quality and completeness"
          description="Review progress, records needing attention and how fully each section is answered."
          icon={AlertTriangle}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile
              label="Reviewed"
              value={`${stats.reviewedPercent}%`}
              note={`${stats.reviewed} of ${stats.total}`}
              tone="emerald"
            />
            <MetricTile
              label="Pending review"
              value={stats.unreviewed}
              note="Awaiting check"
              tone="amber"
            />
            <MetricTile
              label="Quality issues"
              value={`${stats.qualityIssuePercent}%`}
              note={`${stats.qualityIssueCount} records`}
              tone="rose"
            />
            <MetricTile
              label="Included rate"
              value={`${stats.includedPercent}%`}
              note={`${stats.excluded} excluded`}
              tone="slate"
            />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Required questions answered, by section
          </p>
          <div className="mt-3 grid gap-3">
            {stats.completeness.map((section: any) => (
              <DistributionBar
                key={section.id}
                label={section.label}
                count={section.answered}
                percentValue={section.percent}
                tone={section.percent >= 95 ? "emerald" : section.percent >= 80 ? "amber" : "rose"}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Interviewer monitoring"
          description="Forms collected per interviewer code, with review and quality status."
          icon={Users}
        >
          <BreakdownTable
            rows={stats.interviewerBreakdown}
            firstColumn="Interviewer"
            emptyText="No submissions yet."
          />
        </Panel>
        <Panel
          title="Area coverage"
          description="Forms collected per district or area."
          icon={MapPin}
        >
          <BreakdownTable
            rows={stats.areaBreakdown}
            firstColumn="District / area"
            emptyText="No submissions yet."
          />
        </Panel>
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
          <Button asChild href="/admin/submissions" variant="outline" size="sm">
            View all
          </Button>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Respondent</th>
                <th className="p-3">Sex</th>
                <th className="p-3">CKD</th>
                <th className="p-3">BMI</th>
                <th className="p-3">HDDS</th>
                <th className="p-3">Review</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest.map((response: any) => (
                <tr key={response._id} className="border-t">
                  <td className="p-3 font-medium">
                    {response.respondentId}
                    <p className="text-xs font-normal text-slate-500">
                      {response.districtArea} · {response.interviewerCode}
                    </p>
                  </td>
                  <td className="p-3">{response.sexLabel || "-"}</td>
                  <td className="p-3">{response.ckdStatus}</td>
                  <td className="p-3">
                    {response.bmi ?? "-"}
                    {response.bmiClass ? (
                      <span className="ml-1 text-xs text-slate-500">
                        {response.bmiClass}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3">{response.hddsScore ?? "-"}</td>
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
                  <td className="p-4 text-center text-slate-500" colSpan={9}>
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
