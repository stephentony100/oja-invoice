import {
  CopyLinkAction,
  DownloadDocumentAction,
  ViewReceiptAction,
} from "@/components/invoice-card-action";
import { statusStyles, type InvoiceCardData } from "@/components/invoice-card";
import { naira, toNaira } from "@/lib/invoice";

const COLUMNS = "grid-cols-[1.4fr_2.2fr_1fr_1fr_1.8fr]";

function itemsSummary(invoice: InvoiceCardData): string {
  if (invoice.lineItems.length === 0) return "—";
  const [first, ...rest] = invoice.lineItems;
  return rest.length === 0 ? first.name : `${first.name} +${rest.length} more`;
}

// Desktop-only table view of the invoice list — the mobile stacked-card
// format (InvoiceCard) is untouched and stays hidden above this breakpoint.
export function InvoiceTable({
  invoices,
  sellerName,
}: {
  invoices: InvoiceCardData[];
  sellerName: string;
}) {
  return (
    <div className="hidden overflow-hidden rounded-[18px] border border-line bg-white sm:block">
      <div
        className={`grid ${COLUMNS} gap-3 border-b border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted`}
      >
        <span>Invoice</span>
        <span>Items</span>
        <span>Status</span>
        <span>Total</span>
        <span>Actions</span>
      </div>
      {invoices.map((invoice) => {
        const style = statusStyles[invoice.status];
        return (
          <div
            key={invoice.id}
            className={`grid ${COLUMNS} items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0`}
          >
            <span className="font-mono text-[12.5px] tracking-[0.04em] text-text">
              #{invoice.id.slice(-6).toUpperCase()}
            </span>
            <span className="truncate text-[13px] text-muted">{itemsSummary(invoice)}</span>
            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full ${style.badgeBg} ${style.fg} px-2.5 py-1 text-[11px] font-bold`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
            <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-text">
              {naira(toNaira(invoice.total))}
            </span>
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
        );
      })}
    </div>
  );
}
