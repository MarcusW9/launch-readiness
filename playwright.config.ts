import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.E2E_BASE_URL;
const localPort = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${localPort}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Point E2E_BASE_URL at a running server (for example the dev server) to skip the build.
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `pnpm build && pnpm start -p ${localPort}`,
        url: `http://localhost:${localPort}`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
      },
});
