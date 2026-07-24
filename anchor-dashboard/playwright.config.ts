import { defineConfig, devices } from "@playwright/test";

const VISUAL_TEST_PORT = 4174;

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "./test-results/visual",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
      scale: "css",
    },
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${VISUAL_TEST_PORT}`,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    colorScheme: "light",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${VISUAL_TEST_PORT} --strictPort`,
    url: `http://127.0.0.1:${VISUAL_TEST_PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
});
