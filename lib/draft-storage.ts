const DRAFT_KEY = "oja:draft-invoice";

export interface DraftInvoiceItem {
  name: string;
  quantity: number;
  unit: string | null;
  unitPrice: number | null;
}

export interface DraftInvoice {
  rawInputText: string;
  items: DraftInvoiceItem[];
}

export function saveDraft(draft: DraftInvoice) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftInvoice | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftInvoice;
  } catch {
    return null;
  }
}

export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
