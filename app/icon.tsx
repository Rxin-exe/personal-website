import { ImageResponse } from "next/og";
import { profile } from "@/content/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Browser-tab icon: amber initials on black.
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
          background: "#000000",
          borderRadius: 14,
          color: "#f59e0b",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        {profile.initials}
      </div>
    ),
    size
  );
}
