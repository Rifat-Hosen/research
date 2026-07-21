"use client";

import { useQuery } from "convex/react";
import { Activity, ClipboardList, Scale, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { surveyApi } from "@/lib/convex-api";

export function DashboardClient() {
  const stats = useQuery(surveyApi.admin.getDashboardStats);

  if (stats === undefined) {
    return <div className="rounded-lg border bg-white p-5">Loading...</div>;
  }

  const cards = [
    { label: "Total forms", value: stats.total, icon: ClipboardList },
    { label: "Today", value: stats.today, icon: Activity },
    { label: "Average BMI", value: stats.averageBmi ?? "-", icon: Scale },
    { label: "Recent records", value: stats.latest.length, icon: Users },
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-slate-600">
            Live summary of submitted nutrition assessment forms.
          </p>
        </div>
        <Button asChild href="/admin/submissions">
          View all submissions
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{card.label}</p>
                <Icon className="size-4 text-emerald-700" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{card.value}</p>
            </section>
          );
        })}
      </div>
      <section className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h3 className="font-semibold">Latest submissions</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Respondent</th>
                <th className="p-3">Email</th>
                <th className="p-3">Area</th>
                <th className="p-3">BMI</th>
                <th className="p-3">HDDS</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest.map((response: any) => (
                <tr key={response._id} className="border-t">
                  <td className="p-3">{response.respondentId}</td>
                  <td className="p-3">{response.email}</td>
                  <td className="p-3">{response.districtArea}</td>
                  <td className="p-3">{response.bmi ?? "-"}</td>
                  <td className="p-3">{response.hddsScore ?? "-"}</td>
                </tr>
              ))}
              {stats.latest.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={5}>
                    No submissions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
