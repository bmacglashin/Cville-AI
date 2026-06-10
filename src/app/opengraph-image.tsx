import { ImageResponse } from "next/og";

export const alt = "Agent Ally — Practical AI implementation for Charlottesville owner-led businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(160deg, #14271f 0%, #0d1b15 100%)",
          color: "#f2efe7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1e3a31",
              border: "2px solid #c89a5b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#c89a5b",
            }}
          >
            A
          </div>
          <div style={{ fontSize: 36, fontWeight: 600 }}>Agent Ally</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 58, lineHeight: 1.15, maxWidth: 980 }}>
            Practical AI implementation for Charlottesville owner-led businesses.
          </div>
          <div style={{ fontSize: 28, color: "#c89a5b" }}>
            Audit first · One workflow at a time · Human review always
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
