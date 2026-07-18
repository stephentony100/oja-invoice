import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSeedSellerId } from "@/lib/seed-seller";
import { naira, toKobo } from "@/lib/invoice";
import { createPaymentLink } from "@/lib/monnify";

interface InvoiceItemInput {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
}

export async function POST(request: Request) {
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

  const sellerId = await getSeedSellerId();
  const total = items.reduce(
    (sum, it) => sum + it.quantity * (it.unitPrice as number),
    0
  );

  const paymentReference = `kobo-${crypto.randomUUID()}`;
  let link;
  try {
    link = await createPaymentLink({
      amountNaira: total,
      paymentReference,
      paymentDescription: `Invoice from Mama Nkechi Stores — ${naira(total)}`,
      customerName: "Kobo Buyer",
      customerEmail: "buyer@kobo.ng",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          "Couldn't generate a payment link right now. Please try saving again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }

  const invoice = await prisma.invoice.create({
    data: {
      sellerId,
      rawInputText,
      total: toKobo(total),
      status: "PENDING",
      monnifyPaymentLink: link.checkoutUrl,
      monnifyReference: link.paymentReference,
      monnifyLinkGeneratedAt: new Date(),
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

  return Response.json({ ok: true, invoice });
}
