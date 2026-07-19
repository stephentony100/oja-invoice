import { forwardRef } from "react";
import {
  formatDateLong,
  formatTimeAmPm,
  isDeliveryItem,
  naira,
  toNaira,
} from "@/lib/invoice";

const SELLER_NAME = "Mama Nkechi Stores";

export interface DocumentLineItem {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface DocumentData {
  id: string;
  total: number;
  createdAt: string;
  paidAt: string | null;
  lineItems: DocumentLineItem[];
}

interface DocumentCardProps {
  invoice: DocumentData;
  paid: boolean;
}

// The single source of truth for the invoice/receipt document image —
// unpaid (4A) and paid (3B/4B) are the same artifact with a few bits
// toggled, not two separate renderers.
export const DocumentCard = forwardRef<HTMLDivElement, DocumentCardProps>(
  function DocumentCard({ invoice, paid }, ref) {
    const invoiceCode = invoice.id.slice(-6).toUpperCase();
    const paidAt = invoice.paidAt ? new Date(invoice.paidAt) : new Date();
    const issuedAt = new Date(invoice.createdAt);

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

    return (
      <div
        ref={ref}
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
                {paid ? "Receipt" : "Invoice"}
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-white/60">#{invoiceCode}</span>
        </div>

        <div className="relative px-6 pb-2 pt-[22px]">
          {paid && (
            <div className="absolute right-[18px] top-3.5 -rotate-[9deg] rounded-xl border-[3px] border-paid bg-paid/[0.06] px-3.5 py-[7px] pb-1.5 text-center">
              <div className="font-display text-2xl font-bold leading-none tracking-[0.14em] text-paid">
                PAID
              </div>
              <div className="mt-[3px] font-mono text-[8.5px] tracking-[0.12em] text-paid">
                {formatDateLong(paidAt).toUpperCase()} · {formatTimeAmPm(paidAt)}
              </div>
            </div>
          )}

          <div className="font-display text-[22px] font-bold tracking-[-0.01em] text-text">
            {SELLER_NAME}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted">
            Issued {formatDateLong(issuedAt)} · {formatTimeAmPm(issuedAt)}
            {!paid && " · Due today"}
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
              {paid ? "Total paid" : "Total due"}
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
          {paid && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paid-bg px-2.5 py-1 text-[11px] font-bold text-paid">
              <span className="h-1.5 w-1.5 rounded-full bg-paid" />
              Settled
            </span>
          )}
        </div>
      </div>
    );
  }
);
