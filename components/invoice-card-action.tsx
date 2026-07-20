"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DocumentCard, type DocumentData } from "@/components/document-card";
import { renderNodeToPngFile, shareOrDownloadFile } from "@/lib/document-export";

export function CopyLinkAction({ invoiceId }: { invoiceId: string }) {
  const [state, setState] = useState<"idle" | "copying" | "copied" | "error">(
    "idle"
  );

  async function handleClick() {
    if (state === "copying") return;
    setState("copying");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.link) throw new Error(data.error);
      await navigator.clipboard.writeText(data.link);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const label =
    state === "copying"
      ? "Copying…"
      : state === "copied"
        ? "Copied!"
        : state === "error"
          ? "Couldn't copy"
          : "Copy payment link";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-[12.5px] font-bold text-pending"
    >
      {label}
    </button>
  );
}

export function ViewReceiptAction({ invoiceId }: { invoiceId: string }) {
  return (
    <Link href={`/receipt/${invoiceId}`} className="text-[12.5px] font-bold text-paid">
      View receipt
    </Link>
  );
}

// Secondary action on every chat card, regardless of status: always
// downloads the neutral, unstamped invoice document (never the PAID
// stamp/Settled pill) — a seller may want to share a clean reference copy
// of what was ordered without disclosing to a third party that it was
// already paid for. The stamped document is only ever reachable via
// "View receipt" on Paid cards. Renders the exportable document off-screen
// so it never appears in the feed itself.
export function DownloadDocumentAction({ invoice }: { invoice: DocumentData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const invoiceCode = invoice.id.slice(-6).toUpperCase();
      const filename = `kobo-invoice-${invoiceCode}.png`;
      const file = await renderNodeToPngFile(cardRef.current, filename);
      await shareOrDownloadFile(file, { title: `Kobo invoice #${invoiceCode}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-muted transition-colors hover:border-muted/40 hover:bg-bg active:bg-line disabled:opacity-60"
      >
        <span className="block h-[11px] w-[10px] rounded-b-[3px] border-[1.5px] border-t-0 border-muted" />
        {busy ? "Preparing…" : "Invoice"}
      </button>
      <div className="pointer-events-none fixed left-[-9999px] top-0">
        <DocumentCard ref={cardRef} invoice={invoice} paid={false} />
      </div>
    </>
  );
}
