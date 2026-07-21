import { LogoMark } from "@/components/logo-mark";
import { SidebarNav } from "@/components/sidebar-nav";

// Faint decorative backdrop for the desktop remaining-space area, so it
// reads as an intentional surface rather than empty page background.
function DesktopBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
      <div className="absolute -right-28 -top-28 h-[440px] w-[440px] rounded-full bg-accent/[0.10] blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full bg-ink/[0.05] blur-3xl" />
      <div className="absolute right-[8%] top-[18%] opacity-[0.04]">
        <LogoMark size={280} />
      </div>
    </div>
  );
}

// Desktop treatment for every screen: no floating card on a backdrop — the
// content simply sits directly on the page's own background, just centered
// with a wider max-width. At the sm breakpoint a slim sidebar (Nado mark +
// Chat/Dashboard nav) replaces the mobile top-tab switcher, and the
// remaining space gets a subtle gradient/watermark treatment instead of
// sitting empty. Mobile is untouched — every sm:-prefixed class here is a
// no-op below that breakpoint.
export function AppShell({
  children,
  wide = false,
  tone = "light",
  sidebar = false,
  fullBleed = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  tone?: "light" | "dark";
  sidebar?: boolean;
  fullBleed?: boolean;
}) {
  return (
    <div className={`min-h-dvh w-full ${tone === "dark" ? "bg-ink" : "bg-bg"} sm:flex`}>
      {sidebar && <SidebarNav />}
      <div className="relative sm:min-h-dvh sm:flex-1">
        {sidebar && !fullBleed && <DesktopBackdrop />}
        {fullBleed ? (
          children
        ) : (
          <div
            className={`relative mx-auto h-dvh w-full ${wide ? "sm:max-w-[1040px]" : "sm:max-w-[600px]"}`}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
