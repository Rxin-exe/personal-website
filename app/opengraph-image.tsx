import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/site";
import { PALETTE, dither, paintClimber, paintHorizon } from "@/lib/dither";
import { encodePng } from "@/lib/png";

export const alt = `${profile.name}: ${profile.bio}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CELL = 3;

/**
 * The link preview (LinkedIn, Slack, iMessage): the hero's summit at sunset, drawn by the
 * same dither code as the site, with the name in Geist Pixel and the rest in Geist.
 */
export default async function OpengraphImage() {
  const w = size.width / CELL;
  const h = size.height / CELL;
  const px = new Uint8ClampedArray(w * h * 4);
  paintHorizon(px, w, h);
  dither(px, w, h, 48);
  paintClimber(px, w, h);
  // A few stars in the darkest sky, like the site.
  const [ir, ig, ib] = PALETTE[0];
  for (let i = 0, n = 0; i < px.length; i += 4, n++) {
    if (px[i] !== ir || px[i + 1] !== ig || px[i + 2] !== ib) continue;
    const r = Math.sin(n * 12.9898) * 43758.5453;
    if (r - Math.floor(r) < 0.004) px.set([100, 120, 184], i);
  }
  const scene = `data:image/png;base64,${encodePng(px, w, h, CELL).toString("base64")}`;
  const [pixel, sans] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/GeistPixel-Regular.ttf")),
    readFile(join(process.cwd(), "app/fonts/Geist-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Geist" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scene} width={size.width} height={size.height} alt="" style={{ position: "absolute", inset: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", padding: "96px 84px", width: 1100 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#ff8b3d" }}>{profile.status}</div>
          <div style={{ display: "flex", fontFamily: "Geist Pixel", fontSize: 108, color: "#f2ede4", whiteSpace: "nowrap", lineHeight: 1, marginTop: 20 }}>{profile.name}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#f2ede4", lineHeight: 1.35, marginTop: 28, maxWidth: 620 }}>{profile.bio}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Pixel", data: pixel, weight: 400, style: "normal" },
        { name: "Geist", data: sans, weight: 500, style: "normal" },
      ],
    }
  );
}
