import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LogoMark } from "@/components/logo-mark";

const STEPS = [
  {
    n: 1,
    title: "Type your order",
    body: "In plain words, like a text. Nado reads it into clean line items.",
  },
  {
    n: 2,
    title: "Send the payment link",
    body: "Share it anywhere. Your buyer pays by card, transfer or USSD.",
  },
  {
    n: 3,
    title: "Get paid & track it",
    body: "Everyone gets a receipt, and your sales record keeps itself.",
  },
];

export function LandingPage() {
  return (
    <AppShell fullBleed>
      <div className="flex h-dvh w-full flex-col overflow-y-auto bg-bg">
        <header className="w-full">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-3 sm:px-10 sm:py-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-ink">
                <LogoMark size={21} />
              </span>
              <span className="font-display text-xl font-bold tracking-[-0.02em] text-text">
                Nado
              </span>
            </div>
            <nav className="hidden items-center gap-8 sm:flex">
              <a
                href="#how-it-works"
                className="text-[13.5px] font-semibold text-muted transition-colors hover:text-text"
              >
                How it works
              </a>
            </nav>
            <Link
              href="/onboarding"
              className="rounded-full bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-ink"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col sm:grid sm:grid-cols-2 sm:items-center sm:gap-14 sm:px-10 sm:py-14">
            <div className="px-6 pb-[30px] pt-6 sm:px-0 sm:py-0">
              <span className="mb-[18px] inline-flex items-center gap-1.5 rounded-full bg-accent/[0.16] px-2.5 py-1 font-mono text-[10.5px] font-bold tracking-[0.04em] text-pending">
                For traders &amp; home businesses
              </span>
              <h1 className="mb-3.5 font-display text-[38px] font-bold leading-[1.02] tracking-[-0.03em] text-text sm:text-[46px]">
                Type it.
                <br />
                Send it.
                <br />
                <span className="text-pending">Get paid.</span>
              </h1>
              <p className="mb-[22px] max-w-[440px] text-[15.5px] leading-[1.55] text-[#4A4A55]">
                Write an order the way you already text your customers. Nado
                turns it into a proper invoice, a payment link, and a receipt
                — with your sales tracked as you go.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-4 text-[15.5px] font-bold text-accent-ink shadow-[0_14px_26px_-10px_var(--accent)] sm:w-auto sm:px-8"
              >
                Get started — it&apos;s free →
              </Link>
            </div>

            <div className="mx-5 mb-[30px] flex flex-col gap-3 rounded-[20px] bg-ink p-[18px] sm:mx-0 sm:mb-0 sm:w-full sm:max-w-[380px] sm:justify-self-end sm:shadow-[0_30px_60px_-20px_rgba(14,21,38,0.35)]">
              <div className="max-w-[82%] self-end rounded-[16px] rounded-br-[5px] bg-surface2 px-3.5 py-2.5 text-[13px] leading-[1.45] text-white">
                5 cartons of Indomie, 2 bags of rice, delivery 5,000
              </div>
              <div className="flex flex-col gap-2.5 rounded-[14px] bg-white p-[13px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.06em] text-muted">
                    #INV-2049
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pending-bg px-2.5 py-1 text-[10.5px] font-bold text-pending">
                    <span className="h-[5px] w-[5px] rounded-full bg-pending" />
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2.5">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                      Total
                    </span>
                    <span className="font-display text-[19px] font-bold tracking-[-0.01em] text-text">
                      ₦56,000
                    </span>
                  </div>
                  <span className="text-[11.5px] font-bold text-pending">
                    Payment link ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div id="how-it-works" className="bg-ink px-6 py-[30px] sm:py-16">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 sm:px-10">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
                How it works
              </span>
              <div className="flex flex-col gap-5 sm:grid sm:grid-cols-3 sm:gap-10">
                {STEPS.map((step) => (
                  <div key={step.n} className="flex items-start gap-3.5 sm:flex-col sm:gap-4">
                    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-accent font-display text-[15px] font-bold text-accent-ink">
                      {step.n}
                    </span>
                    <div className="flex flex-col gap-[3px]">
                      <span className="font-display text-[16px] font-semibold tracking-[-0.01em] text-white">
                        {step.title}
                      </span>
                      <span className="text-[13px] leading-[1.45] text-white/60">
                        {step.body}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 px-6 py-[30px] text-center">
            <div className="flex items-center gap-2">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-ink">
                <LogoMark size={16} />
              </span>
              <span className="font-display text-base font-bold tracking-[-0.02em] text-text">
                Nado
              </span>
            </div>
            <span className="text-[12.5px] text-muted">Get paid for your hustle.</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
