import { surveySections } from "@workspace/backend/convex/survey/questionnaire";

export type SurveyValues = Record<string, string | string[]>;

const sectionKeyById: Record<string, string> = {
  sociodemographic: "sociodemographic",
  dietaryDiversity: "dietaryDiversity",
  mealPatterns: "mealPatterns",
  psychosocial: "psychosocial",
};

function read(values: SurveyValues, key: string) {
  return values[key] ?? "";
}

function currentDateDdMmYy() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
}

function fallbackRespondentId() {
  return `RS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function sectionValues(values: SurveyValues, sectionId: string) {
  const section = surveySections.find((item) => item.id === sectionId);
  if (!section) return {};

  return Object.fromEntries(
    section.fields.map((field) => [field.id, read(values, field.id)]),
  );
}

export function buildSurveyPayload(values: SurveyValues) {
  const date = String(read(values, "date") || currentDateDdMmYy());

  const payload: Record<string, unknown> = {
    respondentId: String(read(values, "respondentId") || fallbackRespondentId()),
    date,
    districtArea: String(read(values, "districtArea") || "Not collected"),
    interviewerCode: String(read(values, "interviewerCode") || "WEB"),
    consentGiven: read(values, "C0") === "1",
  };

  for (const [sectionId, key] of Object.entries(sectionKeyById)) {
    payload[key] = sectionValues(values, sectionId);
  }

  return payload;
}
