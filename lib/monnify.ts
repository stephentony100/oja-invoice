import crypto from "crypto";

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

export function assertMonnifyEnv() {
  if (
    !MONNIFY_BASE_URL ||
    !MONNIFY_API_KEY ||
    !MONNIFY_SECRET_KEY ||
    !MONNIFY_CONTRACT_CODE
  ) {
    throw new Error(
      "Missing one or more Monnify env vars: MONNIFY_BASE_URL, MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE"
    );
  }
}

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
  ).toString("base64");

  const res = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok || !data?.responseBody?.accessToken) {
    throw new Error(
      `Monnify auth failed: ${res.status} ${JSON.stringify(data)}`
    );
  }

  return data.responseBody.accessToken as string;
}

export interface CreatePaymentLinkParams {
  amountNaira: number;
  paymentReference: string;
  paymentDescription: string;
  customerName: string;
  customerEmail: string;
}

export interface CreatePaymentLinkResult {
  checkoutUrl: string;
  paymentReference: string;
}

export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<CreatePaymentLinkResult> {
  assertMonnifyEnv();
  const accessToken = await getAccessToken();

  const initRes = await fetch(
    `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amountNaira,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        paymentReference: params.paymentReference,
        paymentDescription: params.paymentDescription,
        currencyCode: "NGN",
        contractCode: MONNIFY_CONTRACT_CODE,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/paid`,
        paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      }),
    }
  );

  const initData = await initRes.json();

  if (!initRes.ok || initData?.requestSuccessful !== true || !initData?.responseBody?.checkoutUrl) {
    throw new Error(
      `Monnify init-transaction failed: ${initRes.status} ${JSON.stringify(initData)}`
    );
  }

  return {
    checkoutUrl: initData.responseBody.checkoutUrl as string,
    paymentReference: params.paymentReference,
  };
}

// Monnify signs every webhook request body with an HMAC-SHA512 hash of the
// raw request body, keyed with the client secret key, sent in the
// "monnify-signature" header. Must be computed over the exact raw bytes
// Monnify sent — not a re-serialized/parsed version — since re-stringifying
// can change key order/whitespace and produce a different hash.
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader || !MONNIFY_SECRET_KEY) return false;

  const computed = crypto
    .createHmac("sha512", MONNIFY_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}
