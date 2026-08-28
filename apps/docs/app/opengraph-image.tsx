import { ImageResponse } from "next/og";

export const alt = "Meu Mobile — 安静、可靠的移动端组件";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        color: "#17241d",
        background: "#f5f3ee",
        fontFamily: "sans-serif"
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26, fontWeight: 700 }}
      >
        <span
          style={{
            width: 54,
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f5f3ee",
            background: "#17241d",
            borderRadius: 12
          }}
        >
          M
        </span>
        Meu Mobile / 0.1
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#32845d", fontSize: 20, fontWeight: 700, letterSpacing: 3 }}>
          REACT COMPONENT SYSTEM
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.03,
            letterSpacing: -5
          }}
        >
          <span>安静、可靠的</span>
          <span>移动端组件。</span>
        </div>
      </div>
    </div>,
    size
  );
}
