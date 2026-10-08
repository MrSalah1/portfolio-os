/*
  Wallpaper artwork, as data.

  Kept separate from the component for the same reason the icons are: a module
  that exports both a component and plain values breaks React Fast Refresh. This
  holds the palette, the bitmap and the collapsed rectangles; desktopWallpaper.tsx
  holds the component that paints them.
*/

import { toRects } from "../../utils/pixelArt";

/*
  Four shades on top of the surface, plus "." for unpainted. Every one of them
  is dark enough to keep the white desktop icon labels readable, which is the
  hard constraint on this artwork: the labels sit directly on the wallpaper
  with no background of their own. desktopWallpaper.test.ts asserts the 4.5:1
  floor rather than trusting these values, so a future shade cannot quietly
  break legibility.
*/
export const WALLPAPER_PALETTE: Record<string, string> = {
  "1": "#3d5f5f",
  "2": "#3e7370",
  "3": "#527a7a",
};

/*
  A 64x32 tile holding eight bars on an eight-pixel pitch: four pixels of bar,
  four of gap. The pitch divides the tile exactly and the last four columns are
  gap, so the left edge continues into the right one and a repeated strip has no
  seam and no bar cut in half at the boundary.

    columns  0-3  height 20, shade 2     columns 32-35  height 17, shade 2
    columns  8-11  height 13, shade 1     columns 40-43  height 23, shade 2
    columns 16-19  height 27, shade 3     columns 48-51  height 11, shade 1
    columns 24-27  height  9, shade 1     columns 56-59  height 25, shade 3

  Heights are counted up from row 31, the bottom edge the bars stand on, so
  every bar is one unbroken run from the floor. The tallest bars carry the
  brightest shade, which is what makes the strip read as activity rather than as
  decoration.

  The tile is twice as wide as it is tall on purpose. Any repeating artwork has
  a period, and at four bars the tall bar pulsed once every 64 pixels, which the
  eye locked onto immediately. Eight bars double the period to 128 pixels while
  leaving the bar width and the on-screen density exactly as they were, so the
  strip still carries about eighty bars across a wide desktop but no longer reads
  as a beat.

  Rows are listed top to bottom, and rows 0 to 4 are empty above the tallest
  bar.
*/
export const WALLPAPER_PIXELS: readonly string[] = [
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................3333............................................",
  "................3333............................................",
  "................3333....................................3333....",
  "................3333....................................3333....",
  "................3333....................2222............3333....",
  "................3333....................2222............3333....",
  "................3333....................2222............3333....",
  "2222............3333....................2222............3333....",
  "2222............3333....................2222............3333....",
  "2222............3333....................2222............3333....",
  "2222............3333............2222....2222............3333....",
  "2222............3333............2222....2222............3333....",
  "2222............3333............2222....2222............3333....",
  "2222............3333............2222....2222............3333....",
  "2222....1111....3333............2222....2222............3333....",
  "2222....1111....3333............2222....2222............3333....",
  "2222....1111....3333............2222....2222....1111....3333....",
  "2222....1111....3333............2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
  "2222....1111....3333....1111....2222....2222....1111....3333....",
];

/*
  The tile is drawn at twice its size in CSS pixels, matching how the icons are
  drawn at 2x from a sixteen-pixel map. The pattern is wider than it is tall, so
  width and height are separate rather than one square figure.
*/
export const WALLPAPER_TILE_WIDTH = 64;
export const WALLPAPER_TILE_HEIGHT = 32;
export const WALLPAPER_SCALE = 2;

/*
  Computed once at module load rather than per render: the bitmap is constant,
  exactly as the icon rectangles are.
*/
export const wallpaperRects = toRects(WALLPAPER_PIXELS, WALLPAPER_PALETTE);
