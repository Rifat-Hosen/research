import { redirect } from "next/navigation";
import { ReportClient } from "@/components/admin/report-client";
import { isAdminLoggedIn } from "@/lib/admin-session";

export default async function AdminReportPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  return <ReportClient />;
}
