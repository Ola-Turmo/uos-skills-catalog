import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    target: "node22",
  },
});
