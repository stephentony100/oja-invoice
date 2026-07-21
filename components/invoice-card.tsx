import {
  CopyLinkAction,
  DownloadDocumentAction,
  ViewReceiptAction,
} from "@/components/invoice-card-action";
import { isDeliveryItem, naira, toNaira } from "@/lib/invoice";

export type InvoiceCardStatus = "PENDING" | "PAID" | "FAILED";

export const statusStyles: Record<
  InvoiceCardStatus,
  { badgeBg: string; fg: string; dot: string; label: string }
> = {
  PENDING: {
    badgeBg: "bg-pending-bg",
    fg: "text-pending",
    dot: "bg-pending",
    label: "Pending",
  },
  PAID: {
    badgeBg: "bg-paid-bg",
    fg: "text-paid",
    dot: "bg-paid",
    label: "Paid",
  },
  FAILED: {
    badgeBg: "bg-over-bg",
    fg: "text-over",
    dot: "bg-over",
    label: "Failed",
  },
};

export interface InvoiceCardLineItem {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface InvoiceCardData {
  id: string;
  status: InvoiceCardStatus;
  total: number;
  createdAt: Date;
  paidAt: Date | null;
  lineItems: InvoiceCardLineItem[];
  monnifyPaymentLink: string | null;
  monnifyLinkGeneratedAt: Date | null;
}

function ItemRow({ item }: { item: InvoiceCardLineItem }) {
  const delivery = isDeliveryItem(item.name);
  const quantityLabel = item.unit ? `${item.quantity} × ${item.unit}` : `${item.quantity}`;

  return (
    <div className="flex items-start justify-between border-b border-line py-[9px]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold text-text">{item.name}</span>
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
}

export function InvoiceCard({
  invoice,
  sellerName,
}: {
  invoice: InvoiceCardData;
  sellerName: string;
}) {
  const style = statusStyles[invoice.status];

  return (
    <div className="flex flex-col gap-[11px] rounded-[18px] border border-line bg-white p-[15px] shadow-[0_14px_30px_-20px_rgba(14,21,38,0.4)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.06em] text-muted">
          #{invoice.id.slice(-6).toUpperCase()}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full ${style.badgeBg} ${style.fg} px-2.5 py-1 text-[11.5px] font-bold`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>
      <div className="flex flex-col">
        {invoice.lineItems.map((item, i) => (
          <ItemRow key={i} item={item} />
        ))}
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Total
          </span>
          <span className="font-display text-[22px] font-bold tracking-[-0.01em] text-text">
            {naira(toNaira(invoice.total))}
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <DownloadDocumentAction
            invoice={{
              id: invoice.id,
              total: invoice.total,
              createdAt: invoice.createdAt.toISOString(),
              paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
              lineItems: invoice.lineItems,
            }}
            sellerName={sellerName}
          />
          {invoice.status === "PENDING" && (
            <CopyLinkAction
              invoiceId={invoice.id}
              link={invoice.monnifyPaymentLink}
              linkGeneratedAt={
                invoice.monnifyLinkGeneratedAt
                  ? invoice.monnifyLinkGeneratedAt.toISOString()
                  : null
              }
            />
          )}
          {invoice.status === "PAID" && <ViewReceiptAction invoiceId={invoice.id} />}
        </div>
      </div>
    </div>
  );
}
