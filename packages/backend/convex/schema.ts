import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  surveyResponses: defineTable({
    respondentId: v.string(),
    date: v.string(),
    districtArea: v.string(),
    interviewerCode: v.string(),
    consentGiven: v.boolean(),
    sociodemographic: v.any(),
    dietaryDiversity: v.any(),
    mealPatterns: v.any(),
    psychosocial: v.any(),
    bmi: v.union(v.number(), v.null()),
    bmiClassCode: v.union(v.number(), v.null()),
    hddsScore: v.union(v.number(), v.null()),
    doubleBurdenFlag: v.union(v.boolean(), v.null()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    excludedFromAnalysis: v.optional(v.boolean()),
    exclusionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_respondentId", ["respondentId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_bmiClassCode", ["bmiClassCode"]),
});
