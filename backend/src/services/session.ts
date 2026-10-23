import { randomBytes } from "node:crypto";

/**
 * Gestion des sessions dans Redis (RF-02).
 *
 * Choix : un jeton opaque aléatoire (256 bits) envoyé dans un cookie httpOnly,
 * plutôt qu'un JWT. Avantages :
 *  - la déconnexion est immédiate et réelle (on supprime la clé Redis) ;
 *  - on peut révoquer toutes les sessions d'un utilisateur (changement de mot
 *    de passe, suppression du compte) ;
 *  - aucune donnée sensible n'est lisible côté client.
 *
 * Clés Redis :
 *   session:{token}        -> userId          (TTL = durée de session)
 *   user_sessions:{userId} -> SET de jetons   (pour la révocation globale)
 */

/** Sous-ensemble des commandes Redis utilisées : facilite les tests (faux Redis). */
export interface SessionStore {
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(keys: string | string[]): Promise<number>;
  sAdd(key: string, member: string): Promise<number>;
  sRem(key: string, member: string): Promise<number>;
  sMembers(key: string): Promise<string[]>;
  expire(key: string, seconds: number): Promise<unknown>;
}

const sessionKey = (token: string) => `session:${token}`;
const userSessionsKey = (userId: number) => `user_sessions:${userId}`;

/** Jeton de 32 octets aléatoires encodé en base64url (43 caractères). */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(store: SessionStore, userId: number, ttlSeconds: number): Promise<string> {
  const token = generateToken();
  await store.set(sessionKey(token), String(userId), { EX: ttlSeconds });
  await store.sAdd(userSessionsKey(userId), token);
  await store.expire(userSessionsKey(userId), ttlSeconds);
  return token;
}

/** Renvoie l'id de l'utilisateur associé au jeton, ou null si expiré / inconnu. */
export async function getSessionUserId(store: SessionStore, token: string): Promise<number | null> {
  const value = await store.get(sessionKey(token));
  if (!value) return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function destroySession(store: SessionStore, token: string): Promise<void> {
  const userId = await getSessionUserId(store, token);
  await store.del(sessionKey(token));
  if (userId !== null) await store.sRem(userSessionsKey(userId), token);
}

/** Révoque toutes les sessions d'un utilisateur, sauf éventuellement `keepToken`. */
export async function destroyAllSessions(store: SessionStore, userId: number, keepToken?: string): Promise<void> {
  const tokens = await store.sMembers(userSessionsKey(userId));
  const toDelete = tokens.filter((t) => t !== keepToken);
  if (toDelete.length > 0) {
    await store.del(toDelete.map(sessionKey));
    for (const t of toDelete) await store.sRem(userSessionsKey(userId), t);
  }
}
