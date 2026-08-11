import { mutation } from "../_generated/server";
import {
  assertRequiredString,
  readNumber,
  submitSurveyArgsValidator,
} from "./validators";
import { calculateBmi, calculateHdds, getBmiClassCode } from "./scoring";

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

    const respondentId = args.respondentId.trim();

    const duplicate = await ctx.db
      .query("surveyResponses")
      .withIndex("by_respondentId", (q) => q.eq("respondentId", respondentId))
      .first();

    if (duplicate) {
      throw new Error("This respondent ID has already been submitted.");
    }

    const heightCm = readNumber(args.sociodemographic, "A15");
    const weightKg = readNumber(args.sociodemographic, "A16");
    const bmi = calculateBmi(heightCm, weightKg);
    const bmiClassCode = getBmiClassCode(bmi);
    const hddsScore = calculateHdds(args.dietaryDiversity);
    const now = Date.now();

    return await ctx.db.insert("surveyResponses", {
      respondentId,
      date: args.date.trim(),
      districtArea: args.districtArea.trim(),
      interviewerCode: args.interviewerCode.trim(),
      consentGiven: args.consentGiven,
      sociodemographic: args.sociodemographic,
      dietaryDiversity: args.dietaryDiversity,
      mealPatterns: args.mealPatterns,
      psychosocial: args.psychosocial,
      bmi,
      bmiClassCode,
      hddsScore,
      createdAt: now,
      updatedAt: now,
    });
  },
});
