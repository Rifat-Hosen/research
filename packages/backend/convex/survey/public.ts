import { mutation } from "../_generated/server";
import {
  assertRequiredString,
  assertValidEmail,
  normalizeEmail,
  readNumber,
  submitSurveyArgsValidator,
} from "./validators";
import {
  calculateBmi,
  calculateDoubleBurdenFlag,
  calculateHdds,
  getBmiClassCode,
} from "./scoring";

export const submitSurvey = mutation({
  args: submitSurveyArgsValidator,
  handler: async (ctx, args) => {
    if (!args.consentGiven) {
      throw new Error("Consent is required before submitting the survey.");
    }

    assertRequiredString(args.respondentId, "Respondent ID");
    assertRequiredString(args.date, "Date");
    assertRequiredString(args.districtArea, "District / Area");
    assertRequiredString(args.interviewerCode, "Interviewer Code");

    const emailNormalized = normalizeEmail(args.email);
    assertValidEmail(emailNormalized);

    const duplicate = await ctx.db
      .query("surveyResponses")
      .withIndex("by_emailNormalized", (q) =>
        q.eq("emailNormalized", emailNormalized),
      )
      .first();

    if (duplicate) {
      throw new Error("This email has already submitted the survey.");
    }

    const heightCm = readNumber(args.anthropometry, "B1");
    const weightKg = readNumber(args.anthropometry, "B2");
    const bmi = calculateBmi(heightCm, weightKg);
    const bmiClassCode = getBmiClassCode(bmi);
    const hddsScore = calculateHdds(args.dietaryDiversity);
    const doubleBurdenFlag = calculateDoubleBurdenFlag({
      bmiClassCode,
      doubleBurden: args.doubleBurden,
    });
    const now = Date.now();

    return await ctx.db.insert("surveyResponses", {
      respondentId: args.respondentId.trim(),
      email: args.email.trim(),
      emailNormalized,
      name:
        typeof args.sociodemographic.A1 === "string"
          ? args.sociodemographic.A1.trim()
          : "",
      date: args.date.trim(),
      districtArea: args.districtArea.trim(),
      interviewerCode: args.interviewerCode.trim(),
      consentGiven: args.consentGiven,
      sociodemographic: args.sociodemographic,
      anthropometry: args.anthropometry,
      heiFoodGroups: args.heiFoodGroups,
      heiFatsSodiumSugars: args.heiFatsSodiumSugars,
      dietaryDiversity: args.dietaryDiversity,
      mealPatterns: args.mealPatterns,
      doubleBurden: args.doubleBurden,
      physicalActivity: args.physicalActivity,
      enumeratorChecks: args.enumeratorChecks,
      psychosocial: args.psychosocial,
      nutritionKnowledge: args.nutritionKnowledge,
      notes: args.notes ?? "",
      bmi,
      bmiClassCode,
      hddsScore,
      heiScore: args.heiScore ?? null,
      doubleBurdenFlag,
      createdAt: now,
      updatedAt: now,
    });
  },
});
