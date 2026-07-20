"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveDraft } from "@/lib/draft-storage";
import type { ParsedInvoice } from "@/lib/parser";

export function ChatComposer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    const FRIENDLY_FALLBACK = "Couldn't understand that order — try rephrasing it.";

    try {
      const res = await fetch("/api/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      // Parse the body separately from the fetch itself — a malformed/non-
      // JSON response (e.g. an upstream gateway error page) must still show
      // the friendly fallback below, not a raw JSON-parse error string.
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : FRIENDLY_FALLBACK
        );
      }
      if (!data?.items) {
        throw new Error(FRIENDLY_FALLBACK);
      }

      const parsed = data as ParsedInvoice;
      saveDraft({
        rawInputText: trimmed,
        items: parsed.items.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unit_price,
        })),
      });
      setText("");
      router.push("/review");
    } catch (e) {
      // The seller's typed input is intentionally left in place (no
      // setText("")) so they can retry without retyping.
      setError(e instanceof Error ? e.message : FRIENDLY_FALLBACK);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-line bg-bg px-4 pb-5 pt-3">
      {error && <div className="mb-2 text-[12px] text-over">{error}</div>}
      <div className="flex items-center gap-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
          placeholder='Type an order… "2 bags cement, delivery 3,000"'
          className="flex-1 rounded-[22px] border-[1.5px] border-line bg-white px-4 py-3.5 text-[14px] text-text outline-none placeholder:text-muted disabled:opacity-60"
        />
        <button
          type="button"
          aria-label="Send"
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_10px_20px_-8px_var(--accent)] disabled:opacity-50"
        >
          <span className="ml-1 block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-accent-ink" />
        </button>
      </div>
    </div>
  );
}
