import pg from "pg";
import { config } from "./config.js";

/**
 * Par défaut, node-postgres convertit une colonne DATE en objet Date JavaScript
 * à minuit *heure locale*, ce qui peut décaler la date d'un jour selon le fuseau.
 * On garde donc la chaîne brute « AAAA-MM-JJ » renvoyée par PostgreSQL (OID 1082).
 */
pg.types.setTypeParser(1082, (value: string) => value);

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

/**
 * Exécute `fn` dans une transaction : COMMIT si tout réussit, ROLLBACK sinon.
 * Utilisé pour les opérations multi-requêtes (inscription, réordonnancement…).
 */
export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
