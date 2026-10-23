import type { RequestHandler } from "express";
import { redis } from "../redis.js";

/**
 * Limitation du débit par adresse IP, à fenêtre fixe, stockée dans Redis.
 *   ratelimit:{prefix}:{ip} -> compteur (INCR), expirant après `windowSeconds`.
 * Le compteur est partagé entre toutes les instances de l'API (contrairement
 * à un compteur en mémoire), ce qui justifie l'usage de Redis.
 *
 * `failuresOnly` : seules les requêtes en échec (code >= 400) consomment le
 * quota. Idéal pour la connexion : on freine la force brute sans bloquer un
 * utilisateur légitime qui se connecte plusieurs fois.
 */
interface RateLimitOptions {
  prefix: string;
  max: number;
  windowSeconds: number;
  failuresOnly?: boolean;
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
  return (req, res, next) => {
    const key = `ratelimit:${options.prefix}:${req.ip ?? "unknown"}`;
    redis
      .multi()
      .incr(key)
      .expire(key, options.windowSeconds, "NX") // ne fixe le TTL qu'à la 1re requête
      .exec()
      .then((results) => {
        const count = Number(results[0]);
        res.setHeader("X-RateLimit-Limit", options.max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - count));
        if (count > options.max) {
          res.status(429).json({ error: "Trop de requêtes, réessayez plus tard" });
          return;
        }
        if (options.failuresOnly) {
          // Requête réussie : on « rend » l'unité consommée
          res.on("finish", () => {
            if (res.statusCode < 400) redis.decr(key).catch(() => undefined);
          });
        }
        next();
      })
      .catch(next);
  };
}
