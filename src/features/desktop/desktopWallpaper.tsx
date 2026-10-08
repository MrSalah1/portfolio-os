/*
  The desktop wallpaper: a flat surface with a strip of activity bars along the
  bottom edge, drawn as pixel art and painted the same way the icons are.

  Why it is two pieces rather than one tiling pattern: the artwork repeats
  horizontally only. A square pattern would repeat on both axes, which puts a
  row of bars every tile-height down the screen as horizontal banding rather
  than one monitor trace along the bottom. So the flat colour comes from the
  desktop's own background, and this component supplies only the strip.

  The strip is drawn once into an SVG pattern and repeated by the browser, so
  the number of nodes in the document is the same on a phone and on a wide
  monitor. The bitmap and its palette live in desktopWallpaperPixels.ts.
*/

import {
  WALLPAPER_SCALE,
  WALLPAPER_TILE_HEIGHT,
  WALLPAPER_TILE_WIDTH,
  wallpaperRects,
} from "./desktopWallpaperPixels";

const TILE_CSS_WIDTH = WALLPAPER_TILE_WIDTH * WALLPAPER_SCALE;
const TILE_CSS_HEIGHT = WALLPAPER_TILE_HEIGHT * WALLPAPER_SCALE;

/*
  Decorative, and it sits under the windows and the icons, so it is hidden from
  assistive technology rather than announced as content.
*/
export function DesktopWallpaper() {
  return (
    <div className="salahos-wallpaper" aria-hidden="true">
      <svg
        className="salahos-wallpaper-strip"
        width="100%"
        height={TILE_CSS_HEIGHT}
        shapeRendering="crispEdges"
      >
        <defs>
          <pattern
            id="salahos-activity-bars"
            width={TILE_CSS_WIDTH}
            height={TILE_CSS_HEIGHT}
            patternUnits="userSpaceOnUse"
          >
            {wallpaperRects.map((rect) => (
              <rect
                key={`${rect.y}-${rect.x}-${rect.width}`}
                x={rect.x * WALLPAPER_SCALE}
                y={rect.y * WALLPAPER_SCALE}
                width={rect.width * WALLPAPER_SCALE}
                height={WALLPAPER_SCALE}
                fill={rect.fill}
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height={TILE_CSS_HEIGHT} fill="url(#salahos-activity-bars)" />
      </svg>
    </div>
  );
}
