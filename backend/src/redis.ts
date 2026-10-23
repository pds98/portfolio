import { createClient } from "redis";
import { config } from "./config.js";

/**
 * Client Redis unique pour toute l'application. Redis sert à trois choses :
 *  1. les sessions          -> session:{token}, user_sessions:{userId}
 *  2. le cache              -> portfolio:{slug}, cv:{userId}:{template}:v{version}:{hash}
 *  3. la limitation du débit -> ratelimit:{prefix}:{ip}
 *  (+ bonus) les visites     -> visits:{userId}
 */
export const redis = createClient({ url: config.redisUrl });

redis.on("error", (err) => console.error("Redis error:", err));

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) await redis.connect();
}

export type RedisClient = typeof redis;
