import { Fragment } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import { ChatComposer } from "@/components/chat-composer";
import { InvoiceCard, type InvoiceCardData } from "@/components/invoice-card";
import { OnboardingTour } from "@/components/onboarding-tour";
import { formatTime } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";
import { getSellerIdFromCookie } from "@/lib/seller-server";

// Reads the invoice feed fresh from the DB on every request — this page
// must never be statically prerendered, or newly saved invoices would
// never show up after a reload.
export const dynamic = "force-dynamic";

interface FeedInvoice extends InvoiceCardData {
  rawInputText: string;
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

export default async function ChatPage() {
  const sellerId = await getSellerIdFromCookie();
  if (!sellerId) redirect("/");

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) redirect("/");

  const invoices = await prisma.invoice.findMany({
    where: { sellerId },
    include: { lineItems: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppShell sidebar>
      <div className="flex h-full w-full flex-col bg-bg">
        <AppHeader active="chat" sellerName={seller.name} />

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
                  <InvoiceCard invoice={invoice as FeedInvoice} sellerName={seller.name} />
                </Fragment>
              ))}
            </>
          )}
        </div>

        <ChatComposer />
      </div>
      <OnboardingTour />
    </AppShell>
  );
}
