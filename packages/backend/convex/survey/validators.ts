import { v } from "convex/values";

export const surveySectionPayloadValidator = v.record(v.string(), v.any());

export const submitSurveyArgsValidator = {
  respondentId: v.string(),
  email: v.string(),
  date: v.string(),
  districtArea: v.string(),
  interviewerCode: v.string(),
  consentGiven: v.boolean(),
  sociodemographic: surveySectionPayloadValidator,
  anthropometry: surveySectionPayloadValidator,
  heiFoodGroups: surveySectionPayloadValidator,
  heiFatsSodiumSugars: surveySectionPayloadValidator,
  dietaryDiversity: surveySectionPayloadValidator,
  mealPatterns: surveySectionPayloadValidator,
  doubleBurden: surveySectionPayloadValidator,
  physicalActivity: surveySectionPayloadValidator,
  enumeratorChecks: surveySectionPayloadValidator,
  psychosocial: surveySectionPayloadValidator,
  nutritionKnowledge: surveySectionPayloadValidator,
  notes: v.optional(v.string()),
  heiScore: v.optional(v.union(v.number(), v.null())),
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function readNumber(
  source: Record<string, unknown> | undefined,
  key: string,
) {
  const value = source?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function assertRequiredString(value: string, field: string) {
  if (!value.trim()) {
    throw new Error(`${field} is required.`);
  }
}

export function assertValidEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email is required.");
  }
}
