"use client";

import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DocumentCard, type DocumentData } from "@/components/document-card";
import { renderAndDownload, renderAndShare } from "@/lib/document-export";

export function ReceiptScreen({
  invoice,
  sellerName,
}: {
  invoice: DocumentData;
  sellerName: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  const invoiceCode = invoice.id.slice(-6).toUpperCase();
  const filename = `nado-receipt-${invoiceCode}.png`;

  async function handleDownload() {
    if (!cardRef.current || busy) return;
    setBusy("download");
    try {
      await renderAndDownload(cardRef.current, filename);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    if (!cardRef.current || busy) return;
    setBusy("share");
    try {
      await renderAndShare(cardRef.current, filename, `Nado receipt #${invoiceCode}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell sidebar>
      <div className="mx-auto flex h-full w-full max-w-[420px] flex-col gap-4 overflow-y-auto px-4 py-8">
        <DocumentCard ref={cardRef} invoice={invoice} paid sellerName={sellerName} />

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
    </AppShell>
  );
}
