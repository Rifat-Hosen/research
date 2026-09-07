import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { surveySections, type SurveyField } from "./questionnaire";
import { getBmiClassLabel } from "./scoring";

const targetSampleSize = 500;

const sectionKeyById: Record<string, string> = {
  sociodemographic: "sociodemographic",
  dietaryDiversity: "dietaryDiversity",
  mealPatterns: "mealPatterns",
  psychosocial: "psychosocial",
};

function valueAsString(value: unknown) {
  if (Array.isArray(value)) return value.join("; ");
  return value == null || value === "" ? "" : String(value);
}

function answerLabel(field: SurveyField, value: unknown) {
  if (field.options?.length) {
    const label = field.options.find(
      (option) => option.value === String(value),
    )?.label;
    return label ?? valueAsString(value);
  }
  return valueAsString(value);
}

function readableAnswers(response: any) {
  const rows: Record<string, string> = {};

  for (const section of surveySections) {
    const responseKey = sectionKeyById[section.id];
    if (!responseKey) continue;

    const values = response[responseKey] ?? {};
    for (const field of section.fields) {
      rows[`${field.id} ${field.label}`] = answerLabel(field, values[field.id]);
    }
  }

  return rows;
}

function getQualityFlags(response: any) {
  const flags: string[] = [];
  const age = Number(response.sociodemographic?.A1);
  const heightCm = Number(response.sociodemographic?.A15);
  const weightKg = Number(response.sociodemographic?.A16);

  if (!response.respondentId) flags.push("Missing respondent ID");
  if (Number.isFinite(age) && (age < 18 || age > 35)) {
    flags.push("Age outside likely university-student range");
  }
  if (Number.isFinite(heightCm) && (heightCm < 120 || heightCm > 220)) {
    flags.push("Height needs review");
  }
  if (Number.isFinite(weightKg) && (weightKg < 30 || weightKg > 180)) {
    flags.push("Weight needs review");
  }
  if (response.bmi != null && (response.bmi < 14 || response.bmi > 45)) {
    flags.push("BMI needs review");
  }
  if (response.hddsScore != null && response.hddsScore < 4) {
    flags.push("Low dietary diversity");
  }
  if (response.excludedFromAnalysis) flags.push("Excluded from analysis");

  return flags;
}

function sexLabelOf(code: unknown) {
  if (code === "0") return "Male";
  if (code === "1") return "Female";
  if (code === "2") return "Other";
  return "";
}

/** A17 was added after data collection started, so older records are blank. */
function ckdLabelOf(code: unknown) {
  if (code === "1") return "CKD";
  if (code === "0") return "No CKD";
  return "Not asked";
}

function hddsTierOf(score: unknown) {
  const value = Number(score);
  if (!Number.isFinite(value)) return "";
  if (value <= 3) return "low";
  if (value <= 5) return "medium";
  return "high";
}

function ageBandOf(age: unknown) {
  const value = Number(age);
  if (!Number.isFinite(value)) return "";
  return ageBands.find((band) => value >= band.min && value <= band.max)?.code ?? "";
}

function withComputedFields(response: any) {
  const qualityFlags = getQualityFlags(response);
  return {
    ...response,
    bmiClass: getBmiClassLabel(response.bmiClassCode),
    sexLabel: sexLabelOf(response.sociodemographic?.A2),
    ckdStatus: ckdLabelOf(response.sociodemographic?.A17),
    reviewed: Boolean(response.reviewedAt),
    excludedFromAnalysis: Boolean(response.excludedFromAnalysis),
    qualityFlags,
    qualityFlagCount: qualityFlags.length,
  };
}

function applyFilters(
  responses: any[],
  filters: {
    search?: string;
    bmiClassCode?: number;
    sex?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    ckd?: string;
    residence?: string;
    hddsTier?: string;
    ageBand?: string;
    quality?: string;
    interviewerCode?: string;
    districtArea?: string;
  },
) {
  const search = filters.search?.trim().toLowerCase();
  const fromMs = filters.fromDate ? new Date(filters.fromDate).getTime() : null;
  const toMs = filters.toDate
    ? new Date(`${filters.toDate}T23:59:59.999`).getTime()
    : null;

  return responses.filter((response) => {
    if (
      search &&
      ![response.respondentId, response.districtArea]
        .join(" ")
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }

    if (
      filters.bmiClassCode != null &&
      response.bmiClassCode !== filters.bmiClassCode
    ) {
      return false;
    }

    if (filters.sex && response.sociodemographic?.A2 !== filters.sex) {
      return false;
    }

    if (filters.ckd) {
      const code = response.sociodemographic?.A17;
      if (filters.ckd === "missing") {
        if (code === "0" || code === "1") return false;
      } else if (code !== filters.ckd) {
        return false;
      }
    }
    if (
      filters.residence &&
      response.sociodemographic?.A12 !== filters.residence
    ) {
      return false;
    }
    if (filters.hddsTier && hddsTierOf(response.hddsScore) !== filters.hddsTier) {
      return false;
    }
    if (
      filters.ageBand &&
      ageBandOf(response.sociodemographic?.A1) !== filters.ageBand
    ) {
      return false;
    }
    if (filters.quality) {
      const flagged = getQualityFlags(response).length > 0;
      if (filters.quality === "flagged" && !flagged) return false;
      if (filters.quality === "clear" && flagged) return false;
    }
    if (
      filters.interviewerCode &&
      String(response.interviewerCode ?? "").toLowerCase() !==
        filters.interviewerCode.trim().toLowerCase()
    ) {
      return false;
    }
    if (
      filters.districtArea &&
      !String(response.districtArea ?? "")
        .toLowerCase()
        .includes(filters.districtArea.trim().toLowerCase())
    ) {
      return false;
    }

    if (filters.status === "reviewed" && !response.reviewedAt) return false;
    if (filters.status === "unreviewed" && response.reviewedAt) return false;
    if (filters.status === "excluded" && !response.excludedFromAnalysis) {
      return false;
    }
    if (filters.status === "included" && response.excludedFromAnalysis) {
      return false;
    }
    if (fromMs != null && response.createdAt < fromMs) return false;
    if (toMs != null && response.createdAt > toMs) return false;

    return true;
  });
}

function sortResponses(responses: any[], sortBy?: string, sortDir?: string) {
  const dir = sortDir === "asc" ? 1 : -1;
  const key = sortBy || "createdAt";

  return [...responses].sort((first, second) => {
    const firstValue = first[key] ?? "";
    const secondValue = second[key] ?? "";
    if (firstValue < secondValue) return -1 * dir;
    if (firstValue > secondValue) return 1 * dir;
    return 0;
  });
}

function toExportRow(response: any, readable = false) {
  const sections = [
    response.sociodemographic,
    response.dietaryDiversity,
    response.mealPatterns,
    response.psychosocial,
  ];
  const answers = Object.assign({}, ...sections);

  return {
    respondentId: response.respondentId,
    date: response.date,
    districtArea: response.districtArea,
    interviewerCode: response.interviewerCode,
    consentGiven: response.consentGiven,
    bmi: response.bmi ?? "",
    bmiClassCode: response.bmiClassCode ?? "",
    bmiClass: getBmiClassLabel(response.bmiClassCode),
    hddsScore: response.hddsScore ?? "",
    reviewed: Boolean(response.reviewedAt),
    reviewedAt: response.reviewedAt ? new Date(response.reviewedAt).toISOString() : "",
    excludedFromAnalysis: Boolean(response.excludedFromAnalysis),
    exclusionReason: response.exclusionReason ?? "",
    adminNotes: response.adminNotes ?? "",
    qualityFlags: getQualityFlags(response).join("; "),
    createdAt: new Date(response.createdAt).toISOString(),
    ...(readable ? readableAnswers(response) : answers),
  };
}

const socioOf = (response: any) => response.sociodemographic ?? {};
const mealsOf = (response: any) => response.mealPatterns ?? {};
const psychOf = (response: any) => response.psychosocial ?? {};

function answered(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function averageOf(responses: any[], read: (response: any) => unknown) {
  const values = responses
    .map((response) => toNumber(read(response)))
    .filter((value): value is number => value != null);
  if (!values.length) return null;
  return (
    Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) /
    10
  );
}

/** Coded-option breakdown, with percentages over respondents who answered. */
function distributionOf(
  responses: any[],
  read: (response: any) => unknown,
  options: { code: string; label: string }[],
) {
  const base = responses.filter((response) => answered(read(response))).length;
  return options.map((option) => {
    const count = responses.filter(
      (response) => String(read(response)) === option.code,
    ).length;
    return {
      ...option,
      count,
      percent: base ? Math.round((count / base) * 100) : 0,
    };
  });
}

/** Share of respondents meeting a condition, over those who answered. */
function shareOf(
  responses: any[],
  read: (response: any) => unknown,
  matches: (value: string) => boolean,
) {
  const eligible = responses.filter((response) => answered(read(response)));
  const count = eligible.filter((response) =>
    matches(String(read(response))),
  ).length;
  return {
    count,
    base: eligible.length,
    percent: eligible.length
      ? Math.round((count / eligible.length) * 100)
      : 0,
  };
}

const ageBands = [
  { code: "u20", label: "Under 20", min: 0, max: 19 },
  { code: "20_24", label: "20-24", min: 20, max: 24 },
  { code: "25_29", label: "25-29", min: 25, max: 29 },
  { code: "30_34", label: "30-34", min: 30, max: 34 },
  { code: "35p", label: "35 and over", min: 35, max: 200 },
];

/** FANTA dietary-diversity tiers. */
const hddsTiers = [
  { code: "low", label: "Low (0-3 groups)", min: 0, max: 3 },
  { code: "medium", label: "Medium (4-5 groups)", min: 4, max: 5 },
  { code: "high", label: "High (6+ groups)", min: 6, max: 99 },
];

const dashboardFilterArgs = {
  sex: v.optional(v.string()),
  ckd: v.optional(v.string()),
  residence: v.optional(v.string()),
  ageBand: v.optional(v.string()),
  fromDate: v.optional(v.string()),
  toDate: v.optional(v.string()),
  interviewerCode: v.optional(v.string()),
  districtArea: v.optional(v.string()),
};

export const getDashboardStats = query({
  args: dashboardFilterArgs,
  handler: async (ctx, args) => {
    const allResponses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5000);
    const responses = applyFilters(allResponses, args);
    const filtersActive = Object.values(args).some(
      (value) => value !== undefined && value !== "",
    );
    const responsesWithBmi = responses.filter(
      (response) => response.bmi != null && !response.excludedFromAnalysis,
    );
    const includedResponses = responses.filter(
      (response) => !response.excludedFromAnalysis,
    );
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    const sevenDaysAgoMs = todayStartMs - 6 * 24 * 60 * 60 * 1000;
    const average = (values: number[]) =>
      values.length
        ? Math.round(
            (values.reduce((sum, value) => sum + value, 0) / values.length) *
              10,
          ) / 10
        : null;

    const bmiDistribution = [0, 1, 2, 3].map((code) => {
      const count = includedResponses.filter(
        (response) => response.bmiClassCode === code,
      ).length;
      return {
        code,
        label: getBmiClassLabel(code as any),
        count,
        percent: responsesWithBmi.length
          ? Math.round((count / responsesWithBmi.length) * 100)
          : 0,
      };
    });

    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const dayStart = sevenDaysAgoMs + index * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const date = new Date(dayStart);
      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: responses.filter(
          (response) =>
            response.createdAt >= dayStart && response.createdAt < dayEnd,
        ).length,
      };
    });
    const sexDistribution = [
      { code: "0", label: "Male" },
      { code: "1", label: "Female" },
      { code: "2", label: "Other" },
    ].map((item) => {
      const count = responses.filter(
        (response) =>
          response.sociodemographic?.A2 === item.code &&
          !response.excludedFromAnalysis,
      ).length;
      return {
        ...item,
        count,
        percent: includedResponses.length
          ? Math.round((count / includedResponses.length) * 100)
          : 0,
      };
    });
    // Substantive indicators are computed on records included in analysis.
    const ageDistribution = (() => {
      const withAge = includedResponses.filter(
        (response) => toNumber(socioOf(response).A1) != null,
      );
      return ageBands.map((band) => {
        const count = withAge.filter((response) => {
          const age = toNumber(socioOf(response).A1) ?? -1;
          return age >= band.min && age <= band.max;
        }).length;
        return {
          code: band.code,
          label: band.label,
          count,
          percent: withAge.length
            ? Math.round((count / withAge.length) * 100)
            : 0,
        };
      });
    })();

    const hddsDistribution = (() => {
      const scored = includedResponses.filter(
        (response) => response.hddsScore != null,
      );
      return hddsTiers.map((tier) => {
        const count = scored.filter(
          (response) =>
            (response.hddsScore ?? -1) >= tier.min &&
            (response.hddsScore ?? -1) <= tier.max,
        ).length;
        return {
          code: tier.code,
          label: tier.label,
          count,
          percent: scored.length
            ? Math.round((count / scored.length) * 100)
            : 0,
        };
      });
    })();

    const overweightObeseCount = includedResponses.filter(
      (response) => response.bmiClassCode === 2 || response.bmiClassCode === 3,
    ).length;
    const underweightCount = includedResponses.filter(
      (response) => response.bmiClassCode === 0,
    ).length;

    // Body image (D11) versus measured BMI class, for perception mismatch.
    const bodyImageMismatch = (() => {
      const comparable = includedResponses.filter(
        (response) =>
          response.bmiClassCode != null &&
          answered(psychOf(response).D11) &&
          String(psychOf(response).D11) !== "9",
      );
      const perceivedClass = (code: string) =>
        code === "0" ? 0 : code === "1" ? 1 : 2;
      const actualClass = (code: number) => (code === 3 ? 2 : code);
      const count = comparable.filter(
        (response) =>
          perceivedClass(String(psychOf(response).D11)) !==
          actualClass(response.bmiClassCode as number),
      ).length;
      return {
        count,
        base: comparable.length,
        percent: comparable.length
          ? Math.round((count / comparable.length) * 100)
          : 0,
      };
    })();

    // Section A - chronic kidney disease (A17)
    const ckdPatients = shareOf(
      includedResponses,
      (r) => socioOf(r).A17,
      (value) => value === "1",
    );
    const ckdNotAsked = includedResponses.filter(
      (response) => !answered(socioOf(response).A17),
    ).length;

    const bmiClassOptions = [0, 1, 2, 3].map((code) => ({
      code,
      label: getBmiClassLabel(code as any),
    }));

    /** BMI class counts and key indicators inside one subgroup. */
    const groupProfile = (label: string, group: any[]) => {
      const withBmi = group.filter((response) => response.bmi != null);
      const percentOf = (count: number) =>
        withBmi.length ? Math.round((count / withBmi.length) * 100) : 0;
      return {
        label,
        count: group.length,
        averageBmi: averageOf(withBmi, (r) => r.bmi),
        averageHdds: averageOf(
          group.filter((r) => r.hddsScore != null),
          (r) => r.hddsScore,
        ),
        bmiClasses: bmiClassOptions.map((option) => {
          const count = withBmi.filter(
            (response) => response.bmiClassCode === option.code,
          ).length;
          return { ...option, count, percent: percentOf(count) };
        }),
        overweightObesePercent: percentOf(
          withBmi.filter((r) => r.bmiClassCode === 2 || r.bmiClassCode === 3)
            .length,
        ),
        underweightPercent: percentOf(
          withBmi.filter((r) => r.bmiClassCode === 0).length,
        ),
        foodInsecurePercent: shareOf(
          group,
          (r) => socioOf(r).A11,
          (value) => value === "1",
        ).percent,
        highStressPercent: shareOf(
          group,
          (r) => psychOf(r).D3,
          (value) => value === "3" || value === "4",
        ).percent,
      };
    };

    const bmiBySex = [
      { code: "0", label: "Male" },
      { code: "1", label: "Female" },
    ].map((item) =>
      groupProfile(
        item.label,
        includedResponses.filter((r) => socioOf(r).A2 === item.code),
      ),
    );
    const bmiByCkd = [
      { code: "1", label: "CKD patients" },
      { code: "0", label: "Non-CKD" },
    ].map((item) =>
      groupProfile(
        item.label,
        includedResponses.filter((r) => socioOf(r).A17 === item.code),
      ),
    );
    const bmiByResidence = [
      { code: "0", label: "Rural" },
      { code: "1", label: "Urban" },
      { code: "2", label: "Semi-urban" },
      { code: "3", label: "Slum" },
    ].map((item) =>
      groupProfile(
        item.label,
        includedResponses.filter((r) => socioOf(r).A12 === item.code),
      ),
    );

    /** Field monitoring - who is collecting data and where. */
    const breakdownBy = (read: (response: any) => string, limit = 12) => {
      const groups = new Map<string, any[]>();
      for (const response of responses) {
        const key = read(response) || "(blank)";
        groups.set(key, [...(groups.get(key) ?? []), response]);
      }
      return [...groups.entries()]
        .map(([label, group]) => ({
          label,
          count: group.length,
          reviewed: group.filter((r) => r.reviewedAt).length,
          excluded: group.filter((r) => r.excludedFromAnalysis).length,
          flagged: group.filter((r) => getQualityFlags(r).length > 0).length,
          last7Days: group.filter((r) => r.createdAt >= sevenDaysAgoMs).length,
          lastSubmissionAt: Math.max(...group.map((r) => r.createdAt)),
        }))
        .sort((first, second) => second.count - first.count)
        .slice(0, limit);
    };
    const interviewerBreakdown = breakdownBy((r) =>
      String(r.interviewerCode ?? "").trim(),
    );
    const areaBreakdown = breakdownBy((r) =>
      String(r.districtArea ?? "").trim(),
    );

    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeekStartMs =
      todayStartMs - todayStart.getDay() * 24 * 60 * 60 * 1000;
    const last8Weeks = Array.from({ length: 8 }, (_, index) => {
      const weekStart = thisWeekStartMs - (7 - index) * weekMs;
      const weekEnd = weekStart + weekMs;
      return {
        label: new Date(weekStart).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: responses.filter(
          (r) => r.createdAt >= weekStart && r.createdAt < weekEnd,
        ).length,
      };
    });

    /** Share of required questions answered per section, over included records. */
    const completeness = surveySections
      .filter((section) => sectionKeyById[section.id])
      .map((section) => {
        const requiredFields = section.fields.filter((field) => field.required);
        const key = sectionKeyById[section.id];
        let answeredCount = 0;
        for (const response of includedResponses) {
          const values = response[key] ?? {};
          answeredCount += requiredFields.filter((field) =>
            answered(values[field.id]),
          ).length;
        }
        const expected = requiredFields.length * includedResponses.length;
        return {
          id: section.id,
          label: section.title,
          percent: expected ? Math.round((answeredCount / expected) * 100) : 0,
          answered: answeredCount,
          expected,
        };
      });

    const dailyAverageLast7 =
      Math.round(
        (last7Days.reduce((sum, day) => sum + day.count, 0) / 7) * 10,
      ) / 10;
    const projectedDaysToTarget =
      dailyAverageLast7 > 0
        ? Math.ceil(
            Math.max(0, targetSampleSize - includedResponses.length) /
              dailyAverageLast7,
          )
        : null;

    return {
      filtersActive,
      totalUnfiltered: allResponses.length,
      total: responses.length,
      today: responses.filter((response) => response.createdAt >= todayStartMs)
        .length,
      targetSampleSize,
      remainingSample: Math.max(0, targetSampleSize - includedResponses.length),
      sampleCompletionPercent: Math.min(
        100,
        Math.round((includedResponses.length / targetSampleSize) * 100),
      ),
      included: includedResponses.length,
      excluded: responses.length - includedResponses.length,
      reviewed: responses.filter((response) => response.reviewedAt).length,
      unreviewed: responses.filter((response) => !response.reviewedAt).length,
      reviewedPercent: responses.length
        ? Math.round(
            (responses.filter((response) => response.reviewedAt).length /
              responses.length) *
              100,
          )
        : 0,
      includedPercent: responses.length
        ? Math.round((includedResponses.length / responses.length) * 100)
        : 0,
      qualityIssueCount: responses.filter(
        (response) => getQualityFlags(response).length > 0,
      ).length,
      qualityIssuePercent: responses.length
        ? Math.round(
            (responses.filter((response) => getQualityFlags(response).length > 0)
              .length /
              responses.length) *
              100,
          )
        : 0,
      thisWeek: responses.filter((response) => response.createdAt >= sevenDaysAgoMs)
        .length,
      averageBmi: average(
        responsesWithBmi.map((response) => response.bmi ?? 0),
      ),
      averageHdds: average(
        includedResponses
          .filter((response) => response.hddsScore != null)
          .map((response) => response.hddsScore ?? 0),
      ),
      bmiRecorded: responsesWithBmi.length,
      bmiMissing: responses.length - responsesWithBmi.length,
      bmiDistribution,
      overweightObese: {
        count: overweightObeseCount,
        percent: responsesWithBmi.length
          ? Math.round((overweightObeseCount / responsesWithBmi.length) * 100)
          : 0,
      },
      underweight: {
        count: underweightCount,
        percent: responsesWithBmi.length
          ? Math.round((underweightCount / responsesWithBmi.length) * 100)
          : 0,
      },

      // Section A - respondent profile
      averageAge: averageOf(includedResponses, (r) => socioOf(r).A1),
      ageDistribution,
      educationDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A7,
        [
          { code: "0", label: "None" },
          { code: "1", label: "Primary" },
          { code: "2", label: "SSC" },
          { code: "3", label: "HSC" },
          { code: "4", label: "Graduate" },
          { code: "5", label: "Postgraduate" },
        ],
      ),
      residenceDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A12,
        [
          { code: "0", label: "Rural" },
          { code: "1", label: "Urban" },
          { code: "2", label: "Semi-urban" },
          { code: "3", label: "Slum" },
        ],
      ),
      foodInsecurity: shareOf(
        includedResponses,
        (r) => socioOf(r).A11,
        (value) => value === "1",
      ),
      currentSmoker: shareOf(
        includedResponses,
        (r) => socioOf(r).A13,
        (value) => value === "2",
      ),
      ckdPatients,
      ckdNotAsked,
      ckdDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A17,
        [
          { code: "0", label: "No CKD" },
          { code: "1", label: "CKD patient" },
        ],
      ),
      occupationDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A4,
        [
          { code: "1", label: "Student" },
          { code: "2", label: "Service" },
          { code: "3", label: "Business" },
          { code: "4", label: "Unemployed" },
          { code: "5", label: "Other" },
          { code: "6", label: "Homemaker" },
          { code: "7", label: "Labour" },
          { code: "8", label: "Agriculture" },
        ],
      ),
      familyIncomeDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A9,
        [
          { code: "0", label: "Up to 10,000" },
          { code: "1", label: "10,001 - 20,000" },
          { code: "2", label: "20,001 - 40,000" },
          { code: "3", label: "More than 40,000" },
        ],
      ),
      maritalDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A6,
        [
          { code: "1", label: "Unmarried" },
          { code: "2", label: "Married" },
          { code: "3", label: "Divorced/separated" },
          { code: "4", label: "Widowed" },
        ],
      ),
      smokingDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A13,
        [
          { code: "0", label: "Never smoked" },
          { code: "1", label: "Former smoker" },
          { code: "2", label: "Current smoker" },
        ],
      ),
      pregnancyDistribution: distributionOf(
        includedResponses,
        (r) => socioOf(r).A14,
        [
          { code: "0", label: "Neither" },
          { code: "1", label: "Pregnant" },
          { code: "2", label: "Breastfeeding" },
          { code: "9", label: "Does not apply" },
        ],
      ),
      jointFamily: shareOf(
        includedResponses,
        (r) => socioOf(r).A10,
        (value) => value === "1",
      ),
      averageHouseholdSize: averageOf(includedResponses, (r) => socioOf(r).A8),
      bmiBySex,
      bmiByCkd,
      bmiByResidence,

      // Section B - dietary diversity
      hddsDistribution,

      // Section C - meal patterns
      averageMealsPerDay: averageOf(includedResponses, (r) => mealsOf(r).C1),
      breakfastSkipped: shareOf(
        includedResponses,
        (r) => mealsOf(r).C2,
        (value) => value === "0",
      ),
      averageSkipDays: averageOf(includedResponses, (r) => mealsOf(r).C3),
      mostlyOutsideFood: shareOf(
        includedResponses,
        (r) => mealsOf(r).C4,
        (value) => value === "2",
      ),
      averageWaterLitres: averageOf(includedResponses, (r) => mealsOf(r).C6),
      irregularMealTiming: shareOf(
        includedResponses,
        (r) => mealsOf(r).C10,
        (value) => value === "0" || value === "1",
      ),
      mealsPerDayDistribution: distributionOf(
        includedResponses,
        (r) => mealsOf(r).C1,
        [
          { code: "1", label: "1 meal" },
          { code: "2", label: "2 meals" },
          { code: "3", label: "3 meals" },
          { code: "4", label: "4 or more" },
        ],
      ),
      specialDiet: shareOf(
        includedResponses,
        (r) => mealsOf(r).C7,
        (value) => value === "1",
      ),
      noSafeWater: shareOf(
        includedResponses,
        (r) => mealsOf(r).C5,
        (value) => value === "0",
      ),
      frequentLateEating: shareOf(
        includedResponses,
        (r) => mealsOf(r).C8,
        (value) => value === "3" || value === "4",
      ),
      frequentSnacking: shareOf(
        includedResponses,
        (r) => mealsOf(r).C9,
        (value) => value === "3" || value === "4",
      ),
      frequentScreenEating: shareOf(
        includedResponses,
        (r) => mealsOf(r).C11,
        (value) => value === "3" || value === "4",
      ),
      eatsAlone: shareOf(
        includedResponses,
        (r) => mealsOf(r).C12,
        (value) => value === "0",
      ),

      // Section D - lifestyle and psychosocial
      physicalActivityDistribution: distributionOf(
        includedResponses,
        (r) => psychOf(r).D8,
        [
          { code: "0", label: "No exercise" },
          { code: "1", label: "Light" },
          { code: "2", label: "Moderate" },
          { code: "3", label: "Vigorous" },
        ],
      ),
      averageSittingHours: averageOf(includedResponses, (r) => psychOf(r).D7),
      averageSleepHours: averageOf(includedResponses, (r) => psychOf(r).D6),
      poorSleepQuality: shareOf(
        includedResponses,
        (r) => psychOf(r).D9,
        (value) => value === "0" || value === "1",
      ),
      depressiveSymptoms: shareOf(
        includedResponses,
        (r) => psychOf(r).D1,
        (value) => value === "2" || value === "3",
      ),
      anxietySymptoms: shareOf(
        includedResponses,
        (r) => psychOf(r).D2,
        (value) => value === "2" || value === "3",
      ),
      highStress: shareOf(
        includedResponses,
        (r) => psychOf(r).D3,
        (value) => value === "3" || value === "4",
      ),
      emotionalOvereating: shareOf(
        includedResponses,
        (r) => psychOf(r).D4,
        (value) => value === "2",
      ),
      emotionalUndereating: shareOf(
        includedResponses,
        (r) => psychOf(r).D10,
        (value) => value === "2",
      ),
      lowSupport: shareOf(
        includedResponses,
        (r) => psychOf(r).D12,
        (value) => value === "0" || value === "1",
      ),
      bodyImageMismatch,
      stressDistribution: distributionOf(
        includedResponses,
        (r) => psychOf(r).D3,
        [
          { code: "0", label: "None" },
          { code: "1", label: "Low" },
          { code: "2", label: "Moderate" },
          { code: "3", label: "High" },
          { code: "4", label: "Very high" },
        ],
      ),
      sleepQualityDistribution: distributionOf(
        includedResponses,
        (r) => psychOf(r).D9,
        [
          { code: "0", label: "Very poor" },
          { code: "1", label: "Poor" },
          { code: "2", label: "Fair" },
          { code: "3", label: "Good" },
          { code: "4", label: "Very good" },
        ],
      ),
      bodyImageDistribution: distributionOf(
        includedResponses,
        (r) => psychOf(r).D11,
        [
          { code: "0", label: "Underweight" },
          { code: "1", label: "About right" },
          { code: "2", label: "Overweight" },
          { code: "9", label: "Don't know" },
        ],
      ),
      shortSleep: shareOf(
        includedResponses,
        (r) => psychOf(r).D6,
        (value) => Number(value) < 6,
      ),
      prolongedSitting: shareOf(
        includedResponses,
        (r) => psychOf(r).D7,
        (value) => Number(value) >= 8,
      ),
      poorFoodRelationship: shareOf(
        includedResponses,
        (r) => psychOf(r).D5,
        (value) => value === "0",
      ),

      // Field monitoring
      interviewerBreakdown,
      areaBreakdown,
      last8Weeks,
      completeness,
      dailyAverageLast7,
      projectedDaysToTarget,

      last7Days,
      sexDistribution,
      latest: responses.slice(0, 8).map(withComputedFields),
    };
  },
});

const listArgs = {
  search: v.optional(v.string()),
  limit: v.optional(v.number()),
  page: v.optional(v.number()),
  bmiClassCode: v.optional(v.number()),
  sex: v.optional(v.string()),
  status: v.optional(v.string()),
  fromDate: v.optional(v.string()),
  toDate: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  sortDir: v.optional(v.string()),
  ckd: v.optional(v.string()),
  residence: v.optional(v.string()),
  hddsTier: v.optional(v.string()),
  ageBand: v.optional(v.string()),
  quality: v.optional(v.string()),
  interviewerCode: v.optional(v.string()),
  districtArea: v.optional(v.string()),
};

export const listResponses = query({
  args: listArgs,
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 25, 100);
    const page = Math.max(args.page ?? 1, 1);
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_createdAt")
      .order("desc")
      .take(10000);
    const filtered = applyFilters(responses, args);
    const sorted = sortResponses(filtered, args.sortBy, args.sortDir);
    const start = (page - 1) * limit;

    return {
      rows: sorted.slice(start, start + limit).map(withComputedFields),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  },
});

export const getResponse = query({
  args: {
    id: v.id("surveyResponses"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.id);
    return response ? withComputedFields(response) : null;
  },
});

export const exportRows = query({
  args: {
    ...listArgs,
    readable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_createdAt")
      .order("desc")
      .take(10000);
    const filtered = applyFilters(responses, args);
    const sorted = sortResponses(filtered, args.sortBy, args.sortDir);

    return sorted.map((response) => toExportRow(response, args.readable));
  },
});

export const updateReviewStatus = mutation({
  args: {
    id: v.id("surveyResponses"),
    reviewed: v.boolean(),
    excludedFromAnalysis: v.boolean(),
    adminNotes: v.optional(v.string()),
    exclusionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      reviewedAt: args.reviewed ? Date.now() : undefined,
      reviewedBy: args.reviewed ? "admin" : undefined,
      excludedFromAnalysis: args.excludedFromAnalysis,
      adminNotes: args.adminNotes ?? "",
      exclusionReason: args.exclusionReason ?? "",
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const deleteResponse = mutation({
  args: {
    id: v.id("surveyResponses"),
    confirmationText: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.id);
    if (!response) {
      throw new Error("Submission not found.");
    }

    if (args.confirmationText.trim() !== "DELETE") {
      throw new Error("Type DELETE to confirm deletion.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
