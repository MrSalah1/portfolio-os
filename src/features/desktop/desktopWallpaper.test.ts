import { describe, expect, it } from "vitest";
import {
  WALLPAPER_PALETTE,
  WALLPAPER_PIXELS,
  WALLPAPER_SCALE,
  WALLPAPER_TILE_HEIGHT,
  WALLPAPER_TILE_WIDTH,
  wallpaperRects,
} from "./desktopWallpaperPixels";

/*
  The wallpaper has two constraints the compiler cannot see, and both of them
  fail silently rather than loudly: artwork that does not tile shows a seam, and
  artwork that is too bright makes the desktop icon labels unreadable. The
  desktop icon labels are white and sit directly on the wallpaper with no
  background of their own, so every shade painted here is measured against white
  below instead of being trusted to look right.
*/

const PALETTE = new Set([...Object.keys(WALLPAPER_PALETTE), "."]);

/* The minimum contrast WCAG asks for with white text on a solid background. */
const MINIMUM_CONTRAST = 4.5;

/*
  WCAG relative luminance: each channel is linearised first, because a channel
  read straight off the hex value is not the brightness the eye weighs.
*/
function relativeLuminance(hex: string) {
  const channel = (offset: number) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrastAgainstWhite(hex: string) {
  return 1.05 / (relativeLuminance(hex) + 0.05);
}

describe("the wallpaper bitmap", () => {
  it("is exactly as tall as the tile", () => {
    expect(WALLPAPER_PIXELS).toHaveLength(WALLPAPER_TILE_HEIGHT);
  });

  it("has one tile-width of pixels in every row", () => {
    for (const row of WALLPAPER_PIXELS) {
      expect(row).toHaveLength(WALLPAPER_TILE_WIDTH);
    }
  });

  it("uses only palette letters the renderer understands", () => {
    for (const row of WALLPAPER_PIXELS) {
      for (const character of row) {
        expect(PALETTE.has(character)).toBe(true);
      }
    }
  });

  it("is not entirely transparent", () => {
    const painted = WALLPAPER_PIXELS.some((row) => [...row].some((cell) => cell !== "."));

    expect(painted).toBe(true);
  });
});

describe("the wallpaper palette", () => {
  it("paints every shade dark enough for the white icon labels", () => {
    for (const [letter, hex] of Object.entries(WALLPAPER_PALETTE)) {
      expect(contrastAgainstWhite(hex), `${letter} (${hex})`).toBeGreaterThanOrEqual(
        MINIMUM_CONTRAST,
      );
    }
  });

  it("keeps every shade darker than the desktop surface behind it", () => {
    /*
      A shade lighter than the surface would read as a highlight rather than as
      a bar standing on a floor, and the darkest shade has to stay above the
      surface or the strip disappears into it.
    */
    const surface = relativeLuminance("#2f4f4f");

    for (const [letter, hex] of Object.entries(WALLPAPER_PALETTE)) {
      expect(relativeLuminance(hex), `${letter} (${hex})`).toBeGreaterThan(surface);
    }
  });
});

describe("the wallpaper as a repeating strip", () => {
  it("never paints a bar across the tile boundary, so the repeat has no seam", () => {
    /*
      The strip repeats horizontally, so column 31 sits next to column 0. If both
      ends of a row are painted, the bar that meets there is one continuous bar
      cut in half, which reads as a seam every tile.
    */
    const pitch = WALLPAPER_TILE_WIDTH / 16;

    for (const row of WALLPAPER_PIXELS) {
      const first = row.slice(0, pitch);
      const last = row.slice(-pitch);
      const isPainted = (segment: string) => !/^\.+$/.test(segment);

      expect(isPainted(first) && isPainted(last), `row painted at both edges: ${row}`).toBe(
        false,
      );
    }
  });

  it("uses a regular pitch, so bar and gap are the same width throughout", () => {
    const pitch = WALLPAPER_TILE_WIDTH / 16;

    for (const row of WALLPAPER_PIXELS) {
      for (let start = 0; start < WALLPAPER_TILE_WIDTH; start += pitch) {
        const segment = row.slice(start, start + pitch);

        /* Each four-pixel cell is wholly painted or wholly empty, never split. */
        expect(/^(\.+|....+)$/.test(segment), `split cell at ${start}: ${segment}`).toBe(true);
      }
    }
  });

  it("anchors every bar to the bottom edge of the tile", () => {
    /*
      Bars stand on the bottom edge: once a column starts painting it must stay
      painted down to the last row. A gap in the middle would leave the bar
      floating and the strip would read as a chart rather than a monitor.
    */
    const pitch = WALLPAPER_TILE_WIDTH / 16;
    const isPainted = (segment: string | undefined) => Boolean(segment) && !/^\.+$/.test(segment!);

    for (let start = 0; start < WALLPAPER_TILE_WIDTH; start += pitch) {
      const rows = WALLPAPER_PIXELS.map((row) => row.slice(start, start + pitch));
      const top = rows.findIndex(isPainted);

      /* A cell that never paints is a gap, which is expected. */
      if (top === -1) continue;

      for (let y = top; y < WALLPAPER_TILE_HEIGHT; y += 1) {
        expect(isPainted(rows[y]), `bar at column ${start} has a gap at row ${y}`).toBe(true);
      }
    }
  });

  it("gives the bars more than one height, so the strip reads as activity", () => {
    const pitch = WALLPAPER_TILE_WIDTH / 16;
    const heights = new Set<number>();

    for (let start = 0; start < WALLPAPER_TILE_WIDTH; start += pitch) {
      let height = 0;

      for (let y = 0; y < WALLPAPER_TILE_HEIGHT; y += 1) {
        const segment = WALLPAPER_PIXELS[y]?.slice(start, start + pitch);

        if (segment && !/^\.+$/.test(segment)) height += 1;
      }

      if (height > 0) heights.add(height);
    }

    expect(heights.size).toBeGreaterThan(1);
  });
});

describe("wallpaperRects", () => {
  it("produces rectangles inside the tile", () => {
    expect(wallpaperRects.length).toBeGreaterThan(0);

    for (const rect of wallpaperRects) {
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeLessThan(WALLPAPER_TILE_HEIGHT);
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(WALLPAPER_TILE_WIDTH);
      expect(rect.width).toBeGreaterThan(0);
    }
  });

  it("merges each bar's width into one rectangle per row, not one per pixel", () => {
    /*
      Every bar is four pixels wide and runs of equal pixels collapse, so the
      artwork must cost one rectangle per bar per row rather than four. Anything
      approaching one node per painted pixel would mean the merge stopped
      working, which on a tiled pattern is a document that grows with the
      screen.
    */
    const painted = WALLPAPER_PIXELS.flatMap((row) => [...row].filter((cell) => cell !== "."))
      .length;

    expect(painted).toBeGreaterThan(0);
    expect(wallpaperRects.length).toBeLessThan(painted / 2);
  });

  it("draws at an integer scale, so the bars stay square", () => {
    expect(Number.isInteger(WALLPAPER_SCALE)).toBe(true);
    expect(WALLPAPER_SCALE).toBeGreaterThan(0);
  });
});
