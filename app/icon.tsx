import { ImageResponse } from "next/og";

export const runtime = "edge";

// Standard browser-tab favicon — same monogram as apple-icon.tsx, sized for
// a tab icon rather than a home-screen tile.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#211d18",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 20,
            fontWeight: 400,
            color: "#f4f0e9",
            letterSpacing: "-1px",
          }}
        >
          V<span style={{ fontStyle: "italic", fontWeight: 300 }}>&amp;</span>
        </span>
      </div>
    ),
    { ...size }
  );
}
