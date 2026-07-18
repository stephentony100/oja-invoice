"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearDraft, loadDraft, type DraftInvoice } from "@/lib/draft-storage";
import { isDeliveryItem, naira } from "@/lib/invoice";
import { saveShareInvoice } from "@/lib/share-storage";

interface ReviewItem {
  id: string;
  name: string;
  qty: number;
  unit: string | null;
  price: number | null;
}

function toReviewItems(draft: DraftInvoice): ReviewItem[] {
  return draft.items.map((it, i) => ({
    id: `it${i}`,
    name: it.name,
    qty: it.quantity,
    unit: it.unit,
    price: it.unitPrice,
  }));
}

function buildParseSummaryMessage(itemCount: number, missingCount: number): string {
  const itemWord = itemCount === 1 ? "item" : "items";
  if (missingCount === 0) {
    return `I parsed your order into ${itemCount} ${itemWord}. All prices are set — ready to save.`;
  }
  const priceWord = missingCount === 1 ? "price" : "prices";
  const pronoun = missingCount === 1 ? "it" : "them";
  return `I parsed your order into ${itemCount} ${itemWord}. ${missingCount} ${priceWord} wasn’t in your list — add ${pronoun} to finish.`;
}

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftInvoice | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDraft();
    if (!d || d.items.length === 0) {
      router.replace("/");
      return;
    }
    setDraft(d);
    setItems(toReviewItems(d));
  }, [router]);

  function setPrice(id: string, raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, price: digits === "" ? null : parseInt(digits, 10) } : it
      )
    );
  }

  const { subtotal, delivery, hasDelivery, missingCount } = useMemo(() => {
    let subtotal = 0;
    let delivery = 0;
    let hasDelivery = false;
    let missingCount = 0;

    for (const it of items) {
      if (isDeliveryItem(it.name)) hasDelivery = true;
      if (it.price == null) {
        missingCount += 1;
        continue;
      }
      const lineTotal = it.qty * it.price;
      if (isDeliveryItem(it.name)) {
        delivery += lineTotal;
      } else {
        subtotal += lineTotal;
      }
    }

    return { subtotal, delivery, hasDelivery, missingCount };
  }, [items]);

  const total = subtotal + delivery;
  const hasMissing = missingCount > 0;
  const missingNote =
    missingCount === 1
      ? "1 item needs a price before you can save"
      : `${missingCount} items need a price before you can save`;

  async function handleSave() {
    if (hasMissing || !draft || saving) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInputText: draft.rawInputText,
          items: items.map((it) => ({
            name: it.name,
            quantity: it.qty,
            unit: it.unit,
            unitPrice: it.price,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Couldn't save invoice.");
      }
      clearDraft();
      saveShareInvoice({
        id: data.invoice.id,
        total: data.invoice.total,
        monnifyPaymentLink: data.invoice.monnifyPaymentLink,
        lineItems: data.invoice.lineItems,
      });
      router.push("/share");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save invoice.");
      setSaving(false);
    }
  }

  if (!draft) return null;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-bg">
      <header className="flex items-center gap-3.5 border-b border-line px-4 py-2.5">
        <Link
          href="/"
          aria-label="Back"
          onClick={() => clearDraft()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface"
        >
          <span className="ml-[3px] block h-[9px] w-[9px] rotate-45 border-b-2 border-l-2 border-accent" />
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[17px] font-bold tracking-[-0.01em] text-text">
            Review invoice
          </span>
          <span className="font-mono text-[11px] text-muted">New invoice · draft</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-1.5 pt-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-accent/[0.14] px-3.5 py-2.5">
          <span className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent font-display text-[11px] font-bold text-accent-ink">
            k
          </span>
          <span className="text-[12.5px] leading-[1.45] text-text">
            {buildParseSummaryMessage(items.length, missingCount)}
          </span>
        </div>

        {items.map((it) => {
          const missing = it.price == null;
          const lineTotal = it.price != null ? naira(it.qty * it.price) : "—";
          return (
            <div
              key={it.id}
              className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-3.5 shadow-[0_12px_26px_-20px_rgba(14,21,38,0.35)]"
            >
              <div className="flex items-center gap-2.5">
                <input
                  readOnly
                  value={it.name}
                  className="min-w-0 flex-1 rounded-xl border-[1.5px] border-line bg-bg px-3 py-2.5 text-[14px] font-semibold text-text outline-none"
                />
                <span className="whitespace-nowrap font-display text-[15px] font-bold text-text">
                  {lineTotal}
                </span>
              </div>
              <div className="grid grid-cols-[0.8fr_1fr_1.3fr] gap-2">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">
                    Qty
                  </span>
                  <input
                    readOnly
                    value={it.qty}
                    className="w-full rounded-xl border-[1.5px] border-line bg-bg px-2.5 py-2 text-[14px] font-semibold text-text outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted">
                    Unit
                  </span>
                  <input
                    readOnly
                    value={it.unit ?? ""}
                    className="w-full rounded-xl border-[1.5px] border-line bg-bg px-2.5 py-2 text-[14px] font-semibold text-text outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`font-mono text-[9.5px] uppercase tracking-[0.08em] ${
                      missing ? "text-pending" : "text-muted"
                    }`}
                  >
                    {missing ? "Add price" : "Unit price"}
                  </span>
                  <div
                    className={`flex items-center gap-1 rounded-xl border-[1.5px] px-2.5 py-2 ${
                      missing
                        ? "border-pending bg-pending-bg shadow-[0_0_0_3px_rgba(169,114,14,0.14)]"
                        : "border-line bg-white"
                    }`}
                  >
                    <span
                      className={`text-[14px] font-semibold ${
                        missing ? "text-pending" : "text-muted"
                      }`}
                    >
                      ₦
                    </span>
                    <input
                      value={it.price ?? ""}
                      onChange={(e) => setPrice(it.id, e.target.value)}
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full min-w-0 border-none bg-transparent text-[14px] font-semibold text-text outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-2.5 rounded-[18px] bg-ink p-[18px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-white/60">Subtotal</span>
            <span className="font-mono text-[13px] text-white">{naira(subtotal)}</span>
          </div>
          {hasDelivery && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white/60">Delivery</span>
              <span className="font-mono text-[13px] text-white">{naira(delivery)}</span>
            </div>
          )}
          <div className="my-0.5 h-px bg-white/10" />
          <div className="flex items-end justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/55">
              Total due
            </span>
            <span className="font-display text-[30px] font-bold tracking-[-0.02em] text-white">
              {naira(total)}
            </span>
          </div>
          {hasMissing && (
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-[12px] text-accent">{missingNote}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-bg px-4 pb-[22px] pt-3">
        {error && <div className="mb-2 text-[12px] text-over">{error}</div>}
        {hasMissing ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#E7E2D6] px-4 py-3.5 text-[15px] font-bold text-muted">
              Save invoice
            </div>
            <span className="text-[11.5px] text-muted">Add the missing price to enable</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-[15px] font-bold text-accent-ink shadow-[0_12px_24px_-10px_var(--accent)] disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save invoice →"}
          </button>
        )}
      </div>
    </div>
  );
}
