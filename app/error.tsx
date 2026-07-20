"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-over-bg">
        <span className="font-display text-2xl font-bold text-over">!</span>
      </span>
      <div className="font-display text-xl font-bold tracking-[-0.01em] text-text">
        Something went wrong
      </div>
      <p className="max-w-[280px] text-[13.5px] text-muted">
        That's on us, not you — give it another try.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-xl bg-accent px-5 py-2.5 text-[14px] font-bold text-accent-ink shadow-[0_12px_24px_-10px_var(--accent)]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border-[1.5px] border-ink px-5 py-2.5 text-[14px] font-bold text-ink"
        >
          Back to Kobo
        </Link>
      </div>
    </div>
  );
}
