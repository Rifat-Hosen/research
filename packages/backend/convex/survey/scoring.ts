export type BmiClassCode = 0 | 1 | 2 | 3;

export function calculateBmi(heightCm?: number | null, weightKg?: number | null) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiClassCode(bmi?: number | null): BmiClassCode | null {
  if (bmi == null || !Number.isFinite(bmi)) return null;
  if (bmi < 18.5) return 0;
  if (bmi < 25) return 1;
  if (bmi < 30) return 2;
  return 3;
}

export function getBmiClassLabel(code?: BmiClassCode | null) {
  if (code === 0) return "Underweight";
  if (code === 1) return "Normal";
  if (code === 2) return "Overweight";
  if (code === 3) return "Obesity";
  return "";
}

function yes(value: unknown) {
  return value === "1" || value === 1 || value === true;
}

export function calculateHdds(dietaryDiversity: Record<string, unknown> = {}) {
  const groups = [
    ["E1"],
    ["E2"],
    ["E3", "E4", "E5"],
    ["E6", "E7"],
    ["E8", "E9"],
    ["E10"],
    ["E11"],
    ["E12"],
    ["E13"],
    ["E14"],
    ["E15"],
    ["E16"],
  ];

  return groups.reduce(
    (score, group) =>
      score + (group.some((fieldId) => yes(dietaryDiversity[fieldId])) ? 1 : 0),
    0,
  );
}

export function calculateDoubleBurdenFlag(args: {
  bmiClassCode?: BmiClassCode | null;
  doubleBurden?: Record<string, unknown>;
}) {
  const hasOvernutrition =
    args.bmiClassCode === 2 ||
    args.bmiClassCode === 3 ||
    args.doubleBurden?.G6 === "1" ||
    args.doubleBurden?.G7 === "1" ||
    args.doubleBurden?.G8 === "1";
  const hasUndernutrition =
    args.bmiClassCode === 0 ||
    args.doubleBurden?.G1 === "1" ||
    args.doubleBurden?.G2 === "1" ||
    args.doubleBurden?.G4 === "1" ||
    args.doubleBurden?.G5 === "0";

  return hasOvernutrition && hasUndernutrition;
}
