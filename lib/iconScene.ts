import { dither, paintClimber, paintHorizon } from "./dither";
import { encodePng } from "./png";

/**
 * A square crop of the summit scene, centred between the peak and the sun, for the
 * browser-tab and home-screen icons. `cells` is the size in dither cells; each cell is
 * drawn as a `scale`×`scale` block so it stays crisp.
 */
export function summitIcon(cells: number, scale: number) {
  const w = cells * 3;
  const h = Math.round(cells * 1.1);
  const px = new Uint8ClampedArray(w * h * 4);
  paintHorizon(px, w, h);
  dither(px, w, h, 48);
  paintClimber(px, w, h);

  // Crop: the climber a little left of centre, the sun to their right.
  const left = Math.round(w * 0.66 - cells * 0.3);
  const top = h - cells - Math.round(cells * 0.02);
  const out = new Uint8ClampedArray(cells * cells * 4);
  for (let y = 0; y < cells; y++) {
    const from = ((top + y) * w + left) * 4;
    out.set(px.subarray(from, from + cells * 4), y * cells * 4);
  }
  return `data:image/png;base64,${encodePng(out, cells, cells, scale).toString("base64")}`;
}
