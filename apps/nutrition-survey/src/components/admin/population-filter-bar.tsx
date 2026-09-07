"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  OptionList,
  Select,
  ageBandOptions,
  ckdOptions,
  describeFilters,
  emptyPopulationFilters,
  residenceOptions,
  sexOptions,
  type PopulationFilters,
} from "./filter-controls";

/** Sub-population selector shared by the dashboard and the report page. */
export function PopulationFilterBar({
  filters,
  onChange,
  matching,
  totalUnfiltered,
}: {
  filters: PopulationFilters;
  onChange: (filters: PopulationFilters) => void;
  matching?: number;
  totalUnfiltered?: number;
}) {
  const set = (key: keyof PopulationFilters) => (value: string) =>
    onChange({ ...filters, [key]: value });
  const active = describeFilters(filters) !== "All records";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-emerald-700" />
          <p className="text-sm font-semibold text-slate-900">
            Filter population
          </p>
          <p className="text-xs text-slate-500">{describeFilters(filters)}</p>
        </div>
        <div className="flex items-center gap-3">
          {matching != null && totalUnfiltered != null ? (
            <p className="text-xs text-slate-500">
              {matching} of {totalUnfiltered} records match
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!active}
            onClick={() => onChange(emptyPopulationFilters)}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={filters.sex} onChange={set("sex")} ariaLabel="Sex">
          <OptionList placeholder="All sex" options={sexOptions} />
        </Select>
        <Select value={filters.ckd} onChange={set("ckd")} ariaLabel="CKD status">
          <OptionList placeholder="All CKD status" options={ckdOptions} />
        </Select>
        <Select
          value={filters.residence}
          onChange={set("residence")}
          ariaLabel="Residence"
        >
          <OptionList placeholder="All residence" options={residenceOptions} />
        </Select>
        <Select
          value={filters.ageBand}
          onChange={set("ageBand")}
          ariaLabel="Age group"
        >
          <OptionList placeholder="All age groups" options={ageBandOptions} />
        </Select>
        <Input
          type="date"
          value={filters.fromDate}
          onChange={(event) => set("fromDate")(event.target.value)}
          aria-label="From date"
        />
        <Input
          type="date"
          value={filters.toDate}
          onChange={(event) => set("toDate")(event.target.value)}
          aria-label="To date"
        />
        <Input
          value={filters.interviewerCode}
          onChange={(event) => set("interviewerCode")(event.target.value)}
          placeholder="Interviewer code"
          aria-label="Interviewer code"
        />
        <Input
          value={filters.districtArea}
          onChange={(event) => set("districtArea")(event.target.value)}
          placeholder="District / area contains"
          aria-label="District or area"
        />
      </div>
    </section>
  );
}
