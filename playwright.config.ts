import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
const password = process.env.E2E_PASSWORD || randomBytes(24).toString("hex");
process.env.E2E_PASSWORD = password;
export default defineConfig({
  testDir: "e2e",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3001",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run dev -- --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: false,
    env: {
      ADMIN_PASSWORD: password,
      SESSION_SECRET: randomBytes(32).toString("hex"),
      DATA_PATH: ".data/e2e-" + Date.now() + ".sqlite",
    },
    timeout: 120000,
  },
});
