"use client";

export function Select({
  value,
  onChange,
  children,
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className={`h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 ${className}`}
    >
      {children}
    </select>
  );
}

/** Option lists mirror the codes in the shared questionnaire definition. */
export const sexOptions = [
  { value: "0", label: "Male" },
  { value: "1", label: "Female" },
  { value: "2", label: "Other" },
];

export const ckdOptions = [
  { value: "1", label: "CKD patient" },
  { value: "0", label: "Not a CKD patient" },
  { value: "missing", label: "CKD not asked (older records)" },
];

export const residenceOptions = [
  { value: "0", label: "Rural" },
  { value: "1", label: "Urban" },
  { value: "2", label: "Semi-urban" },
  { value: "3", label: "Slum" },
];

export const ageBandOptions = [
  { value: "u20", label: "Under 20" },
  { value: "20_24", label: "20-24" },
  { value: "25_29", label: "25-29" },
  { value: "30_34", label: "30-34" },
  { value: "35p", label: "35 and over" },
];

export const hddsTierOptions = [
  { value: "low", label: "Low HDDS (0-3)" },
  { value: "medium", label: "Medium HDDS (4-5)" },
  { value: "high", label: "High HDDS (6+)" },
];

export const bmiClassOptions = [
  { value: "0", label: "Underweight (under 18.5)" },
  { value: "1", label: "Normal (18.5 - 22.9)" },
  { value: "2", label: "Overweight (23.0 - 27.4)" },
  { value: "3", label: "Obesity class I (27.5 - 32.4)" },
  { value: "4", label: "Obesity class II (32.5 - 37.4)" },
  { value: "5", label: "Obesity class III (37.5 and above)" },
];

export const qualityOptions = [
  { value: "flagged", label: "Has quality issues" },
  { value: "clear", label: "No quality issues" },
];

export function OptionList({
  placeholder,
  options,
}: {
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export function compactArgs(args: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(args).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  );
}

/** Filters shared by the dashboard and the report page. */
export type PopulationFilters = {
  sex: string;
  ckd: string;
  residence: string;
  ageBand: string;
  fromDate: string;
  toDate: string;
  interviewerCode: string;
  districtArea: string;
};

export const emptyPopulationFilters: PopulationFilters = {
  sex: "",
  ckd: "",
  residence: "",
  ageBand: "",
  fromDate: "",
  toDate: "",
  interviewerCode: "",
  districtArea: "",
};

export function describeFilters(filters: PopulationFilters) {
  const labelOf = (
    options: { value: string; label: string }[],
    value: string,
  ) => options.find((option) => option.value === value)?.label ?? value;
  const parts: string[] = [];
  if (filters.sex) parts.push(`Sex: ${labelOf(sexOptions, filters.sex)}`);
  if (filters.ckd) parts.push(`CKD: ${labelOf(ckdOptions, filters.ckd)}`);
  if (filters.residence) {
    parts.push(`Residence: ${labelOf(residenceOptions, filters.residence)}`);
  }
  if (filters.ageBand) {
    parts.push(`Age: ${labelOf(ageBandOptions, filters.ageBand)}`);
  }
  if (filters.fromDate) parts.push(`From ${filters.fromDate}`);
  if (filters.toDate) parts.push(`To ${filters.toDate}`);
  if (filters.interviewerCode) {
    parts.push(`Interviewer: ${filters.interviewerCode}`);
  }
  if (filters.districtArea) parts.push(`Area: ${filters.districtArea}`);
  return parts.length ? parts.join(" · ") : "All records";
}
