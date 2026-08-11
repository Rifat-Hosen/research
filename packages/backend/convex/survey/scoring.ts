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
    ["B1"],
    ["B2"],
    ["B3", "B4", "B5"],
    ["B6", "B7"],
    ["B8", "B9"],
    ["B10"],
    ["B11"],
    ["B12"],
    ["B13"],
    ["B14"],
    ["B15"],
    ["B16"],
  ];

  return groups.reduce(
    (score, group) =>
      score + (group.some((fieldId) => yes(dietaryDiversity[fieldId])) ? 1 : 0),
    0,
  );
}
