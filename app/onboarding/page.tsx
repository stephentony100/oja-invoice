"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LogoMark } from "@/components/logo-mark";
import { setStoredSellerId } from "@/lib/seller-client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, phone: phone.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.seller?.id) {
        throw new Error(data?.error ?? "Couldn't create your store — try again.");
      }
      setStoredSellerId(data.seller.id);
      localStorage.setItem("nado_tour_pending", "1");
      router.push("/chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create your store — try again.");
      setSubmitting(false);
    }
  }

  return (
    <AppShell fullBleed>
      <div className="flex h-dvh w-full flex-col sm:flex-row">
        <div className="hidden sm:flex sm:w-[42%] sm:flex-col sm:justify-between sm:bg-ink sm:px-12 sm:py-12">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <LogoMark size={28} />
          </span>
          <div>
            <h2 className="mb-3 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
              Run your hustle like a real business.
            </h2>
            <p className="max-w-[360px] text-[14.5px] leading-[1.6] text-white/60">
              Type orders, send payment links, get paid, and keep a clean
              sales record — all from one chat-style screen.
            </p>
          </div>
          <span className="text-[11.5px] text-white/40">
            Nado · Get paid for your hustle.
          </span>
        </div>

        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto bg-bg px-[26px] py-[30px] sm:items-center sm:justify-center sm:px-16">
          <div className="flex w-full flex-col sm:max-w-[400px]">
            <span className="mb-6 flex h-[58px] w-[58px] items-center justify-center rounded-2xl bg-ink sm:hidden">
              <LogoMark size={36} />
            </span>
            <h1 className="mb-2 font-display text-[27px] font-bold leading-[1.1] tracking-[-0.02em] text-text">
              Let&apos;s set up your store
            </h1>
            <p className="mb-7 text-[14px] leading-[1.5] text-muted">
              This is the name your buyers see on invoices and receipts. You
              can change it anytime.
            </p>

            <div className="flex flex-col gap-[18px]">
              <div className="flex flex-col gap-[7px]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-text">
                  Store name <span className="text-pending">*</span>
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mama Nkechi Stores"
                  className="rounded-xl border-[1.5px] border-accent bg-white px-[15px] py-3.5 text-[15px] font-semibold text-text shadow-[0_0_0_4px_rgba(242,179,61,0.16)] outline-none placeholder:font-normal placeholder:text-muted"
                />
              </div>
              <div className="flex flex-col gap-[7px]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
                  Phone number{" "}
                  <span className="font-sans text-[12px] font-normal normal-case tracking-normal">
                    · optional
                  </span>
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="rounded-xl border-[1.5px] border-line bg-bg px-[15px] py-3.5 text-[15px] text-text outline-none placeholder:text-muted"
                />
                <span className="text-[11.5px] text-muted">
                  For payment alerts and account recovery.
                </span>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-[30px] sm:mt-7">
              {error && <div className="text-[12px] text-over">{error}</div>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!name.trim() || submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-4 text-[15.5px] font-bold text-accent-ink shadow-[0_14px_26px_-10px_var(--accent)] disabled:opacity-60"
              >
                {submitting ? "Setting up…" : "Start using Nado →"}
              </button>
              <span className="text-center text-[11.5px] text-muted">
                No card, no setup fee — just start sending invoices.
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
