import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { naira, toNaira } from "@/lib/invoice";
import { createPaymentLink } from "@/lib/monnify";

// Monnify sandbox payment links observed to expire after ~40 minutes (see
// AGENTS.md notes-for-later-phases). Anything older than this is silently
// regenerated — the seller never sees an "expired" state, this is invisible
// plumbing that only kicks in when they actually tap Copy link again.
const LINK_MAX_AGE_MS = 30 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return Response.json({ error: "Invoice not found" }, { status: 404 });
  }

  const isStale =
    !invoice.monnifyPaymentLink ||
    !invoice.monnifyLinkGeneratedAt ||
    Date.now() - invoice.monnifyLinkGeneratedAt.getTime() > LINK_MAX_AGE_MS;

  if (!isStale) {
    return Response.json({ ok: true, link: invoice.monnifyPaymentLink });
  }

  const totalNaira = toNaira(invoice.total);
  const paymentReference = `kobo-${crypto.randomUUID()}`;

  let link;
  try {
    link = await createPaymentLink({
      amountNaira: totalNaira,
      paymentReference,
      paymentDescription: `Invoice from Mama Nkechi Stores — ${naira(totalNaira)}`,
      customerName: "Kobo Buyer",
      customerEmail: "buyer@kobo.ng",
      invoiceId: id,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Couldn't refresh the payment link right now.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      monnifyPaymentLink: link.checkoutUrl,
      monnifyReference: link.paymentReference,
      monnifyLinkGeneratedAt: new Date(),
      // Keep the superseded reference matchable — the buyer may complete
      // payment on the old link in the moments before/during this refresh.
      previousMonnifyReferences: invoice.monnifyReference
        ? { push: invoice.monnifyReference }
        : undefined,
    },
  });

  return Response.json({ ok: true, link: updated.monnifyPaymentLink });
}
