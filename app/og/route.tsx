import { ImageResponse } from "next/og";
export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export async function GET() {
  return new ImageResponse(
    <div style={{ background: "#0a0a0a", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ fontSize: 120, marginBottom: 20 }}>💀</div>
      <div style={{ fontSize: 64, fontWeight: "bold", color: "white", marginBottom: 12 }}>Hangman</div>
      <div style={{ fontSize: 28, color: "#6b7280" }}>guess the word · pay ETH · no refunds · on Base</div>
    </div>,
    { ...size }
  );
}
