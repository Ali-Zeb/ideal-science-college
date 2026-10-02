import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Ideal Science College, Serai Naurang — School & College, Class 1 to 12";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social-sharing image generated at build time. */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo.jpg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 80px",
          background: "linear-gradient(135deg, #0a0d27 0%, #1e2a78 60%, #3247b4 100%)",
          color: "white",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", width: 300, height: 300, borderRadius: 300, background: "white", border: "8px solid #f5c84c", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={284} height={284} alt="" style={{ objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 30, color: "#f5c84c", letterSpacing: 4, textTransform: "uppercase" }}>Serai Naurang · Lakki Marwat</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 16 }}>Ideal Science College</div>
          <div style={{ fontSize: 34, marginTop: 24, color: "rgba(255,255,255,0.85)" }}>School & College · Class 1 to 12</div>
          <div style={{ fontSize: 28, marginTop: 12, color: "rgba(255,255,255,0.7)" }}>FSc Pre-Medical · Pre-Engineering · ICS · Separate Girls Wing</div>
        </div>
      </div>
    ),
    size,
  );
}
