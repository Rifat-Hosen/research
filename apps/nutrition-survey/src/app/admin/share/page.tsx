import { redirect } from "next/navigation";
import { ShareClient } from "@/components/admin/share-client";
import { isAdminLoggedIn } from "@/lib/admin-session";

export default async function AdminSharePage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  return <ShareClient />;
}
