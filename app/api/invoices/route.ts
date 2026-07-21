import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { naira, toKobo } from "@/lib/invoice";
import { createPaymentLink } from "@/lib/monnify";
import { getSellerIdFromCookie } from "@/lib/seller-server";

interface InvoiceItemInput {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
}

export async function POST(request: Request) {
  // Seller identity is never trusted from the request body — a caller
  // could otherwise attribute an invoice to any sellerId they know just by
  // putting it in the JSON payload. Derived server-side from the session
  // cookie instead.
  const sellerId = await getSellerIdFromCookie();
  if (!sellerId) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawInputText = body?.rawInputText;
  const items: InvoiceItemInput[] | undefined = body?.items;

  if (typeof rawInputText !== "string" || !rawInputText.trim()) {
    return Response.json({ error: "Missing rawInputText" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Missing line items" }, { status: 400 });
  }
  if (items.some((it) => it.unitPrice == null)) {
    return Response.json(
      { error: "Every line item needs a price before saving" },
      { status: 400 }
    );
  }

  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  if (!seller) {
    return Response.json({ error: "Seller not found" }, { status: 404 });
  }

  const total = items.reduce(
    (sum, it) => sum + it.quantity * (it.unitPrice as number),
    0
  );

  // Create the row first (no monnify fields yet) so we have a real invoice
  // id to redirect the buyer back to after payment — Monnify's redirectUrl
  // needs to point at /paid/{invoice.id}, which doesn't exist until the row
  // does.
  const invoice = await prisma.invoice.create({
    data: {
      sellerId,
      rawInputText,
      total: toKobo(total),
      status: "PENDING",
      lineItems: {
        create: items.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: toKobo(it.unitPrice as number),
          lineTotal: toKobo(it.quantity * (it.unitPrice as number)),
        })),
      },
    },
    include: { lineItems: true },
  });

  const paymentReference = `nado-${crypto.randomUUID()}`;
  try {
    const link = await createPaymentLink({
      amountNaira: total,
      paymentReference,
      paymentDescription: `Invoice from ${seller.name} — ${naira(total)}`,
      customerName: "Nado Buyer",
      customerEmail: "buyer@nado.app",
      invoiceId: invoice.id,
    });

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        monnifyPaymentLink: link.checkoutUrl,
        monnifyReference: link.paymentReference,
        monnifyLinkGeneratedAt: new Date(),
      },
      include: { lineItems: true },
    });

    return Response.json({ ok: true, invoice: updated, sellerName: seller.name });
  } catch (error) {
    // The seller's work (the invoice + line items) is never lost, even if
    // Monnify is unreachable — the row stays with monnifyPaymentLink null
    // and the share screen offers a retry via /api/invoices/[id]/link,
    // which already knows how to generate a link from scratch.
    console.error("[invoices] payment link generation failed:", error);
    return Response.json({ ok: true, invoice, sellerName: seller.name });
  }
}
