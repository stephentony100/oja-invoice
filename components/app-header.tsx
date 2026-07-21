import Link from "next/link";
import { AvatarMenu } from "@/components/avatar-menu";
import { LogoMark } from "@/components/logo-mark";

export function AppHeader({
  active,
  sellerName,
}: {
  active: "chat" | "dashboard";
  sellerName: string;
}) {
  const title = active === "chat" ? "Nado" : "Dashboard";

  return (
    <header className="border-b border-line px-5 pt-3.5 sm:pb-3.5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink">
            <LogoMark size={22} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[17px] font-bold tracking-[-0.01em] text-text">
              {title}
            </span>
            <span className="text-[12px] text-muted">{sellerName}</span>
          </div>
        </div>
        <AvatarMenu sellerName={sellerName} />
      </div>
      <nav className="flex items-center gap-[22px] sm:hidden">
        <Link
          href="/chat"
          className={`flex flex-col gap-2 pb-2.5 text-[14px] ${
            active === "chat" ? "font-bold text-text" : "font-semibold text-muted"
          }`}
        >
          Chat
          <span
            className={`h-[2.5px] rounded-[3px] ${active === "chat" ? "bg-accent" : "bg-transparent"}`}
          />
        </Link>
        <Link
          href="/dashboard"
          className={`flex flex-col gap-2 pb-2.5 text-[14px] ${
            active === "dashboard" ? "font-bold text-text" : "font-semibold text-muted"
          }`}
        >
          Dashboard
          <span
            className={`h-[2.5px] rounded-[3px] ${active === "dashboard" ? "bg-accent" : "bg-transparent"}`}
          />
        </Link>
      </nav>
    </header>
  );
}
