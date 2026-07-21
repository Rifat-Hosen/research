import { surveySections } from "@workspace/backend/convex/survey/questionnaire";

export type SurveyValues = Record<string, string | string[]>;

const sectionKeyById: Record<string, string> = {
  sociodemographic: "sociodemographic",
  anthropometry: "anthropometry",
  heiFoodGroups: "heiFoodGroups",
  heiFatsSodiumSugars: "heiFatsSodiumSugars",
  dietaryDiversity: "dietaryDiversity",
  mealPatterns: "mealPatterns",
  doubleBurden: "doubleBurden",
  physicalActivity: "physicalActivity",
  enumeratorChecks: "enumeratorChecks",
  psychosocial: "psychosocial",
  nutritionKnowledge: "nutritionKnowledge",
};

function read(values: SurveyValues, key: string) {
  return values[key] ?? "";
}

function sectionValues(values: SurveyValues, sectionId: string) {
  const section = surveySections.find((item) => item.id === sectionId);
  if (!section) return {};

  return Object.fromEntries(
    section.fields.map((field) => [field.id, read(values, field.id)]),
  );
}

export function buildSurveyPayload(values: SurveyValues) {
  const payload: Record<string, unknown> = {
    respondentId: String(read(values, "respondentId")),
    email: String(read(values, "email")),
    date: String(read(values, "date")),
    districtArea: String(read(values, "districtArea")),
    interviewerCode: String(read(values, "interviewerCode")),
    consentGiven: read(values, "C0") === "1",
    notes: String(read(values, "notes")),
    heiScore:
      String(read(values, "heiScore")).trim() === ""
        ? null
        : Number(read(values, "heiScore")),
  };

  for (const [sectionId, key] of Object.entries(sectionKeyById)) {
    payload[key] = sectionValues(values, sectionId);
  }

  return payload;
}
