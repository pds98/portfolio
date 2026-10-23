import type { RequestHandler } from "express";
import { redis } from "../redis.js";

/**
 * Limitation du débit par adresse IP, à fenêtre fixe, stockée dans Redis.
 *   ratelimit:{prefix}:{ip} -> compteur (INCR), expirant après `windowSeconds`.
 * Le compteur est partagé entre toutes les instances de l'API (contrairement
 * à un compteur en mémoire), ce qui justifie l'usage de Redis.
 */
export function rateLimit(options: { prefix: string; max: number; windowSeconds: number }): RequestHandler {
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
        next();
      })
      .catch(next);
  };
}
