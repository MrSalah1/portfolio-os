import { expect, test, type Page } from "@playwright/test";
import { bootAndSkip, desktop, desktopIcon, settledBox, windowByTitle } from "./helpers";

/*
  The wallpaper is the one part of the desktop that is decorative, which makes
  it the easiest thing in the system to break by accident: a positioned layer
  that swallows a click, or paints over a window, would not fail any existing
  test. These cover the placement, the layering and the pass-through.
*/

function wallpaper(page: Page) {
  return page.locator(".salahos-wallpaper");
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
  test("paints the smiley artwork across the whole surface", async ({ page }) => {
    await bootAndSkip(page);

    const surface = await desktop(page).boundingBox();
    const layer = await wallpaper(page).boundingBox();

    expect(surface).not.toBeNull();
    expect(layer).not.toBeNull();
    if (!surface || !layer) return;

    /* Covers the desktop edge to edge, so the mark is not boxed in. */
    expect(layer.x).toBeCloseTo(surface.x, 0);
    expect(layer.y).toBeCloseTo(surface.y, 0);
    expect(layer.width).toBeCloseTo(surface.width, 0);
    expect(layer.height).toBeCloseTo(surface.height, 0);

    /*
      The artwork is a build asset imported from src/assets, so its URL must
      resolve under the configured base rather than from the domain root.
    */
    const background = await wallpaper(page).evaluate(
      (node) => getComputedStyle(node).backgroundImage,
    );

    expect(background).toContain("smiley");
    expect(background).not.toContain("url(\"/smiley");
  });

  test("takes no pointer events, so it cannot intercept a desktop click", async ({ page }) => {
    await bootAndSkip(page);

    const events = await wallpaper(page).evaluate((node) => getComputedStyle(node).pointerEvents);

    expect(events).toBe("none");
  });

  test("leaves the desktop itself reachable over the artwork", async ({ page }) => {
    await bootAndSkip(page);

    const surface = await desktop(page).boundingBox();

    expect(surface).not.toBeNull();
    if (!surface) return;

    /*
      Pointed at bare wallpaper: no icon and no window here, so the desktop
      itself must receive the hit. Anything else means the layer is sitting in
      front of the surface.
    */
    const x = surface.x + surface.width / 2;
    const y = surface.y + surface.height / 2;

    expect(await ownerAt(page, x, y)).toBe(".salahos-desktop");
  });

  test("lets an open window paint above the artwork", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Salah.exe").click();

    const frame = await settledBox(windowByTitle(page, "Salah.exe"));

    expect(frame).not.toBeNull();
    if (!frame) return;

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

    await expect(wallpaper(page)).toHaveAttribute("aria-hidden", "true");
  });
});
