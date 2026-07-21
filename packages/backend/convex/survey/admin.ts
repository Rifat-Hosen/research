import { v } from "convex/values";
import { query } from "../_generated/server";
import { getBmiClassLabel } from "./scoring";

function toExportRow(response: any) {
  const sections = [
    response.sociodemographic,
    response.anthropometry,
    response.heiFoodGroups,
    response.heiFatsSodiumSugars,
    response.dietaryDiversity,
    response.mealPatterns,
    response.doubleBurden,
    response.physicalActivity,
    response.enumeratorChecks,
    response.psychosocial,
    response.nutritionKnowledge,
  ];
  const answers = Object.assign({}, ...sections);

  return {
    respondentId: response.respondentId,
    email: response.email,
    name: response.name,
    date: response.date,
    districtArea: response.districtArea,
    interviewerCode: response.interviewerCode,
    consentGiven: response.consentGiven,
    bmi: response.bmi ?? "",
    bmiClassCode: response.bmiClassCode ?? "",
    bmiClass: getBmiClassLabel(response.bmiClassCode),
    hddsScore: response.hddsScore ?? "",
    heiScore: response.heiScore ?? "",
    doubleBurdenFlag: response.doubleBurdenFlag,
    createdAt: new Date(response.createdAt).toISOString(),
    ...answers,
    notes: response.notes,
  };
}

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5000);
    const responsesWithBmi = responses.filter(
      (response) => response.bmi != null,
    );
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();

    return {
      total: responses.length,
      today: responses.filter((response) => response.createdAt >= todayStartMs)
        .length,
      averageBmi: responsesWithBmi.length
        ? Math.round(
            (responsesWithBmi.reduce(
              (sum, response) => sum + (response.bmi ?? 0),
              0,
            ) /
              responsesWithBmi.length) *
              10,
          ) / 10
        : null,
      latest: responses.slice(0, 5),
    };
  },
});

export const listResponses = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 200, 1000);
    const search = args.search?.trim().toLowerCase();
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);

    if (!search) return responses;

    return responses.filter((response) =>
      [
        response.respondentId,
        response.email,
        response.name,
        response.districtArea,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  },
});

export const getResponse = query({
  args: {
    id: v.id("surveyResponses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const exportRows = query({
  args: {},
  handler: async (ctx) => {
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_createdAt")
      .order("desc")
      .take(10000);

    return responses.map(toExportRow);
  },
});
