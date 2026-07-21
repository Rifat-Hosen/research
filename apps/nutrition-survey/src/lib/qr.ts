"use client";

export function createQrImageUrl(value: string) {
  const encoded = encodeURIComponent(value);
  return `https://quickchart.io/qr?text=${encoded}&size=360&margin=2`;
}
