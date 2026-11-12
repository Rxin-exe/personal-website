import { ImageResponse } from "next/og";
import { summitIcon } from "@/lib/iconScene";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon: the same summit scene as the tab icon, at a finer grid.
export default function AppleIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={summitIcon(60, 3)} width={180} height={180} alt="" />
    ),
    size
  );
}
