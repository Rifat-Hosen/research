import { redirect } from "next/navigation";
import { SubmissionDetailClient } from "@/components/admin/submission-detail-client";
import { isAdminLoggedIn } from "@/lib/admin-session";

export default async function AdminSubmissionDetailPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  return <SubmissionDetailClient />;
}
