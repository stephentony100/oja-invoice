import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/monnify";

interface MonnifyWebhookPayload {
  eventType?: string;
  eventData?: {
    paymentReference?: string;
    transactionReference?: string;
    paymentStatus?: string;
    paidOn?: string;
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("monnify-signature");

  // Log raw evidence before any verification/parsing decision, so a rejected
  // or mismatched request still leaves a trace to debug from.
  console.log(
    "[monnify-webhook] raw body:",
    rawBody,
    "| monnify-signature header:",
    signature
  );

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[monnify-webhook] rejected: missing or invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: MonnifyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  console.log(
    "[monnify-webhook] verified event",
    payload.eventType,
    "at",
    new Date().toISOString()
  );

  const eventData = payload.eventData;
  if (
    payload.eventType === "SUCCESSFUL_TRANSACTION" &&
    eventData?.paymentStatus === "PAID" &&
    eventData.paymentReference
  ) {
    const paidOn = eventData.paidOn ? new Date(eventData.paidOn) : new Date();

    const result = await prisma.invoice.updateMany({
      where: { monnifyReference: eventData.paymentReference },
      data: {
        status: "PAID",
        paidAt: isNaN(paidOn.getTime()) ? new Date() : paidOn,
      },
    });

    console.log(
      "[monnify-webhook] matched",
      result.count,
      "invoice(s) for reference",
      eventData.paymentReference
    );
  }

  return new Response("OK", { status: 200 });
}
