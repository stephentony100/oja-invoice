import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaidScreen } from "@/components/paid-screen";

export const dynamic = "force-dynamic";

export default async function PaidPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { lineItems: true },
  });

  if (!invoice) {
    notFound();
  }

  return (
    <PaidScreen
      invoice={{
        id: invoice.id,
        total: invoice.total,
        status: invoice.status,
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
