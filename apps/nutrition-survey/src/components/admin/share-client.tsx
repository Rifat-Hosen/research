"use client";

import { useEffect, useState } from "react";
import { Copy, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createQrImageUrl } from "@/lib/qr";

export function ShareClient() {
  const surveyUrl =
    process.env.NEXT_PUBLIC_SURVEY_FORM_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!surveyUrl) return;
    setQrImageUrl(createQrImageUrl(surveyUrl));
  }, [surveyUrl]);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Share Survey</h2>
        <p className="text-sm text-slate-600">
          Use this URL or QR code when inviting participants.
        </p>
      </div>
      <section className="grid gap-5 rounded-lg border bg-white p-5 lg:grid-cols-[1fr_380px]">
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="surveyUrl">
            Public survey link
          </label>
          <Input id="surveyUrl" readOnly value={surveyUrl} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(surveyUrl);
                setCopied(true);
              }}
            >
              <Copy />
              {copied ? "Copied" : "Copy link"}
            </Button>
            {qrImageUrl ? (
              <a
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                href={qrImageUrl}
                download="nutrition-survey-qr.png"
              >
                <Download />
                Download QR
              </a>
            ) : null}
          </div>
          {!process.env.NEXT_PUBLIC_SURVEY_FORM_URL ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              NEXT_PUBLIC_SURVEY_FORM_URL is not configured. The current origin
              is being used as a fallback.
            </p>
          ) : null}
        </div>
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border bg-slate-50 p-4">
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="Survey QR code"
              className="size-72 rounded-md bg-white p-3 shadow-sm"
            />
          ) : (
            <div className="text-center text-slate-500">
              <QrCode className="mx-auto size-10" />
              <p className="mt-2 text-sm">Generating QR code...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
