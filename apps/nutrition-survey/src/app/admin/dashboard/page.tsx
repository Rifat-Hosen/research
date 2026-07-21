import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/admin/dashboard-client";
import { isAdminLoggedIn } from "@/lib/admin-session";

export default async function AdminDashboardPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  return <DashboardClient />;
}
