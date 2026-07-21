import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isAdminLoggedIn,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-session";

async function login(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (await verifyAdminCredentials(username, password)) {
    await setAdminSession();
    redirect("/admin/dashboard");
  }

  redirect("/admin/login?error=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminLoggedIn()) redirect("/admin/dashboard");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the survey admin credentials.
        </p>
        <form action={login} className="mt-5 grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="username">
              Username
            </label>
            <Input id="username" name="username" autoComplete="username" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </div>
          {params.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              Invalid username or password.
            </p>
          ) : null}
          <Button type="submit">Login</Button>
        </form>
      </section>
    </main>
  );
}
