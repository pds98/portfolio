/**
 * Configuration centralisée, lue une seule fois depuis les variables
 * d'environnement (aucun secret n'est codé en dur – cf. §12 du cahier des charges).
 */
const env = process.env;

export const config = {
  nodeEnv: env.NODE_ENV ?? "development",
  port: Number(env.PORT ?? 3000),
  databaseUrl: env.DATABASE_URL ?? "postgres://portfolio:portfolio@localhost:5432/portfolio",
  redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
  corsOrigin: env.CORS_ORIGIN ?? "http://localhost:5173",

  /** Durée de vie d'une session (secondes) : 7 jours. */
  sessionTtlSeconds: Number(env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7),
  /** Cookie « Secure » uniquement en production (HTTPS). */
  cookieSecure: env.NODE_ENV === "production",

  /** Durée de vie du cache du portfolio public (secondes). */
  publicCacheTtlSeconds: Number(env.PUBLIC_CACHE_TTL_SECONDS ?? 60 * 5),
  /** Durée de vie d'un PDF en cache (secondes) : 24 h. */
  cvCacheTtlSeconds: Number(env.CV_CACHE_TTL_SECONDS ?? 60 * 60 * 24),

  /** Chemin de Chromium utilisé par Puppeteer (installé dans l'image Docker). */
  chromiumPath: env.PUPPETEER_EXECUTABLE_PATH ?? "/usr/bin/chromium-browser",

  /** Coût bcrypt : 12 ≈ 250 ms par hachage, bon compromis sécurité / latence. */
  bcryptRounds: Number(env.BCRYPT_ROUNDS ?? 12),
} as const;
