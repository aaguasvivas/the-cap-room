import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    include: [
      "engine/__tests__/**/*.test.ts",
      "lib/**/__tests__/**/*.test.ts",
    ],
    environment: "node",
  },
});
