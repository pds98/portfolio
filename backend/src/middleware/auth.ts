import type { CookieOptions, RequestHandler } from "express";
import { config } from "../config.js";
import { redis } from "../redis.js";
import { getSessionUserId } from "../services/session.js";

export const SESSION_COOKIE = "sid";

/**
 * Options du cookie de session :
 *  - httpOnly : inaccessible au JavaScript du navigateur (protège contre le vol par XSS) ;
 *  - sameSite « lax » : non envoyé par les formulaires d'autres sites (atténue le CSRF).
 *    localhost:5173 et localhost:3000 sont le même « site » : le cookie circule bien ;
 *  - secure en production (HTTPS uniquement).
 */
export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    maxAge: config.sessionTtlSeconds * 1000,
    path: "/",
  };
}

/**
 * Protège une route : lit le cookie, vérifie la session dans Redis et place
 * `req.userId`. Répond 401 si la session est absente ou expirée.
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    res.status(401).json({ error: "Authentification requise" });
    return;
  }
  getSessionUserId(redis, token)
    .then((userId) => {
      if (userId === null) {
        res.clearCookie(SESSION_COOKIE, { path: "/" });
        res.status(401).json({ error: "Session expirée" });
        return;
      }
      req.userId = userId;
      req.sessionToken = token;
      next();
    })
    .catch(next);
};

/** Récupère l'id utilisateur posé par requireAuth (garantit le type number). */
export function currentUserId(req: { userId?: number }): number {
  if (req.userId === undefined) throw new Error("requireAuth manquant sur cette route");
  return req.userId;
}
