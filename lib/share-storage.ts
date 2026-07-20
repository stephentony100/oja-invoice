const SHARE_KEY = "oja:share-invoice";

export interface ShareLineItem {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface ShareInvoice {
  id: string;
  total: number;
  monnifyPaymentLink: string | null;
  lineItems: ShareLineItem[];
}

export function saveShareInvoice(invoice: ShareInvoice) {
  sessionStorage.setItem(SHARE_KEY, JSON.stringify(invoice));
}

export function loadShareInvoice(): ShareInvoice | null {
  const raw = sessionStorage.getItem(SHARE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ShareInvoice;
  } catch {
    return null;
  }
}

export function clearShareInvoice() {
  sessionStorage.removeItem(SHARE_KEY);
}
