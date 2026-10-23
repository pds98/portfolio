import { Router } from "express";
import { pool } from "../db.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { profileSchema, settingsSchema } from "../schemas.js";
import { invalidateUserContent } from "../services/cache.js";
import { getPortfolioData } from "../services/portfolio.js";
import { HttpError, asyncHandler } from "../utils/http.js";

/** GET/PUT /api/profile  +  PUT /api/profile/settings (slug, public/privé, CV). */
export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await getPortfolioData(currentUserId(req));
    if (!data) throw new HttpError(404, "Profil introuvable");
    res.json({ profile: data.profile, settings: data.settings });
  }),
);

profileRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const userId = currentUserId(req);
    const p = profileSchema.parse(req.body);
    // UPSERT : crée le profil s'il n'existe pas encore, sinon le met à jour
    await pool.query(
      `INSERT INTO profiles (user_id, full_name, headline, bio, email, phone, city,
                             linkedin_url, github_url, website_url, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name, headline = EXCLUDED.headline, bio = EXCLUDED.bio,
         email = EXCLUDED.email, phone = EXCLUDED.phone, city = EXCLUDED.city,
         linkedin_url = EXCLUDED.linkedin_url, github_url = EXCLUDED.github_url,
         website_url = EXCLUDED.website_url, photo_url = EXCLUDED.photo_url`,
      [
        userId,
        p.fullName,
        p.headline,
        p.bio,
        p.email,
        p.phone,
        p.city,
        p.linkedinUrl,
        p.githubUrl,
        p.websiteUrl,
        p.photoUrl,
      ],
    );
    await invalidateUserContent(userId);
    res.json({ profile: p });
  }),
);

/** RF-11 (public/privé) et RF-12 (slug). */
profileRouter.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const userId = currentUserId(req);
    const s = settingsSchema.parse(req.body);
    const before = await pool.query<{ slug: string }>("SELECT slug FROM users WHERE id = $1", [userId]);
    const oldSlug = before.rows[0]?.slug;
    // Une violation d'unicité du slug (23505) est traduite en 409 par errorHandler
    await pool.query("UPDATE users SET slug = $1, is_public = $2, allow_cv_download = $3 WHERE id = $4", [
      s.slug,
      s.isPublic,
      s.allowCvDownload,
      userId,
    ]);
    // Purge aussi l'ancienne URL si le slug a changé
    await invalidateUserContent(userId, oldSlug && oldSlug !== s.slug ? [oldSlug] : []);
    res.json({ settings: s });
  }),
);
