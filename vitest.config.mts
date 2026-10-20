import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    // Logic tests run in plain Node. A component test opts in to a browser-like
    // DOM with a `// @vitest-environment jsdom` comment on its first line.
    environment: "node",
    include: ["lib/**/*.test.{ts,tsx}", "components/**/*.test.tsx", "app/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.{ts,tsx}", "components/launch/**/*.tsx"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "lib/launch/testing/**",
        "lib/launch/types.ts",
        "lib/auth/types.ts",
        "lib/utils.ts",
      ],
      reporter: ["text"],
      thresholds: {
        "lib/**": {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95,
        },
      },
    },
  },
});
