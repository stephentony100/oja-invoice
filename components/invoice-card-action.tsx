"use client";

import Link from "next/link";
import { useState } from "react";

export function CopyLinkAction({ invoiceId }: { invoiceId: string }) {
  const [state, setState] = useState<"idle" | "copying" | "copied" | "error">(
    "idle"
  );

  async function handleClick() {
    if (state === "copying") return;
    setState("copying");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.link) throw new Error(data.error);
      await navigator.clipboard.writeText(data.link);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const label =
    state === "copying"
      ? "Copying…"
      : state === "copied"
        ? "Copied!"
        : state === "error"
          ? "Couldn't copy"
          : "Copy link";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-[12.5px] font-bold text-pending"
    >
      {label}
    </button>
  );
}

export function ViewReceiptAction({ invoiceId }: { invoiceId: string }) {
  return (
    <Link href={`/receipt/${invoiceId}`} className="text-[12.5px] font-bold text-paid">
      View receipt
    </Link>
  );
}
