"use client";

export function display(value: unknown) {
  return value == null || value === "" ? "-" : String(value);
}

export function percent(value: number) {
  return `${Math.max(0, Math.min(100, value))}%`;
}

export type Share = { count: number; base: number; percent: number };
export type DistributionItem = {
  code: string | number;
  label: string;
  count: number;
  percent: number;
};
export type GroupProfile = {
  label: string;
  count: number;
  averageBmi: number | null;
  averageHdds: number | null;
  bmiClasses: DistributionItem[];
  overweightObesePercent: number;
  underweightPercent: number;
  foodInsecurePercent: number;
  highStressPercent: number;
};
export type Breakdown = {
  label: string;
  count: number;
  reviewed: number;
  excluded: number;
  flagged: number;
  last7Days: number;
  lastSubmissionAt: number;
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{helper}</p>
    </section>
  );
}

export type Tone = "emerald" | "amber" | "rose" | "sky" | "slate";

export function DistributionBar({
  label,
  count,
  percentValue,
  tone = "emerald",
}: {
  label: string;
  count: number;
  percentValue: number;
  tone?: Tone;
}) {
  const colors: Record<Tone, string> = {
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    slate: "bg-slate-500",
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {count} · {percentValue}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors[tone]}`}
          style={{ width: percent(percentValue) }}
        />
      </div>
    </div>
  );
}

export function DistributionList({
  title,
  items,
  tone = "emerald",
  tones,
}: {
  title?: string;
  items: DistributionItem[];
  tone?: Tone;
  tones?: readonly Tone[];
}) {
  return (
    <div className="grid gap-3">
      {title ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
      ) : null}
      {items.map((item, index) => (
        <DistributionBar
          key={String(item.code)}
          label={item.label}
          count={item.count}
          percentValue={item.percent}
          tone={tones?.[index] ?? tone}
        />
      ))}
    </div>
  );
}

/** Compact tile for a single indicator, with an optional denominator note. */
export function MetricTile({
  label,
  value,
  note,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  note?: string;
  tone?: "slate" | "amber" | "rose" | "emerald" | "sky";
}) {
  const tones = {
    slate: "bg-slate-50 text-slate-950",
    amber: "bg-amber-50 text-amber-900",
    rose: "bg-rose-50 text-rose-900",
    emerald: "bg-emerald-50 text-emerald-900",
    sky: "bg-sky-50 text-sky-900",
  };

  return (
    <div className={`rounded-xl p-3 ${tones[tone]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {note ? <p className="mt-0.5 text-[11px] opacity-60">{note}</p> : null}
    </div>
  );
}

/** Share indicators render as "42%" with the raw counts underneath. */
export function shareTile(
  label: string,
  share: Share | undefined,
  tone: "slate" | "amber" | "rose" | "emerald" | "sky" = "slate",
) {
  return (
    <MetricTile
      key={label}
      label={label}
      value={share?.base ? `${share.percent}%` : "-"}
      note={share?.base ? `${share.count} of ${share.base} answered` : "No data"}
      tone={tone}
    />
  );
}

export function Panel({
  title,
  description,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <Icon className="size-5 text-emerald-700" />
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function MiniTrend({
  days,
  tone = "bg-emerald-600",
}: {
  days: Array<{ label: string; count: number }>;
  tone?: string;
}) {
  const max = Math.max(...days.map((day) => day.count), 1);

  return (
    <div className="flex h-40 items-end gap-2">
      {days.map((day) => (
        <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end rounded-t bg-slate-50">
            <div
              className={`w-full rounded-t ${tone}`}
              style={{ height: `${Math.max(8, (day.count / max) * 100)}%` }}
              title={`${day.label}: ${day.count}`}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-slate-700">{day.count}</p>
            <p className="text-[10px] text-slate-400">{day.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Side-by-side subgroup comparison (for example male vs female, CKD vs non-CKD). */
export function GroupComparisonTable({ groups }: { groups: GroupProfile[] }) {
  const classes = groups[0]?.bmiClasses ?? [];
  const cell = "px-3 py-2";

  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className={cell}>Indicator</th>
            {groups.map((group) => (
              <th key={group.label} className={`${cell} text-right`}>
                {group.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-700">
          <tr className="border-t">
            <td className={cell}>Records included</td>
            {groups.map((group) => (
              <td key={group.label} className={`${cell} text-right font-medium`}>
                {group.count}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className={cell}>Average BMI</td>
            {groups.map((group) => (
              <td key={group.label} className={`${cell} text-right`}>
                {display(group.averageBmi)}
              </td>
            ))}
          </tr>
          {classes.map((item, index) => (
            <tr key={String(item.code)} className="border-t">
              <td className={`${cell} pl-6 text-slate-500`}>{item.label}</td>
              {groups.map((group) => {
                const value = group.bmiClasses[index];
                return (
                  <td key={group.label} className={`${cell} text-right`}>
                    {value ? `${value.percent}% (${value.count})` : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t">
            <td className={cell}>Overweight or obese</td>
            {groups.map((group) => (
              <td key={group.label} className={`${cell} text-right`}>
                {group.count ? `${group.overweightObesePercent}%` : "-"}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className={cell}>Average HDDS</td>
            {groups.map((group) => (
              <td key={group.label} className={`${cell} text-right`}>
                {display(group.averageHdds)}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className={cell}>Food insecure (last 4 weeks)</td>
            {groups.map((group) => (
              <td key={group.label} className={`${cell} text-right`}>
                {group.count ? `${group.foodInsecurePercent}%` : "-"}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className={cell}>High or very high stress</td>
            {groups.map((group) => (
              <td key={group.label} className={`${cell} text-right`}>
                {group.count ? `${group.highStressPercent}%` : "-"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Per-interviewer or per-area collection summary. */
export function BreakdownTable({
  rows,
  firstColumn,
  emptyText,
}: {
  rows: Breakdown[];
  firstColumn: string;
  emptyText: string;
}) {
  const cell = "px-3 py-2";
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className={cell}>{firstColumn}</th>
            <th className={`${cell} text-right`}>Forms</th>
            <th className={`${cell} text-right`}>Last 7 days</th>
            <th className={`${cell} text-right`}>Reviewed</th>
            <th className={`${cell} text-right`}>Flagged</th>
            <th className={`${cell} text-right`}>Excluded</th>
            <th className={cell}>Last submission</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {rows.map((row) => (
            <tr key={row.label} className="border-t">
              <td className={`${cell} font-medium`}>{row.label}</td>
              <td className={`${cell} text-right`}>{row.count}</td>
              <td className={`${cell} text-right`}>{row.last7Days}</td>
              <td className={`${cell} text-right`}>{row.reviewed}</td>
              <td
                className={`${cell} text-right ${row.flagged ? "text-amber-700" : ""}`}
              >
                {row.flagged}
              </td>
              <td
                className={`${cell} text-right ${row.excluded ? "text-rose-700" : ""}`}
              >
                {row.excluded}
              </td>
              <td className={`${cell} text-slate-500`}>
                {new Date(row.lastSubmissionAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className={`${cell} text-center text-slate-500`} colSpan={7}>
                {emptyText}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
