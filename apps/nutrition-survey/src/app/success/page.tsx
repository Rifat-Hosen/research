import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-semibold">Survey submitted</h1>
        <p className="mt-2 text-sm text-slate-600">
          Thank you. The response has been saved for research data entry and
          review.
        </p>
      </section>
    </main>
  );
}
