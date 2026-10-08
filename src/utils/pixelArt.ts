/*
  Pixel-art renderer shared by the desktop icons and the wallpaper.

  A bitmap is text, one character per pixel, which is how this kind of artwork
  would have been authored on the machine the system imitates. The renderer
  collapses horizontal runs of equal pixels into single rectangles, so a bitmap
  costs a handful of nodes instead of one per pixel.

  The palette is supplied by the caller rather than fixed here, because the
  icons and the wallpaper are deliberately not the same colour scheme. A
  character with no entry in the palette is skipped rather than thrown on: a
  typo should leave a gap, not blank the whole surface.
*/

export type PixelRect = {
  x: number;
  y: number;
  width: number;
  fill: string;
};

export function toRects(
  pixels: readonly string[],
  palette: Readonly<Record<string, string>>,
): PixelRect[] {
  const rects: PixelRect[] = [];

  pixels.forEach((row, y) => {
    let x = 0;

    while (x < row.length) {
      const fill = palette[row[x] as string];

      if (fill === undefined) {
        x += 1;
        continue;
      }

      let width = 1;

      while (x + width < row.length && row[x + width] === row[x]) width += 1;

      rects.push({ x, y, width, fill });
      x += width;
    }
  });

  return rects;
}
