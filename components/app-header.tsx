import Link from "next/link";

const SELLER_NAME = "Mama Nkechi Stores";

export function AppHeader({ active }: { active: "chat" | "dashboard" }) {
  const title = active === "chat" ? "Kobo" : "Dashboard";

  return (
    <header className="border-b border-line px-5 pt-3.5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-accent">
            k
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[17px] font-bold tracking-[-0.01em] text-text">
              {title}
            </span>
            <span className="text-[12px] text-muted">{SELLER_NAME}</span>
          </div>
        </div>
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface font-display text-[13px] font-bold text-accent">
          MN
        </span>
      </div>
      <nav className="flex items-center gap-[22px]">
        <Link
          href="/"
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
