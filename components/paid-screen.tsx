"use client";

import { useEffect, useRef, useState } from "react";
import { DocumentCard, type DocumentData } from "@/components/document-card";
import { renderNodeToPngFile, triggerDownload } from "@/lib/document-export";

const SELLER_NAME = "Mama Nkechi Stores";

// The webhook can take a moment to land after the buyer is redirected back
// here, so poll quickly at first (covers the common case where it already
// landed) then fall back to a slower background poll rather than leaving
// the buyer stuck on a "waiting" screen forever without a manual refresh.
const FAST_POLL_MS = 1500;
const FAST_POLL_ATTEMPTS = 5;
const SLOW_POLL_MS = 5000;

export function PaidScreen({ invoice: initialInvoice }: { invoice: DocumentData & { status: string } }) {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [waiting, setWaiting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (invoice.status === "PAID") return;

    let cancelled = false;
    let attempt = 0;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/invoices/${initialInvoice.id}`);
        const data = await res.json();
        if (!cancelled && data.invoice) {
          setInvoice(data.invoice);
          if (data.invoice.status === "PAID") return;
        }
      } catch {
        // Ignore transient fetch errors — just keep polling.
      }

      attempt += 1;
      if (cancelled) return;
      if (attempt === FAST_POLL_ATTEMPTS) setWaiting(true);
      const delay = attempt < FAST_POLL_ATTEMPTS ? FAST_POLL_MS : SLOW_POLL_MS;
      setTimeout(poll, delay);
    }

    const timer = setTimeout(poll, FAST_POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInvoice.id]);

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const invoiceCode = invoice.id.slice(-6).toUpperCase();
      const file = await renderNodeToPngFile(
        cardRef.current,
        `kobo-receipt-${invoiceCode}.png`
      );
      triggerDownload(file);
    } finally {
      setDownloading(false);
    }
  }

  if (invoice.status !== "PAID") {
    return (
      <div className="mx-auto flex h-dvh w-full max-w-[420px] flex-col items-center justify-center gap-3 bg-ink px-6 text-center">
        <span className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/20 border-t-accent" />
        <div className="font-display text-lg font-bold text-white">
          {waiting ? "Still confirming your payment…" : "Confirming your payment…"}
        </div>
        <p className="max-w-[280px] text-[13px] text-white/60">
          {waiting
            ? "This can take a little longer than usual — this page will update as soon as it lands."
            : "Just a moment while we hear back from your bank."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center gap-[18px] bg-ink px-5 py-7">
      <div className="flex flex-col items-center gap-3 pt-1.5">
        <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-paid shadow-[0_14px_30px_-10px_var(--paid)]">
          <span className="mt-[-5px] block h-3 w-[22px] -rotate-45 border-b-[3.5px] border-l-[3.5px] border-white" />
        </span>
        <div className="text-center">
          <div className="font-display text-[23px] font-bold tracking-[-0.01em] text-white">
            Payment successful
          </div>
          <div className="mt-[3px] text-[13.5px] text-white/60">
            You paid {SELLER_NAME}
          </div>
        </div>
      </div>

      <div className="w-full flex-shrink-0">
        <DocumentCard ref={cardRef} invoice={invoice} paid />
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-[15px] text-[15px] font-bold text-accent-ink shadow-[0_12px_24px_-10px_var(--accent)] disabled:opacity-70"
      >
        {downloading ? "Preparing…" : "Download receipt"}
      </button>
      <span className="max-w-[30ch] text-center text-[11.5px] text-white/50">
        Your copy — save it even without a Kobo account.
      </span>
    </div>
  );
}
