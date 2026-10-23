import { pool } from "../db.js";
import { redis } from "../redis.js";

/**
 * Bonus « statistiques de visites » :
 *  - chaque consultation du portfolio fait un INCR atomique dans Redis
 *    (visits:{userId}) : très rapide, aucune écriture SQL par visite ;
 *  - toutes les 60 s, flushVisits() transfère les compteurs dans PostgreSQL
 *    (table portfolio_visits) pour qu'ils survivent à un redémarrage de Redis.
 */
const visitsKey = (userId: number) => `visits:${userId}`;

export async function recordVisit(userId: number): Promise<void> {
  await redis.incr(visitsKey(userId));
}

export async function flushVisits(): Promise<number> {
  let flushed = 0;
  for await (const key of redis.scanIterator({ MATCH: "visits:*", COUNT: 100 })) {
    const userId = Number(key.split(":")[1]);
    // GETDEL : lit et remet à zéro en une seule opération atomique (aucune visite perdue)
    const pending = Number(await redis.getDel(key));
    if (!Number.isInteger(userId) || pending <= 0) continue;
    await pool.query(
      `INSERT INTO portfolio_visits (user_id, total) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
         SET total = portfolio_visits.total + EXCLUDED.total, updated_at = NOW()`,
      [userId, pending],
    );
    flushed += pending;
  }
  return flushed;
}

/** Total = visites déjà persistées + visites encore en attente dans Redis. */
export async function getVisitCount(userId: number): Promise<number> {
  const [{ rows }, pending] = await Promise.all([
    pool.query<{ total: string }>("SELECT total FROM portfolio_visits WHERE user_id = $1", [userId]),
    redis.get(visitsKey(userId)),
  ]);
  return Number(rows[0]?.total ?? 0) + Number(pending ?? 0);
}
