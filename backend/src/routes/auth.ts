import { Router } from "express";
import { config } from "../config.js";
import { pool, withTransaction } from "../db.js";
import { SESSION_COOKIE, currentUserId, requireAuth, sessionCookieOptions } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { redis } from "../redis.js";
import { changePasswordSchema, deleteAccountSchema, loginSchema, registerSchema } from "../schemas.js";
import { portfolioCacheKey, purgeUserCvCache } from "../services/cache.js";
import { hashPassword, verifyPassword } from "../services/password.js";
import { createSession, destroyAllSessions, destroySession } from "../services/session.js";
import { slugify } from "../services/slug.js";
import type { CurrentUser } from "../types/portfolio.js";
import { HttpError, asyncHandler } from "../utils/http.js";

export const authRouter = Router();

/** 10 tentatives par IP et par tranche de 15 min sur les routes sensibles. */
const authLimiter = rateLimit({ prefix: "auth", max: 10, windowSeconds: 15 * 60 });

async function loadCurrentUser(userId: number): Promise<CurrentUser | null> {
  const { rows } = await pool.query<CurrentUser>(
    `SELECT u.id, u.email, u.slug, u.is_public AS "isPublic", COALESCE(p.full_name, '') AS "fullName"
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

async function openSession(res: import("express").Response, userId: number): Promise<void> {
  const token = await createSession(redis, userId, config.sessionTtlSeconds);
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
}

// ------------------------------------------------------------------ RF-01
authRouter.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);

    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [input.email]);
    if (existing.rowCount) throw new HttpError(409, "Un compte existe déjà avec ce courriel");

    const passwordHash = await hashPassword(input.password);

    // Création de l'utilisateur ET de son profil dans une même transaction
    const userId = await withTransaction(async (client) => {
      const slug = await slugify(input.fullName, client);
      const { rows } = await client.query<{ id: number }>(
        "INSERT INTO users (email, password_hash, slug) VALUES ($1, $2, $3) RETURNING id",
        [input.email, passwordHash, slug],
      );
      const id = rows[0]!.id;
      await client.query("INSERT INTO profiles (user_id, full_name, email) VALUES ($1, $2, $3)", [
        id,
        input.fullName,
        input.email,
      ]);
      return id;
    });

    await openSession(res, userId);
    res.status(201).json({ user: await loadCurrentUser(userId) });
  }),
);

// ------------------------------------------------------------------ RF-02
authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { rows } = await pool.query<{ id: number; password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [email],
    );
    const user = rows[0];
    // Même message que le compte existe ou non : on ne révèle pas les courriels inscrits
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new HttpError(401, "Courriel ou mot de passe incorrect");
    }
    await openSession(res, user.id);
    res.json({ user: await loadCurrentUser(user.id) });
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token === "string" && token) await destroySession(redis, token);
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.status(204).end();
  }),
);

/** Utilisateur courant : permet au frontend de restaurer la session au rechargement. */
authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await loadCurrentUser(currentUserId(req));
    if (!user) throw new HttpError(401, "Compte introuvable");
    res.json({ user });
  }),
);

// ------------------------------------------------------------------ RF-03
authRouter.put(
  "/password",
  requireAuth,
  authLimiter,
  asyncHandler(async (req, res) => {
    const userId = currentUserId(req);
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const { rows } = await pool.query<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = $1", [
      userId,
    ]);
    if (!rows[0] || !(await verifyPassword(currentPassword, rows[0].password_hash))) {
      throw new HttpError(400, "Mot de passe actuel incorrect");
    }
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [
      await hashPassword(newPassword),
      userId,
    ]);
    // Sécurité : on déconnecte toutes les AUTRES sessions (autres appareils)
    await destroyAllSessions(redis, userId, req.sessionToken);
    res.status(204).end();
  }),
);

// ------------------------------------------------------------------ RF-04
authRouter.delete(
  "/account",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = currentUserId(req);
    const { password } = deleteAccountSchema.parse(req.body);
    const { rows } = await pool.query<{ password_hash: string; slug: string }>(
      "SELECT password_hash, slug FROM users WHERE id = $1",
      [userId],
    );
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new HttpError(400, "Mot de passe incorrect");
    }
    // ON DELETE CASCADE supprime profil, expériences, formations, compétences, projets…
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    // … et on nettoie Redis : sessions, cache public, PDF, compteur de visites
    await destroyAllSessions(redis, userId);
    await redis.del([portfolioCacheKey(user.slug), `visits:${userId}`]);
    await purgeUserCvCache(userId);
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.status(204).end();
  }),
);
