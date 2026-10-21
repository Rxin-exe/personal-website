import { ImageResponse } from "next/og";
import { profile } from "@/content/site";

export const alt = `${profile.name}: ${profile.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The link-preview card shown when the site is shared.
export default function OpengraphImage() {
  const dots = Array.from({ length: 7 * 26 }, (_, i) => i);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "linear-gradient(180deg, #000000 0%, #0a0a0a 55%, #141414 100%)",
          color: "#fafafa",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 40,
            display: "flex",
            flexWrap: "wrap",
            gap: 26,
            padding: "0 40px",
            opacity: 0.5,
          }}
        >
          {dots.map((i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                background: i % 26 > 15 && i % 26 < 21 && i > 52 ? "#f59e0b" : "#3f3f46",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#f59e0b", marginBottom: 28 }}>
          {profile.initials}
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#a1a1aa", marginTop: 28, maxWidth: 900 }}>
          {profile.headline}
        </div>
      </div>
    ),
    size
  );
}
