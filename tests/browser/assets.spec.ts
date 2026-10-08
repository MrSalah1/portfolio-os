import { expect, test } from "@playwright/test";
import { bootAndSkip } from "./helpers";

/*
  The site is served from a sub-path, and the failure that produces is a blank
  page rather than an error. A document whose HTML loads fine but whose script
  404s looks completely healthy to a status check and completely broken to a
  visitor, so it is worth asserting directly.

  These read the document's own asset URLs. They pass locally because the
  preview server serves dist/ exactly as Pages would, which is why the suite
  builds before it runs.
*/

const BASE = "/portfolio-os/";

test.describe("the built document", () => {
  test("loads its script and stylesheet from the configured base", async ({ page }) => {
    await bootAndSkip(page);

    /*
      vite preview redirects the site root to the base, so the page is already
      at the sub-path by the time anything is inspected.
    */
    expect(new URL(page.url()).pathname).toBe(BASE);
  });

  test("references every asset under the base, so none of them 404", async ({ page }) => {
    await bootAndSkip(page);

    const urls = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
          "script[src], link[href]",
        ),
      ).map((node) =>
        node instanceof HTMLScriptElement ? node.src : (node as HTMLLinkElement).href,
      ),
    );

    expect(urls.length).toBeGreaterThan(0);

    for (const url of urls) {
      expect(new URL(url).pathname, `asset outside the base: ${url}`).toMatch(
        new RegExp(`^${BASE}`),
      );
    }
  });

  test("serves the favicon from the base too", async ({ page }) => {
    const response = await page.request.get(`${BASE}favicon.svg`);

    expect(response.status()).toBe(200);
  });
});
