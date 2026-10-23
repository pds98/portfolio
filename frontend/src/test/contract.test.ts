import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Les types du domaine sont copiés du backend (conteneurs Docker séparés).
 * Ce test garantit que les deux copies restent identiques. Il est ignoré
 * dans le conteneur frontend, où le dossier backend n'est pas présent.
 */
const backendCopy = resolve(__dirname, "../../../backend/src/types/portfolio.ts");
let backend: string | null = null;
try {
  backend = readFileSync(backendCopy, "utf8");
} catch {
  backend = null;
}

describe.skipIf(backend === null)("contrat partagé frontend / backend", () => {
  it("frontend/src/types/portfolio.ts est identique à la version du backend", () => {
    const frontend = readFileSync(resolve(__dirname, "../types/portfolio.ts"), "utf8");
    expect(frontend).toBe(backend);
  });
});
