import { AppHeader } from "@/components/app-header";
import { InvoiceCard, type InvoiceCardData } from "@/components/invoice-card";
import { naira, toNaira } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { getSeedSellerId } from "@/lib/seed-seller";

// Same reasoning as the chat feed: this reads real DB totals on every
// request, so it must never be statically prerendered.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sellerId = await getSeedSellerId();
  const invoices = await prisma.invoice.findMany({
    where: { sellerId },
    include: { lineItems: true },
    orderBy: { createdAt: "desc" },
  });

  let totalSales = 0;
  let pendingSum = 0;
  let pendingCount = 0;

  for (const invoice of invoices) {
    if (invoice.status === "PAID") {
      totalSales += invoice.total;
    } else {
      pendingSum += invoice.total;
      pendingCount += 1;
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-bg">
      <AppHeader active="dashboard" />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 pt-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1 rounded-[18px] bg-ink px-[18px] py-4 pb-[18px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/55">
                Total sales
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paid/[0.26] px-2.5 py-[3px] text-[10.5px] font-bold text-[#6FE0AF]">
                <span className="h-[5px] w-[5px] rounded-full bg-[#6FE0AF]" />
                Paid
              </span>
            </div>
            <span className="font-display text-[34px] font-bold tracking-[-0.02em] text-white">
              {naira(toNaira(totalSales))}
            </span>
          </div>
          <div className="flex gap-2.5">
            <div className="flex flex-1 flex-col gap-1.5 rounded-[18px] border border-line bg-white p-[15px] shadow-[0_14px_30px_-22px_rgba(14,21,38,0.4)]">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                Pending
              </span>
              <span className="font-display text-[22px] font-bold tracking-[-0.01em] text-pending">
                {naira(toNaira(pendingSum))}
              </span>
              <span className="text-[11px] text-muted">
                {pendingCount} unpaid
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 rounded-[18px] border border-line bg-white p-[15px] shadow-[0_14px_30px_-22px_rgba(14,21,38,0.4)]">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                Invoices
              </span>
              <span className="font-display text-[22px] font-bold tracking-[-0.01em] text-text">
                {invoices.length}
              </span>
              <span className="text-[11px] text-muted">created</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-0.5 pt-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
            All invoices
          </span>
          {invoices.length > 0 && (
            <span className="font-mono text-[10.5px] text-muted">Most recent</span>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-muted">
            No invoices yet
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice as InvoiceCardData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
