import { Fragment } from "react";
import { ChatComposer } from "@/components/chat-composer";
import {
  CopyLinkAction,
  DownloadDocumentAction,
  ViewReceiptAction,
} from "@/components/invoice-card-action";
import { formatTime, isDeliveryItem, naira, toNaira } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { getSeedSellerId } from "@/lib/seed-seller";

// Reads the invoice feed fresh from the DB on every request — this page
// must never be statically prerendered, or newly saved invoices would
// never show up after a reload.
export const dynamic = "force-dynamic";

type Status = "PENDING" | "PAID" | "FAILED";

const statusStyles: Record<
  Status,
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

interface FeedLineItem {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

interface FeedInvoice {
  id: string;
  status: Status;
  total: number;
  rawInputText: string;
  createdAt: Date;
  paidAt: Date | null;
  lineItems: FeedLineItem[];
}

function ItemRow({ item }: { item: FeedLineItem }) {
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

function InvoiceCard({ invoice }: { invoice: FeedInvoice }) {
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
          />
          {invoice.status === "PENDING" && <CopyLinkAction invoiceId={invoice.id} />}
          {invoice.status === "PAID" && <ViewReceiptAction invoiceId={invoice.id} />}
        </div>
      </div>
    </div>
  );
}

function SellerMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex max-w-[80%] flex-col items-end gap-1 self-end">
      <div className="rounded-[18px] rounded-br-[6px] bg-ink px-4 py-3 text-[14px] leading-[1.45] text-white">
        {text}
      </div>
      <span className="font-mono text-[10px] text-muted">{time}</span>
    </div>
  );
}

export default async function Home() {
  const sellerId = await getSeedSellerId();
  const invoices = await prisma.invoice.findMany({
    where: { sellerId },
    include: { lineItems: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-accent">
            k
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[17px] font-bold tracking-[-0.01em] text-text">
              Kobo
            </span>
            <span className="text-[12px] text-muted">Mama Nkechi Stores</span>
          </div>
        </div>
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface font-display text-[13px] font-bold text-accent">
          MN
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2 pt-4">
        {invoices.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-muted">
            No invoices yet — type your first order below.
          </div>
        ) : (
          <>
            <div className="self-center rounded-full bg-ink/[0.06] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              Today
            </div>
            {invoices.map((invoice) => (
              <Fragment key={invoice.id}>
                <SellerMessage
                  text={invoice.rawInputText}
                  time={formatTime(invoice.createdAt)}
                />
                <InvoiceCard invoice={invoice as FeedInvoice} />
              </Fragment>
            ))}
          </>
        )}
      </div>

      <ChatComposer />
    </div>
  );
}
