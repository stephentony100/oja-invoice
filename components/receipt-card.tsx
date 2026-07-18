"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  formatDateLong,
  formatTimeAmPm,
  isDeliveryItem,
  naira,
  toNaira,
} from "@/lib/invoice";

const SELLER_NAME = "Mama Nkechi Stores";

interface ReceiptLineItem {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface ReceiptData {
  id: string;
  total: number;
  createdAt: string;
  paidAt: string | null;
  lineItems: ReceiptLineItem[];
}

async function renderToPngFile(node: HTMLElement, filename: string): Promise<File> {
  const dataUrl = await toPng(node, { pixelRatio: 2 });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
}

export function ReceiptCard({ invoice }: { invoice: ReceiptData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  const invoiceCode = invoice.id.slice(-6).toUpperCase();
  const paidAt = invoice.paidAt ? new Date(invoice.paidAt) : new Date();
  const issuedAt = new Date(invoice.createdAt);
  const filename = `kobo-receipt-${invoiceCode}.png`;

  let subtotal = 0;
  let delivery = 0;
  let hasDelivery = false;
  for (const item of invoice.lineItems) {
    const lineTotal = toNaira(item.lineTotal ?? 0);
    if (isDeliveryItem(item.name)) {
      hasDelivery = true;
      delivery += lineTotal;
    } else {
      subtotal += lineTotal;
    }
  }

  async function handleDownload() {
    if (!cardRef.current || busy) return;
    setBusy("download");
    try {
      const file = await renderToPngFile(cardRef.current, filename);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    if (!cardRef.current || busy) return;
    setBusy("share");
    try {
      const file = await renderToPngFile(cardRef.current, filename);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Kobo receipt #${invoiceCode}`,
        });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Share was cancelled or unsupported — nothing to do.
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 px-4 py-8">
      <div
        ref={cardRef}
        id="kobo-receipt"
        className="overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_30px_70px_-34px_rgba(14,21,38,0.55)]"
      >
        <div className="flex items-center justify-between bg-ink px-6 py-[22px]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface font-display text-xl font-bold text-accent">
              k
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-xl font-bold tracking-[-0.01em] text-white">
                Kobo
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
                Receipt
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-white/60">#{invoiceCode}</span>
        </div>

        <div className="relative px-6 pb-2 pt-[22px]">
          <div className="absolute right-[18px] top-3.5 -rotate-[9deg] rounded-xl border-[3px] border-paid bg-paid/[0.06] px-3.5 py-[7px] pb-1.5 text-center">
            <div className="font-display text-2xl font-bold leading-none tracking-[0.14em] text-paid">
              PAID
            </div>
            <div className="mt-[3px] font-mono text-[8.5px] tracking-[0.12em] text-paid">
              {formatDateLong(paidAt).toUpperCase()} · {formatTimeAmPm(paidAt)}
            </div>
          </div>

          <div className="font-display text-[22px] font-bold tracking-[-0.01em] text-text">
            {SELLER_NAME}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted">
            Issued {formatDateLong(issuedAt)} · {formatTimeAmPm(issuedAt)}
          </div>

          <div className="my-[18px] mt-[18px] mb-1 h-px bg-line" />

          <div className="flex flex-col">
            {invoice.lineItems.map((item, i) => {
              const delivery = isDeliveryItem(item.name);
              const subline = delivery
                ? "Flat fee"
                : `${item.quantity} × ${item.unit ?? ""} @ ${naira(toNaira(item.unitPrice ?? 0))}`;
              return (
                <div
                  key={i}
                  className="flex items-start justify-between border-b border-line py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-text">
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted">{subline}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-text">
                    {naira(toNaira(item.lineTotal ?? 0))}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-[9px] py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted">Subtotal</span>
              <span className="font-mono text-[13px] text-text">{naira(subtotal)}</span>
            </div>
            {hasDelivery && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">Delivery</span>
                <span className="font-mono text-[13px] text-text">{naira(delivery)}</span>
              </div>
            )}
          </div>
          <div className="my-2 h-0.5 bg-ink" />
          <div className="flex items-end justify-between pb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Total paid
            </span>
            <span className="font-display text-[32px] font-bold tracking-[-0.02em] text-text">
              {naira(toNaira(invoice.total))}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line bg-bg px-6 py-3.5">
          <span className="font-mono text-[10.5px] tracking-[0.06em] text-muted">
            Sent via Kobo · kobo.ng
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paid-bg px-2.5 py-1 text-[11px] font-bold text-paid">
            <span className="h-1.5 w-1.5 rounded-full bg-paid" />
            Settled
          </span>
        </div>
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-[15px] text-[15px] font-bold text-accent-ink shadow-[0_12px_24px_-10px_var(--accent)] disabled:opacity-70"
        >
          {busy === "download" ? "Preparing…" : "Download receipt"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy !== null}
          className="flex items-center justify-center rounded-xl border-[1.5px] border-ink px-[18px] py-3.5 text-[15px] font-bold text-ink disabled:opacity-70"
        >
          {busy === "share" ? "Preparing…" : "Share"}
        </button>
      </div>
      <span className="text-center text-xs text-muted">
        Exports the card above as a PNG, ready to forward in any chat.
      </span>
    </div>
  );
}
