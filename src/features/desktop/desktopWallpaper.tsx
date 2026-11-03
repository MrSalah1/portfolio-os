/*
  The desktop wallpaper.

  A single decorative layer that paints the red smiley artwork faintly over the
  black desktop. The source image has a pure black background, so screen
  blending leaves only the mark visible and the surrounding black disappears
  into the surface.

  The artwork lives in src/assets so Vite rewrites its URL with the configured
  base path; the published site is a project site served from /portfolio-os/.

  It is decorative, and it sits under the windows and the icons, so it is
  hidden from assistive technology rather than announced as content.
*/

import wallpaperUrl from "../../assets/smiley.png";

export function DesktopWallpaper() {
  return (
    <div
      className="salahos-wallpaper"
      aria-hidden="true"
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
    />
  );
}
