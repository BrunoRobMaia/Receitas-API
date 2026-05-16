import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",

    include: ["src/**/*.test.ts", "src/**/*.e2e.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/generated/**", "src/types/**"],
    },
  },
});
