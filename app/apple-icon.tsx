import { ImageResponse } from "next/og";
import { profile } from "@/content/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iOS.
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
          background: "#171F44",
          color: "#74FFED",
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -3,
        }}
      >
        {profile.initials}
      </div>
    ),
    size
  );
}
