import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-accent">
        k
      </span>
      <div className="font-display text-xl font-bold tracking-[-0.01em] text-text">
        We couldn't find that
      </div>
      <p className="max-w-[280px] text-[13.5px] text-muted">
        This page or invoice doesn't exist — it may have moved or the link
        might be wrong.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-accent px-5 py-2.5 text-[14px] font-bold text-accent-ink shadow-[0_12px_24px_-10px_var(--accent)]"
      >
        Back to Kobo
      </Link>
    </div>
  );
}
