export default function PaidConfirmationPage() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-paid-bg">
        <span className="mt-[-4px] block h-[11px] w-5 -rotate-45 border-b-[3px] border-l-[3px] border-paid" />
      </span>
      <div className="font-display text-xl font-bold tracking-[-0.01em] text-text">
        Payment received
      </div>
      <p className="max-w-[280px] text-[13.5px] text-muted">
        Thanks! The seller has been notified. You can close this window now.
      </p>
    </div>
  );
}
