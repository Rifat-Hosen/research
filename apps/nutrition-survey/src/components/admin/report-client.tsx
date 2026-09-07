"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { surveyApi } from "@/lib/convex-api";
import { downloadSurveyRows } from "@/lib/export";
import {
  compactArgs,
  describeFilters,
  emptyPopulationFilters,
  type PopulationFilters,
} from "./filter-controls";
import { PopulationFilterBar } from "./population-filter-bar";
import {
  GroupComparisonTable,
  display,
  type DistributionItem,
  type Share,
} from "./stats-widgets";

type IndicatorRow = {
  section: string;
  indicator: string;
  value: string;
  numerator: string | number;
  denominator: string | number;
};

function shareRow(section: string, indicator: string, share: Share): IndicatorRow {
  return {
    section,
    indicator,
    value: share.base ? `${share.percent}%` : "-",
    numerator: share.count,
    denominator: share.base,
  };
}

function averageRow(
  section: string,
  indicator: string,
  value: number | null,
  unit: string,
): IndicatorRow {
  return {
    section,
    indicator,
    value: value == null ? "-" : `${value} ${unit}`,
    numerator: "",
    denominator: "",
  };
}

function distributionRows(
  section: string,
  indicator: string,
  items: DistributionItem[],
): IndicatorRow[] {
  const base = items.reduce((sum, item) => sum + item.count, 0);
  return items.map((item) => ({
    section,
    indicator: `${indicator}: ${item.label}`,
    value: base ? `${item.percent}%` : "-",
    numerator: item.count,
    denominator: base,
  }));
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <h3 className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-950">
        {title}
      </h3>
      <div className="mt-3 grid gap-5">{children}</div>
    </section>
  );
}

function DistributionTable({
  title,
  items,
}: {
  title: string;
  items: DistributionItem[];
}) {
  const base = items.reduce((sum, item) => sum + item.count, 0);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <table className="mt-1 w-full text-left text-sm">
        <thead className="text-xs text-slate-500">
          <tr>
            <th className="py-1">Category</th>
            <th className="py-1 text-right">n</th>
            <th className="py-1 text-right">%</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {items.map((item) => (
            <tr key={String(item.code)} className="border-t border-slate-100">
              <td className="py-1">{item.label}</td>
              <td className="py-1 text-right">{item.count}</td>
              <td className="py-1 text-right">{base ? `${item.percent}%` : "-"}</td>
            </tr>
          ))}
          <tr className="border-t border-slate-200 font-medium">
            <td className="py-1">Answered</td>
            <td className="py-1 text-right">{base}</td>
            <td className="py-1 text-right">{base ? "100%" : "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function IndicatorTable({ rows }: { rows: IndicatorRow[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs text-slate-500">
        <tr>
          <th className="py-1">Indicator</th>
          <th className="py-1 text-right">Value</th>
          <th className="py-1 text-right">n / N</th>
        </tr>
      </thead>
      <tbody className="text-slate-700">
        {rows.map((row) => (
          <tr key={row.indicator} className="border-t border-slate-100">
            <td className="py-1">{row.indicator}</td>
            <td className="py-1 text-right font-medium">{row.value}</td>
            <td className="py-1 text-right text-slate-500">
              {row.denominator === "" ? "" : `${row.numerator} / ${row.denominator}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportClient() {
  const [filters, setFilters] = useState<PopulationFilters>(
    emptyPopulationFilters,
  );
  const queryArgs = useMemo(() => compactArgs(filters), [filters]);
  const stats = useQuery(surveyApi.admin.getDashboardStats, queryArgs);

  if (stats === undefined) {
    return (
      <div className="grid gap-6">
        <PopulationFilterBar filters={filters} onChange={setFilters} />
        <div className="rounded-lg border bg-white p-5">Loading...</div>
      </div>
    );
  }

  const generatedAt = new Date().toLocaleString();

  const profileRows: IndicatorRow[] = [
    averageRow("A", "Average age", stats.averageAge, "years"),
    averageRow("A", "Average household size", stats.averageHouseholdSize, "persons"),
    shareRow("A", "Joint or extended family", stats.jointFamily),
    shareRow("A", "Household food insecurity (last 4 weeks)", stats.foodInsecurity),
    shareRow("A", "Current smoker", stats.currentSmoker),
    shareRow("A", "Chronic kidney disease patient (A17)", stats.ckdPatients),
  ];
  const nutritionRows: IndicatorRow[] = [
    averageRow("B", "Average BMI", stats.averageBmi, "kg/m²"),
    {
      section: "B",
      indicator: "Underweight (BMI under 18.5)",
      value: stats.bmiRecorded ? `${stats.underweight.percent}%` : "-",
      numerator: stats.underweight.count,
      denominator: stats.bmiRecorded,
    },
    {
      section: "B",
      indicator: "Overweight or obese (BMI 25 and above)",
      value: stats.bmiRecorded ? `${stats.overweightObese.percent}%` : "-",
      numerator: stats.overweightObese.count,
      denominator: stats.bmiRecorded,
    },
    averageRow("B", "Average HDDS", stats.averageHdds, "of 12 groups"),
  ];
  const mealRows: IndicatorRow[] = [
    averageRow("C", "Average main meals per day", stats.averageMealsPerDay, ""),
    shareRow("C", "Skips breakfast", stats.breakfastSkipped),
    averageRow("C", "Days per week a main meal is skipped", stats.averageSkipDays, ""),
    shareRow("C", "Meals mostly from outside", stats.mostlyOutsideFood),
    shareRow("C", "No access to safe drinking water", stats.noSafeWater),
    averageRow("C", "Plain water intake", stats.averageWaterLitres, "L/day"),
    shareRow("C", "Following a special diet", stats.specialDiet),
    shareRow("C", "Eats after 9 PM on 5 or more days a week", stats.frequentLateEating),
    shareRow("C", "Snacks between meals on 5 or more days a week", stats.frequentSnacking),
    shareRow("C", "Irregular meal timing", stats.irregularMealTiming),
    shareRow("C", "Eats with TV or phone on 5 or more days a week", stats.frequentScreenEating),
    shareRow("C", "Usually eats main meals alone", stats.eatsAlone),
  ];
  const wellbeingRows: IndicatorRow[] = [
    shareRow("D", "Depressive symptoms (more than half the days)", stats.depressiveSymptoms),
    shareRow("D", "Anxiety symptoms (more than half the days)", stats.anxietySymptoms),
    shareRow("D", "High or very high stress", stats.highStress),
    shareRow("D", "Emotional overeating", stats.emotionalOvereating),
    shareRow("D", "Unhappy with relationship with food", stats.poorFoodRelationship),
    averageRow("D", "Average sleep", stats.averageSleepHours, "hours/night"),
    shareRow("D", "Sleeps under 6 hours", stats.shortSleep),
    shareRow("D", "Poor or very poor sleep quality", stats.poorSleepQuality),
    averageRow("D", "Average sitting time", stats.averageSittingHours, "hours/day"),
    shareRow("D", "Sits 8 or more hours a day", stats.prolongedSitting),
    shareRow("D", "Skips meals when low or anxious", stats.emotionalUndereating),
    shareRow("D", "Self-perceived weight differs from measured BMI", stats.bodyImageMismatch),
    shareRow("D", "Little or no social support", stats.lowSupport),
  ];

  const csvRows = [
    ...profileRows,
    ...distributionRows("A", "Sex", stats.sexDistribution),
    ...distributionRows("A", "Age group", stats.ageDistribution),
    ...distributionRows("A", "CKD status", stats.ckdDistribution),
    ...distributionRows("A", "Education", stats.educationDistribution),
    ...distributionRows("A", "Occupation", stats.occupationDistribution),
    ...distributionRows("A", "Family income", stats.familyIncomeDistribution),
    ...distributionRows("A", "Marital status", stats.maritalDistribution),
    ...distributionRows("A", "Residence", stats.residenceDistribution),
    ...distributionRows("A", "Smoking", stats.smokingDistribution),
    ...distributionRows("A", "Pregnancy / breastfeeding", stats.pregnancyDistribution),
    ...nutritionRows,
    ...distributionRows("B", "BMI class", stats.bmiDistribution),
    ...distributionRows("B", "HDDS tier", stats.hddsDistribution),
    ...mealRows,
    ...distributionRows("C", "Main meals per day", stats.mealsPerDayDistribution),
    ...wellbeingRows,
    ...distributionRows("D", "Physical activity", stats.physicalActivityDistribution),
    ...distributionRows("D", "Stress", stats.stressDistribution),
    ...distributionRows("D", "Sleep quality", stats.sleepQualityDistribution),
    ...distributionRows("D", "Self-perceived weight", stats.bodyImageDistribution),
  ].map((row) => ({
    section: row.section,
    indicator: row.indicator,
    value: row.value,
    numerator: row.numerator,
    denominator: row.denominator,
    population: describeFilters(filters),
    generatedAt,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-semibold">Summary report</h2>
          <p className="text-sm text-slate-600">
            Printable indicator tables for the selected population. Use the
            browser print dialog to save as PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              downloadSurveyRows(csvRows, "nutrition-survey-indicators.csv")
            }
          >
            <Download className="size-4" />
            Download indicators CSV
          </Button>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <PopulationFilterBar
        filters={filters}
        onChange={setFilters}
        matching={stats.total}
        totalUnfiltered={stats.totalUnfiltered}
      />

      <div className="grid gap-5 print:gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Nutrition Survey
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Indicator summary report
          </h2>
          <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="font-medium text-slate-800">Population:</dt>
              <dd>{describeFilters(filters)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-800">Generated:</dt>
              <dd>{generatedAt}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-800">Forms matching:</dt>
              <dd>
                {stats.total} of {stats.totalUnfiltered} submitted
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-800">Included in analysis:</dt>
              <dd>
                {stats.included} ({stats.excluded} excluded, {stats.reviewed}{" "}
                reviewed)
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-800">Target progress:</dt>
              <dd>
                {stats.included} / {stats.targetSampleSize} (
                {stats.sampleCompletionPercent}%)
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-slate-800">Quality flags:</dt>
              <dd>
                {stats.qualityIssueCount} records ({stats.qualityIssuePercent}%)
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Substantive indicators are computed on records included in analysis.
            Percentages use respondents who answered each question as the
            denominator.
          </p>
        </section>

        <ReportSection title="Section A. Respondent profile">
          <IndicatorTable rows={profileRows} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DistributionTable title="Sex" items={stats.sexDistribution} />
            <DistributionTable title="Age group" items={stats.ageDistribution} />
            <DistributionTable title="CKD status (A17)" items={stats.ckdDistribution} />
            <DistributionTable title="Education" items={stats.educationDistribution} />
            <DistributionTable title="Occupation" items={stats.occupationDistribution} />
            <DistributionTable
              title="Family income (BDT / month)"
              items={stats.familyIncomeDistribution}
            />
            <DistributionTable title="Marital status" items={stats.maritalDistribution} />
            <DistributionTable title="Residence" items={stats.residenceDistribution} />
            <DistributionTable title="Smoking" items={stats.smokingDistribution} />
            <DistributionTable
              title="Pregnancy / breastfeeding"
              items={stats.pregnancyDistribution}
            />
          </div>
        </ReportSection>

        <ReportSection title="Section B. Nutritional status and dietary diversity">
          <IndicatorTable rows={nutritionRows} />
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionTable title="BMI classification" items={stats.bmiDistribution} />
            <DistributionTable title="HDDS tier" items={stats.hddsDistribution} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              BMI by sex
            </p>
            <GroupComparisonTable groups={stats.bmiBySex} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              BMI by chronic kidney disease status
            </p>
            <GroupComparisonTable groups={stats.bmiByCkd} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              BMI by residence
            </p>
            <GroupComparisonTable groups={stats.bmiByResidence} />
          </div>
        </ReportSection>

        <ReportSection title="Section C. Meals and eating habits">
          <IndicatorTable rows={mealRows} />
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionTable
              title="Main meals per day"
              items={stats.mealsPerDayDistribution}
            />
          </div>
        </ReportSection>

        <ReportSection title="Section D. Wellbeing, sleep and activity">
          <IndicatorTable rows={wellbeingRows} />
          <div className="grid gap-5 sm:grid-cols-2">
            <DistributionTable
              title="Physical activity"
              items={stats.physicalActivityDistribution}
            />
            <DistributionTable title="Overall stress" items={stats.stressDistribution} />
            <DistributionTable
              title="Sleep quality"
              items={stats.sleepQualityDistribution}
            />
            <DistributionTable
              title="Self-perceived weight"
              items={stats.bodyImageDistribution}
            />
          </div>
        </ReportSection>

        <ReportSection title="Field monitoring">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                By interviewer
              </p>
              <table className="mt-1 w-full text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="py-1">Interviewer</th>
                    <th className="py-1 text-right">Forms</th>
                    <th className="py-1 text-right">Reviewed</th>
                    <th className="py-1 text-right">Flagged</th>
                    <th className="py-1 text-right">Excluded</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {stats.interviewerBreakdown.map((row: any) => (
                    <tr key={row.label} className="border-t border-slate-100">
                      <td className="py-1">{row.label}</td>
                      <td className="py-1 text-right">{row.count}</td>
                      <td className="py-1 text-right">{row.reviewed}</td>
                      <td className="py-1 text-right">{row.flagged}</td>
                      <td className="py-1 text-right">{row.excluded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                By district / area
              </p>
              <table className="mt-1 w-full text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="py-1">Area</th>
                    <th className="py-1 text-right">Forms</th>
                    <th className="py-1 text-right">Reviewed</th>
                    <th className="py-1 text-right">Flagged</th>
                    <th className="py-1 text-right">Excluded</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {stats.areaBreakdown.map((row: any) => (
                    <tr key={row.label} className="border-t border-slate-100">
                      <td className="py-1">{row.label}</td>
                      <td className="py-1 text-right">{row.count}</td>
                      <td className="py-1 text-right">{row.reviewed}</td>
                      <td className="py-1 text-right">{row.flagged}</td>
                      <td className="py-1 text-right">{row.excluded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Required questions answered, by section
            </p>
            <table className="mt-1 w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-1">Section</th>
                  <th className="py-1 text-right">Answered</th>
                  <th className="py-1 text-right">Expected</th>
                  <th className="py-1 text-right">%</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {stats.completeness.map((row: any) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-1">{row.label}</td>
                    <td className="py-1 text-right">{row.answered}</td>
                    <td className="py-1 text-right">{row.expected}</td>
                    <td className="py-1 text-right">{row.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Weekly submissions (week starting)
            </p>
            <table className="mt-1 w-full text-left text-sm">
              <tbody className="text-slate-700">
                <tr>
                  {stats.last8Weeks.map((week: any) => (
                    <td key={week.label} className="py-1 text-center">
                      <span className="block text-xs text-slate-500">{week.label}</span>
                      <span className="font-medium">{week.count}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">
              Daily average over the last 7 days: {display(stats.dailyAverageLast7)}.
              {stats.projectedDaysToTarget != null && stats.remainingSample > 0
                ? ` Projected days to reach target: ${stats.projectedDaysToTarget}.`
                : ""}
            </p>
          </div>
        </ReportSection>
      </div>
    </div>
  );
}
