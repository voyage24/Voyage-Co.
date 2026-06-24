import { ImageResponse } from "next/og";

export const runtime = "edge";

// iOS reads this file automatically and uses it as the icon shown when a
// visitor taps "Add to Home Screen" — no manual <link> tag needed, Next.js
// wires it into the page's <head> on its own. The brand has no separate
// icon mark (only the "Voyages & Co." wordmark), so this renders a simple
// monogram in the site's own ink/cream palette instead of a cropped logo.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 96,
            fontWeight: 400,
            color: "#f4f0e9",
            letterSpacing: "-2px",
          }}
        >
          V<span style={{ fontStyle: "italic", fontWeight: 300 }}>&amp;</span>
        </span>
      </div>
    ),
    { ...size }
  );
}
