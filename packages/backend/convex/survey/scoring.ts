export type BmiClassCode = 0 | 1 | 2 | 3 | 4 | 5;

export function calculateBmi(heightCm?: number | null, weightKg?: number | null) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Asian (WHO Asia-Pacific) BMI cut-offs in kg/m2:
 * <18.5 underweight, 18.5-22.9 normal, 23.0-27.4 overweight,
 * 27.5-32.4 obesity class I, 32.5-37.4 obesity class II, >=37.5 obesity class III.
 */
export function getBmiClassCode(bmi?: number | null): BmiClassCode | null {
  if (bmi == null || !Number.isFinite(bmi)) return null;
  if (bmi < 18.5) return 0;
  if (bmi < 23) return 1;
  if (bmi < 27.5) return 2;
  if (bmi < 32.5) return 3;
  if (bmi < 37.5) return 4;
  return 5;
}

export const BMI_CLASS_CODES: BmiClassCode[] = [0, 1, 2, 3, 4, 5];

export function getBmiClassLabel(code?: BmiClassCode | null) {
  if (code === 0) return "Underweight";
  if (code === 1) return "Normal";
  if (code === 2) return "Overweight";
  if (code === 3) return "Obesity class I";
  if (code === 4) return "Obesity class II";
  if (code === 5) return "Obesity class III";
  return "";
}

/** Overweight plus every obesity class (BMI 23.0 and above on Asian cut-offs). */
export function isOverweightOrObese(code?: number | null) {
  return code != null && code >= 2;
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
