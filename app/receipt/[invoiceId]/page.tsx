import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptCard } from "@/components/receipt-card";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { lineItems: true },
  });

  if (!invoice || invoice.status !== "PAID") {
    notFound();
  }

  return (
    <ReceiptCard
      invoice={{
        id: invoice.id,
        total: invoice.total,
        createdAt: invoice.createdAt.toISOString(),
        paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
        lineItems: invoice.lineItems.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
        })),
      }}
    />
  );
}
