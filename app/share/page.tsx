"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearShareInvoice,
  loadShareInvoice,
  saveShareInvoice,
  type ShareInvoice,
} from "@/lib/share-storage";
import { isDeliveryItem, naira, toNaira } from "@/lib/invoice";

const SELLER_NAME = "Mama Nkechi Stores";

function buildWhatsAppMessage(total: number, link: string): string {
  return `Hi! Here's your invoice from ${SELLER_NAME} — ${naira(total)}. Pay here: ${link}`;
}

export default function SharePage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<ShareInvoice | null>(null);
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(false);

  useEffect(() => {
    const inv = loadShareInvoice();
    if (!inv) {
      router.replace("/");
      return;
    }
    setInvoice(inv);
  }, [router]);

  if (!invoice) return null;

  const totalNaira = toNaira(invoice.total);
  const invoiceCode = invoice.id.slice(-6).toUpperCase();
  const linkReady = invoice.monnifyPaymentLink != null;

  async function handleCopyLink() {
    if (!invoice?.monnifyPaymentLink) return;
    await navigator.clipboard.writeText(invoice.monnifyPaymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsAppShare() {
    if (!invoice?.monnifyPaymentLink) return;
    const message = buildWhatsAppMessage(totalNaira, invoice.monnifyPaymentLink);
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  async function handleRetryLink() {
    if (!invoice || retrying) return;
    setRetrying(true);
    setRetryError(false);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.link) throw new Error(data.error);
      const updated = { ...invoice, monnifyPaymentLink: data.link as string };
      setInvoice(updated);
      saveShareInvoice(updated);
    } catch {
      setRetryError(true);
    } finally {
      setRetrying(false);
    }
  }

  function handleBackToKobo() {
    clearShareInvoice();
    router.push("/");
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-bg">
      <header className="flex items-center gap-3.5 border-b border-line px-4 py-2.5">
        <Link
          href="/"
          aria-label="Back to Kobo"
          onClick={() => clearShareInvoice()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface"
        >
          <span className="ml-[3px] block h-[9px] w-[9px] rotate-45 border-b-2 border-l-2 border-accent" />
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[17px] font-bold tracking-[-0.01em] text-text">
            Invoice saved
          </span>
          <span className="font-mono text-[11px] text-muted">
            #{invoiceCode} · ready to share
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] pb-1.5 pt-5">
        <div className="flex flex-col items-center gap-2.5 pt-1.5 text-center">
          <span
            className={`flex h-[60px] w-[60px] items-center justify-center rounded-full ${
              linkReady ? "bg-paid-bg" : "bg-pending-bg"
            }`}
          >
            {linkReady ? (
              <span className="mt-[-4px] block h-[11px] w-5 -rotate-45 border-b-[3px] border-l-[3px] border-paid" />
            ) : (
              <span className="block h-5 w-5 rounded-full border-[3px] border-pending border-t-transparent" />
            )}
          </span>
          <div>
            <div className="font-display text-[20px] font-bold tracking-[-0.01em] text-text">
              {linkReady ? "Payment link ready" : "Invoice saved"}
            </div>
            <div className="mt-0.5 text-[13px] text-muted">
              {linkReady
                ? "Send it to your buyer to get paid"
                : "Setting up the payment link — this won't take long"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[11px] rounded-[18px] border border-line bg-white p-[15px] shadow-[0_14px_30px_-20px_rgba(14,21,38,0.4)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.06em] text-muted">
              #{invoiceCode}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pending-bg px-2.5 py-1 text-[11.5px] font-bold text-pending">
              <span className="h-1.5 w-1.5 rounded-full bg-pending" />
              Pending
            </span>
          </div>
          <div className="flex flex-col">
            {invoice.lineItems.map((item, i) => {
              const delivery = isDeliveryItem(item.name);
              const quantityLabel = item.unit
                ? `${item.quantity} × ${item.unit}`
                : `${item.quantity}`;
              return (
                <div
                  key={i}
                  className="flex items-start justify-between border-b border-line py-[9px]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] font-semibold text-text">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10.5px] text-muted">
                      {delivery ? "Flat fee" : quantityLabel}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-[13px] font-bold text-text">
                      {naira(toNaira(item.lineTotal ?? 0))}
                    </span>
                    {!delivery && (
                      <span className="font-mono text-[10.5px] text-muted">
                        @ {naira(toNaira(item.unitPrice ?? 0))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                Total
              </span>
              <span className="font-display text-[22px] font-bold tracking-[-0.01em] text-text">
                {naira(totalNaira)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Payment link
          </span>
          {linkReady ? (
            <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-line bg-white px-[15px] py-3.5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-surface font-display text-sm font-bold text-accent">
                k
              </span>
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[13.5px] text-text">
                {invoice.monnifyPaymentLink}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 rounded-xl border-[1.5px] border-dashed border-line bg-white px-[15px] py-3.5">
              <span className="text-[13px] text-muted">
                {retryError
                  ? "Still couldn't reach Monnify. You can try again."
                  : "The payment link couldn't be generated yet — no problem, your invoice is saved."}
              </span>
              <button
                type="button"
                onClick={handleRetryLink}
                disabled={retrying}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-muted transition-colors hover:border-muted/40 hover:bg-bg active:bg-line disabled:opacity-60"
              >
                {retrying ? "Trying…" : "Try again"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-line bg-bg px-4 pb-[22px] pt-3.5">
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={!linkReady}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-[15px] text-[15px] font-bold text-accent-ink shadow-[0_12px_24px_-10px_var(--accent)] disabled:opacity-50"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={handleWhatsAppShare}
          disabled={!linkReady}
          className="flex items-center justify-center rounded-xl border-[1.5px] border-ink px-4 py-3.5 text-[15px] font-bold text-ink disabled:opacity-50"
        >
          Copy &amp; share via WhatsApp
        </button>
        <button
          type="button"
          onClick={handleBackToKobo}
          className="flex items-center justify-center py-1.5 text-[14px] font-bold text-muted"
        >
          Back to Kobo
        </button>
      </div>
    </div>
  );
}
