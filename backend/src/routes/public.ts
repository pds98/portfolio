import { Router } from "express";
import { config } from "../config.js";
import { pool } from "../db.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { redis } from "../redis.js";
import { contactSchema, cvOptionsSchema, slugSchema } from "../schemas.js";
import { portfolioCacheKey } from "../services/cache.js";
import { getCvPdf, sendPdf } from "../services/cv.js";
import { findPublicUserId, getPortfolioData } from "../services/portfolio.js";
import { recordVisit } from "../services/visits.js";
import type { PortfolioData } from "../types/portfolio.js";
import { HttpError, asyncHandler } from "../utils/http.js";

/** Routes accessibles SANS authentification (espace public, visiteur / employeur). */
export const publicRouter = Router();

interface CachedPortfolio {
  userId: number; // conservé en cache pour compter les visites, jamais renvoyé au client
  data: PortfolioData;
}

/**
 * GET /api/public/:slug  – RF-10, RF-13
 * Pattern « cache-aside » :
 *   1. on cherche portfolio:{slug} dans Redis -> HIT : réponse immédiate ;
 *   2. MISS : on lit PostgreSQL, on stocke le résultat dans Redis (TTL 5 min) ;
 *   3. toute modification du contenu supprime la clé (services/cache.ts).
 * L'en-tête X-Cache (HIT/MISS) permet de le démontrer pendant la présentation.
 */
publicRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const slug = slugSchema.safeParse(req.params.slug);
    if (!slug.success) throw new HttpError(404, "Portfolio introuvable");
    const key = portfolioCacheKey(slug.data);

    let entry: CachedPortfolio | null = null;
    const cached = await redis.get(key);
    if (cached) {
      entry = JSON.parse(cached) as CachedPortfolio;
      res.setHeader("X-Cache", "HIT");
    } else {
      const userId = await findPublicUserId(slug.data);
      const data = userId === null ? null : await getPortfolioData(userId);
      if (userId === null || !data) throw new HttpError(404, "Portfolio introuvable");
      entry = { userId, data };
      await redis.set(key, JSON.stringify(entry), { EX: config.publicCacheTtlSeconds });
      res.setHeader("X-Cache", "MISS");
    }

    await recordVisit(entry.userId);
    res.json(entry.data);
  }),
);

/** GET /api/public/:slug/cv – téléchargement par un visiteur, si l'étudiant l'autorise (§3). */
publicRouter.get(
  "/:slug/cv",
  asyncHandler(async (req, res) => {
    const slug = slugSchema.safeParse(req.params.slug);
    if (!slug.success) throw new HttpError(404, "Portfolio introuvable");
    const { rows } = await pool.query<{ id: number; allow_cv_download: boolean }>(
      "SELECT id, allow_cv_download FROM users WHERE slug = $1 AND is_public = TRUE",
      [slug.data],
    );
    const user = rows[0];
    if (!user) throw new HttpError(404, "Portfolio introuvable");
    if (!user.allow_cv_download) throw new HttpError(403, "Le téléchargement du CV n'est pas autorisé");

    const options = cvOptionsSchema.parse(req.query);
    sendPdf(res, await getCvPdf(user.id, options));
  }),
);

/** POST /api/public/:slug/contact – bonus : formulaire de contact, 5 messages / heure / IP. */
publicRouter.post(
  "/:slug/contact",
  rateLimit({ prefix: "contact", max: 5, windowSeconds: 60 * 60 }),
  asyncHandler(async (req, res) => {
    const slug = slugSchema.safeParse(req.params.slug);
    if (!slug.success) throw new HttpError(404, "Portfolio introuvable");
    const userId = await findPublicUserId(slug.data);
    if (userId === null) throw new HttpError(404, "Portfolio introuvable");
    const msg = contactSchema.parse(req.body);
    await pool.query(
      "INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)",
      [userId, msg.name, msg.email, msg.subject, msg.message],
    );
    res.status(201).json({ ok: true });
  }),
);
