/**
 * The Konami-code easter egg: for a few seconds the whole night world turns to day.
 * Scenes read `daylight.on` when they paint, and redraw when the "daylight" event fires.
 */
export const daylight = { on: false };

export function setDaylight(on: boolean) {
  if (daylight.on === on) return;
  daylight.on = on;
  document.documentElement.classList.toggle("daytime", on);
  window.dispatchEvent(new Event("daylight"));
}

/**
 * Setting the sun (click it five times): the summit goes sunset → dusk → night for a few
 * seconds, then back. Read by the summit's painter; `redraw` asks that scene to repaint.
 */
export const summitSky = { mode: "sunset" as "sunset" | "dusk" | "night" };

/** Asks one scene to repaint, dissolving from its current frame (see DitherScene). */
export function redrawScene(scene: string) {
  window.dispatchEvent(new CustomEvent("scene-redraw", { detail: scene }));
}

/** Plays a scene's action from outside it, e.g. typing "send" sends the camp climber. */
export function actOnScene(scene: string, id: string) {
  window.dispatchEvent(new CustomEvent("scene-act", { detail: { scene, id } }));
}
