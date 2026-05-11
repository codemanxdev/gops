import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ['test/unit/**/*.test.ts'],
    exclude: ['dist', 'node_modules', 'out', 'scripts', 'coverage'],    
    environment: "node",
    passWithNoTests: true,
  },
});
