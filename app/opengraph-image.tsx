import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Nado — Type it. Send it. Get paid.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const iconBuffer = await readFile(join(process.cwd(), "app/apple-icon.png"));
  const iconSrc = `data:image/png;base64,${iconBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#0E1526",
        }}
      >
        <img
          src={iconSrc}
          width={150}
          height={150}
          style={{ borderRadius: 34 }}
        />
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#FFFFFF" }}>
          Nado
        </div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#F2B33D" }}>
          Type it. Send it. Get paid.
        </div>
      </div>
    ),
    { ...size }
  );
}
