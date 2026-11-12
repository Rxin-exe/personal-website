import { ImageResponse } from "next/og";
import { summitIcon } from "@/lib/iconScene";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Browser-tab icon: the climber on the summit at sunset, in pixels.
export default function Icon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={summitIcon(32, 2)} width={64} height={64} alt="" style={{ borderRadius: 12 }} />
    ),
    size
  );
}
