import { expect, test, type Page } from "@playwright/test";
import { bootAndSkip, desktop, desktopIcon, settledBox, windowByTitle } from "./helpers";

/*
  The wallpaper is the one part of the desktop that is decorative, which makes
  it the easiest thing in the system to break by accident: a positioned layer
  that swallows a click, or paints over a window, would not fail any existing
  test. These cover the placement, the layering and the pass-through.

  The bitmap itself is checked in desktopWallpaper.test.ts. What is left to see
  with a real browser is whether it lands where it is supposed to.
*/

const STRIP_HEIGHT = 64;

function strip(page: Page) {
  return page.locator(".salahos-wallpaper-strip");
}

/*
  What owns the point, not what the element happens to be called. The topmost
  node inside a window is usually an unclassed paragraph, so asking for a
  className would test the content rather than the layering.
*/
const OWNERS = [".salahos-window", ".salahos-wallpaper", ".salahos-desktop"];

async function ownerAt(page: Page, x: number, y: number) {
  return page.evaluate(
    ([px, py, selectors]) => {
      const node = document.elementFromPoint(px as number, py as number);

      if (!node) return null;

      for (const selector of selectors as string[]) {
        if (node.closest(selector)) return selector;
      }

      return null;
    },
    [x, y, OWNERS],
  );
}

test.describe("the wallpaper", () => {
  test("paints a strip along the bottom of the surface", async ({ page }) => {
    await bootAndSkip(page);

    const surface = await desktop(page).boundingBox();
    const band = await strip(page).boundingBox();

    expect(surface).not.toBeNull();
    expect(band).not.toBeNull();
    if (!surface || !band) return;

    /* Sits on the bottom edge rather than floating in the middle of the desktop. */
    expect(band.y + band.height).toBeGreaterThanOrEqual(surface.y + surface.height - 1);

    /* Spans the full width, so the repeat has no gap to show at either end. */
    expect(band.x).toBeLessThanOrEqual(surface.x + 1);
    expect(band.x + band.width).toBeGreaterThanOrEqual(surface.x + surface.width - 1);

    /* One tile at 2x, so the bars keep their square proportions. */
    expect(Math.round(band.height)).toBe(STRIP_HEIGHT);
  });

  test("takes no pointer events, so it cannot intercept a desktop click", async ({ page }) => {
    await bootAndSkip(page);

    const events = await page
      .locator(".salahos-wallpaper")
      .evaluate((node) => getComputedStyle(node).pointerEvents);

    expect(events).toBe("none");
  });

  test("leaves the desktop itself reachable over the strip", async ({ page }) => {
    await bootAndSkip(page);

    const surface = await desktop(page).boundingBox();
    const band = await strip(page).boundingBox();

    expect(surface).not.toBeNull();
    expect(band).not.toBeNull();
    if (!surface || !band) return;

    /*
      Pointed at bare wallpaper: no icon and no window here, so the desktop
      itself must receive the hit. Anything else means the strip is sitting in
      front of the surface.
    */
    const x = surface.x + surface.width / 2;
    const y = band.y + band.height / 2;

    expect(await ownerAt(page, x, y)).toBe(".salahos-desktop");
  });

  test("lets an open window paint above the strip", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Salah.exe").click();

    const frame = await settledBox(windowByTitle(page, "Salah.exe"));
    const surface = await desktop(page).boundingBox();
    const band = await strip(page).boundingBox();

    expect(frame).not.toBeNull();
    expect(surface).not.toBeNull();
    expect(band).not.toBeNull();
    if (!frame || !surface || !band) return;

    /*
      The window is seated in the upper part of the desktop, so the strip sits
      below it and the two never overlap. This asserts the window owns the hit
      where the window is, which is the property that matters: if the wallpaper
      ever gained a higher stacking order, the surface behind a window is
      exactly what would start swallowing clicks.
    */
    const x = frame.x + frame.width / 2;
    const y = frame.y + frame.height / 2;

    expect(await ownerAt(page, x, y)).toBe(".salahos-window");
  });

  test("stays inside the surface, so the page cannot scroll sideways", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const noOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth <= root.clientWidth + 1;
    });

    expect(noOverflow).toBe(true);
  });

  test("is hidden from assistive technology", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".salahos-wallpaper")).toHaveAttribute("aria-hidden", "true");
  });
});
