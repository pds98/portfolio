import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 20_000,
    // Les tests d'intégration partagent la même base : exécution séquentielle
    fileParallelism: false,
    coverage: { include: ["src/**/*.ts"], reporter: ["text", "html"] },
  },
});
