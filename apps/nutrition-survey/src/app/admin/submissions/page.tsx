import { redirect } from "next/navigation";
import { SubmissionsClient } from "@/components/admin/submissions-client";
import { isAdminLoggedIn } from "@/lib/admin-session";

export default async function AdminSubmissionsPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  return <SubmissionsClient />;
}
