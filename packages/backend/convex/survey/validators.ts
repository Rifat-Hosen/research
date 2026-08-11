import { v } from "convex/values";

export const surveySectionPayloadValidator = v.record(v.string(), v.any());

export const submitSurveyArgsValidator = {
  respondentId: v.string(),
  date: v.string(),
  districtArea: v.string(),
  interviewerCode: v.string(),
  consentGiven: v.boolean(),
  sociodemographic: surveySectionPayloadValidator,
  dietaryDiversity: surveySectionPayloadValidator,
  mealPatterns: surveySectionPayloadValidator,
  psychosocial: surveySectionPayloadValidator,
};

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
