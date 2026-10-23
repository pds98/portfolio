import { pool } from "../db.js";
import { redis } from "../redis.js";

/**
 * Clés de cache Redis.
 *  - portfolio:{slug} : JSON du portfolio public (pattern « cache-aside », RF-13)
 *  - cv:{userId}:...  : PDF généré (RF-26) – la version des données fait partie
 *    de la clé, donc toute modification rend automatiquement l'ancien PDF obsolète.
 */
export const portfolioCacheKey = (slug: string) => `portfolio:${slug}`;

/**
 * À appeler après CHAQUE écriture sur le contenu d'un utilisateur :
 *  1. incrémente users.data_version (invalide implicitement les PDF en cache) ;
 *  2. supprime explicitement le cache du portfolio public (invalidation RF-13).
 * `extraSlugs` : anciens slugs à purger aussi (changement d'URL).
 */
export async function invalidateUserContent(userId: number, extraSlugs: string[] = []): Promise<void> {
  const { rows } = await pool.query<{ slug: string }>(
    `UPDATE users SET data_version = data_version + 1, updated_at = NOW()
      WHERE id = $1 RETURNING slug`,
    [userId],
  );
  const slugs = [...extraSlugs, ...rows.map((r) => r.slug)];
  if (slugs.length > 0) await redis.del(slugs.map(portfolioCacheKey));
}

/** Supprime tous les PDF en cache d'un utilisateur (suppression du compte). */
export async function purgeUserCvCache(userId: number): Promise<void> {
  const keys: string[] = [];
  for await (const key of redis.scanIterator({ MATCH: `cv:${userId}:*`, COUNT: 100 })) keys.push(key);
  if (keys.length > 0) await redis.del(keys);
}
