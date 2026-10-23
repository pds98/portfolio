import { describe, expect, it } from "vitest";
import { changePasswordSchema, loginSchema, registerSchema } from "../src/schemas.js";
import { hashPassword, verifyPassword } from "../src/services/password.js";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  generateToken,
  getSessionUserId,
  type SessionStore,
} from "../src/services/session.js";
import { toSlug } from "../src/services/slug.js";

/** Faux Redis en mémoire : implémente juste ce dont le service de session a besoin. */
class MemoryStore implements SessionStore {
  strings = new Map<string, string>();
  sets = new Map<string, Set<string>>();
  ttl = new Map<string, number>();

  async set(key: string, value: string, options: { EX: number }) {
    this.strings.set(key, value);
    this.ttl.set(key, options.EX);
    return "OK";
  }
  async get(key: string) {
    return this.strings.get(key) ?? null;
  }
  async del(keys: string | string[]) {
    let n = 0;
    for (const k of Array.isArray(keys) ? keys : [keys]) if (this.strings.delete(k)) n++;
    return n;
  }
  async sAdd(key: string, member: string) {
    const set = this.sets.get(key) ?? new Set<string>();
    set.add(member);
    this.sets.set(key, set);
    return 1;
  }
  async sRem(key: string, member: string) {
    return this.sets.get(key)?.delete(member) ? 1 : 0;
  }
  async sMembers(key: string) {
    return [...(this.sets.get(key) ?? [])];
  }
  async expire(key: string, seconds: number) {
    this.ttl.set(key, seconds);
    return true;
  }
}

describe("hachage des mots de passe (RF-01)", () => {
  it("ne stocke jamais le mot de passe en clair et le vérifie correctement", async () => {
    const hash = await hashPassword("Secret123", 4); // coût réduit pour la vitesse des tests
    expect(hash).not.toContain("Secret123");
    expect(hash).toMatch(/^\$2[aby]\$04\$/); // format bcrypt
    expect(await verifyPassword("Secret123", hash)).toBe(true);
    expect(await verifyPassword("secret123", hash)).toBe(false);
  });

  it("produit un hachage différent à chaque appel (sel aléatoire)", async () => {
    expect(await hashPassword("Secret123", 4)).not.toBe(await hashPassword("Secret123", 4));
  });
});

describe("sessions Redis (RF-02)", () => {
  it("génère des jetons longs et uniques", () => {
    const a = generateToken();
    expect(a).toHaveLength(43);
    expect(a).not.toBe(generateToken());
  });

  it("crée une session avec TTL et retrouve l'utilisateur", async () => {
    const store = new MemoryStore();
    const token = await createSession(store, 42, 3600);
    expect(await getSessionUserId(store, token)).toBe(42);
    expect(store.ttl.get(`session:${token}`)).toBe(3600);
    expect(await store.sMembers("user_sessions:42")).toContain(token);
  });

  it("la déconnexion invalide immédiatement le jeton", async () => {
    const store = new MemoryStore();
    const token = await createSession(store, 7, 3600);
    await destroySession(store, token);
    expect(await getSessionUserId(store, token)).toBeNull();
    expect(await store.sMembers("user_sessions:7")).not.toContain(token);
  });

  it("révoque toutes les autres sessions (changement de mot de passe)", async () => {
    const store = new MemoryStore();
    const current = await createSession(store, 1, 3600);
    const other = await createSession(store, 1, 3600);
    await destroyAllSessions(store, 1, current);
    expect(await getSessionUserId(store, current)).toBe(1);
    expect(await getSessionUserId(store, other)).toBeNull();
  });

  it("un jeton inconnu ne donne accès à rien", async () => {
    expect(await getSessionUserId(new MemoryStore(), "inexistant")).toBeNull();
  });
});

describe("validation des entrées d'authentification (Zod)", () => {
  it("accepte une inscription valide et normalise le courriel", () => {
    const r = registerSchema.parse({ email: "  Demba@Example.COM ", password: "Portfolio2026", fullName: "Demba Sow" });
    expect(r.email).toBe("demba@example.com");
  });

  it.each([
    ["court", "Ab1"],
    ["sans chiffre", "abcdefghij"],
    ["sans lettre", "1234567890"],
  ])("refuse un mot de passe %s", (_label, password) => {
    expect(registerSchema.safeParse({ email: "a@b.ca", password, fullName: "Test" }).success).toBe(false);
  });

  it("refuse un courriel invalide", () => {
    expect(loginSchema.safeParse({ email: "pas-un-courriel", password: "x" }).success).toBe(false);
  });

  it("applique les règles de complexité au nouveau mot de passe", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "x", newPassword: "faible" }).success).toBe(false);
  });
});

describe("slug (RF-12)", () => {
  it("produit une URL lisible sans accents", () => {
    expect(toSlug("Demba Sow")).toBe("demba-sow");
    expect(toSlug("Éloïse D'Amour")).toBe("eloise-d-amour");
    expect(toSlug("  --Jean   Paul--  ")).toBe("jean-paul");
  });
});
