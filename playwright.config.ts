import { defineConfig, devices } from "@playwright/test";

/*
  The browser suite runs against the real production build served by
  `vite preview`, not the dev server, so what is tested is the artefact that
  would actually be deployed.
*/
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],

  webServer: {
    /*
      The host is pinned rather than left as "localhost": on Windows,
      localhost can resolve to ::1 only, which leaves vite preview listening
      on IPv6 while Playwright polls 127.0.0.1 and times out.
    */
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
