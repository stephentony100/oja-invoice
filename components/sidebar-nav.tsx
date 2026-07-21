"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";

export function SidebarNav() {
  const pathname = usePathname();
  const active = pathname?.startsWith("/dashboard") ? "dashboard" : "chat";

  return (
    <div className="hidden sm:sticky sm:top-0 sm:flex sm:h-dvh sm:w-[76px] sm:shrink-0 sm:flex-col sm:items-center sm:gap-2 sm:border-r sm:border-line sm:bg-bg sm:py-6">
      <Link
        href="/chat"
        aria-label="Nado"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-ink"
      >
        <LogoMark size={22} />
      </Link>
      <Link
        href="/chat"
        aria-label="Chat"
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
          active === "chat" ? "bg-accent/[0.16] text-accent" : "text-muted hover:bg-surface/[0.06]"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path
            d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v7c0 1.38-1.12 2.5-2.5 2.5H9l-4 3.5v-3.5h-.5C3.12 16 2 14.88 2 13.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <Link
        href="/dashboard"
        aria-label="Dashboard"
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
          active === "dashboard" ? "bg-accent/[0.16] text-accent" : "text-muted hover:bg-surface/[0.06]"
        }`}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="8" height="8" rx="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="1.8" />
        </svg>
      </Link>
    </div>
  );
}
