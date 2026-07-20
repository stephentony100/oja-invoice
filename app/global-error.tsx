"use client";

// global-error replaces the root layout when it fires, so it can't rely on
// next/font or globals.css being loaded — kept self-contained with inline
// styles using the same palette as the rest of the app.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
          textAlign: "center",
          background: "#FBF7EE",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <span
          style={{
            display: "flex",
            height: 60,
            width: 60,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "#F6DED9",
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 700, color: "#C0392B" }}>!</span>
        </span>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#131A2B" }}>
          Something went wrong
        </div>
        <p style={{ maxWidth: 280, fontSize: 13.5, color: "#5F6678" }}>
          That&apos;s on us, not you — give it another try.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            marginTop: 8,
            borderRadius: 12,
            border: "none",
            background: "#F2B33D",
            color: "#231703",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
