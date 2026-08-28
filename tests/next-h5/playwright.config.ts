/* global process */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: ".test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [
    ...(process.env.CI ? ([["github"]] as const) : []),
    ["list"],
    ["html", { open: "never" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:3020",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] }
    },
    {
      name: "mobile-webkit",
      use: { ...devices["iPhone 13"] }
    }
  ],
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3020",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
