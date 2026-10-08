/*
  Desktop icon bitmaps.

  Each icon is a 16x16 bitmap written as text, one character per pixel, which
  is how the icons would have been authored on the machine this system is
  imitating. The renderer merges horizontal runs of equal pixels into single
  rectangles, so an icon costs a handful of nodes instead of 256.

  The table is keyed by DesktopAppId, so an application without artwork is a
  TypeScript error rather than an icon that silently fails to render.

  The palette letters map onto the system colours only, so the artwork can
  never drift away from the rest of the interface:

    K  black      W  white     L  light gray
    G  gray       D  dark gray N  navy      .  transparent
*/

import type { DesktopAppId } from "../../types/window";
import { toRects, type PixelRect } from "../../utils/pixelArt";

const PIXEL_COLORS: Record<string, string> = {
  K: "var(--salahos-black)",
  W: "var(--salahos-white)",
  L: "var(--salahos-light)",
  G: "var(--salahos-gray)",
  D: "var(--salahos-dark)",
  N: "var(--salahos-navy)",
};

const SALAH: readonly string[] = [
  "................",
  "....KKKKKKKK....",
  "..KKWWWWWWWWKK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KKWWWWWWWWKK..",
  "....KKKKKKKK....",
  ".....K....K.....",
  ".....K....K.....",
  "....K.KKKK.K....",
  "...KKK....KKK...",
  "................",
  "................",
];

const PROFILE: readonly string[] = [
  "................",
  ".....KKKKKK.....",
  "....KWWWWWWK....",
  "....KWKKKKWK....",
  "....KWKWWKWK....",
  "....KWKKKKWK....",
  "....KWWWWWWK....",
  ".....KKKKKK.....",
  "....KKKKKKKK....",
  "..KKWWWWWWWWKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWKKWWWWWWKKWK.",
  ".KWKKWWWWWWKKWK.",
  "..KKKKKKKKKKKK..",
  "................",
];

const EDUCATION: readonly string[] = [
  "................",
  "......KKKK......",
  ".....KWWWWK.....",
  "....KKWWWWKK....",
  "..KKKKWWWWKKKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWKWWWWWWWWKWK.",
  ".KWWWWWWWWWWWWK.",
  "..KKKKKKKKKKKK..",
  ".....KWWWWK.....",
  "....KWWWWWWK....",
  "....KWKKKKWK....",
  "....KWWWWWWK....",
  "....KKKKKKKK....",
  "................",
  "................",
];

const SKILLS: readonly string[] = [
  ".......KK.......",
  "....KKKKKKKK....",
  "...KKWWWWWWKK...",
  "..KKWWWWWWWWKK..",
  "..KWWWWWWWWWWK..",
  ".KKWWWWKKWWWWKK.",
  ".KWWWWK..KWWWWK.",
  "KWWWWK....KWWWWK",
  "KWWWWK....KWWWWK",
  ".KWWWWK..KWWWWK.",
  ".KKWWWWKKWWWWKK.",
  "..KWWWWWWWWWWK..",
  "..KKWWWWWWWWKK..",
  "...KKWWWWWWKK...",
  "....KKKKKKKK....",
  ".......KK.......",
];

const EXPERIENCE: readonly string[] = [
  "................",
  ".....KKKKKK.....",
  "....KKKKKKKK....",
  "..KKKKKKKKKKKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWKKKKKKWWWK.",
  ".KWWWKKKKKKWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
];

const PROJECTS: readonly string[] = [
  "................",
  "..KKKK..........",
  "..KWWK..........",
  "..KWWKKKKKKKKKK.",
  "..KWWWWWWWWWWWWK",
  "..KWWKKWWKKWWWWK",
  "..KWWKKWWKKWWWWK",
  "..KWWKKWWKKWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KKKKKKKKKKKKKK",
  "................",
  "................",
];

const CONTACT: readonly string[] = [
  "................",
  "................",
  "..KKKKKKKKKKKK..",
  ".KKWWWWWWWWWWKK.",
  ".KWKWWWWWWWWKWK.",
  ".KWWKWWWWWWKWWK.",
  ".KWWWKWWWWKWWWK.",
  ".KWWWWKWWKWWWWK.",
  ".KWWWWWKKWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KLLLLLLLLLLLLK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
  "................",
];

const TERMINAL: readonly string[] = [
  "................",
  "..KKKKKKKKKKKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWWKWWWWWWWWWK.",
  ".KWWWKWWWWWWWWK.",
  ".KWWWWKWWWWWWWK.",
  ".KWWWKWWWWWWWWK.",
  ".KWWKWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWKKKKWWK.",
  ".KWWWWWWKKKKWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
  "................",
];

export const desktopIconPixels: Record<DesktopAppId, readonly string[]> = {
  salah: SALAH,
  profile: PROFILE,
  education: EDUCATION,
  skills: SKILLS,
  experience: EXPERIENCE,
  projects: PROJECTS,
  contact: CONTACT,
  terminal: TERMINAL,
};

const rectCache = new Map<DesktopAppId, PixelRect[]>();

/*
  The bitmaps are constant, so the collapsed rectangles are computed once per
  application rather than on every render of the desktop.
*/
export function getDesktopIconRects(id: DesktopAppId) {
  const cached = rectCache.get(id);

  if (cached) return cached;

  const pixels = desktopIconPixels[id];

  if (!pixels) return [];

  const rects = toRects(pixels, PIXEL_COLORS);

  rectCache.set(id, rects);

  return rects;
}
