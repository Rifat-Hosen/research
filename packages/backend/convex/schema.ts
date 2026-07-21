import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  surveyResponses: defineTable({
    respondentId: v.string(),
    email: v.string(),
    emailNormalized: v.string(),
    name: v.string(),
    date: v.string(),
    districtArea: v.string(),
    interviewerCode: v.string(),
    consentGiven: v.boolean(),
    sociodemographic: v.any(),
    anthropometry: v.any(),
    heiFoodGroups: v.any(),
    heiFatsSodiumSugars: v.any(),
    dietaryDiversity: v.any(),
    mealPatterns: v.any(),
    doubleBurden: v.any(),
    physicalActivity: v.any(),
    enumeratorChecks: v.any(),
    psychosocial: v.any(),
    nutritionKnowledge: v.any(),
    notes: v.string(),
    bmi: v.union(v.number(), v.null()),
    bmiClassCode: v.union(v.number(), v.null()),
    hddsScore: v.union(v.number(), v.null()),
    heiScore: v.union(v.number(), v.null()),
    doubleBurdenFlag: v.union(v.boolean(), v.null()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    excludedFromAnalysis: v.optional(v.boolean()),
    exclusionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_emailNormalized", ["emailNormalized"])
    .index("by_createdAt", ["createdAt"])
    .index("by_bmiClassCode", ["bmiClassCode"]),
});
