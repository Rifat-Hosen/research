import { redirect } from "next/navigation";
import { clearAdminSession, isAdminLoggedIn } from "@/lib/admin-session";
import { Button } from "@/components/ui/button";

async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = await isAdminLoggedIn();

  if (!loggedIn) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Nutrition Survey Admin
            </p>
            <h1 className="text-xl font-semibold">Research Data Panel</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Button asChild href="/admin/dashboard" variant="ghost">
              Dashboard
            </Button>
            <Button asChild href="/admin/submissions" variant="ghost">
              Submissions
            </Button>
            <Button asChild href="/admin/share" variant="ghost">
              Share
            </Button>
            <form action={logout}>
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </main>
  );
}
