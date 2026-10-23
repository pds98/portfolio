import { pool } from "../db.js";
import type { PortfolioData, Profile } from "../types/portfolio.js";

/**
 * Lecture de l'agrégat complet d'un portfolio.
 * Les alias SQL (AS "startDate"…) convertissent snake_case -> camelCase
 * directement dans la requête : aucune couche de mapping manuelle.
 * Les 6 requêtes sont lancées en parallèle (Promise.all).
 */

const PROFILE_COLUMNS = `
  p.full_name AS "fullName", p.headline, p.bio, p.email, p.phone, p.city,
  p.linkedin_url AS "linkedinUrl", p.github_url AS "githubUrl",
  p.website_url AS "websiteUrl", p.photo_url AS "photoUrl"`;

export const EMPTY_PROFILE: Profile = {
  fullName: "",
  headline: null,
  bio: null,
  email: null,
  phone: null,
  city: null,
  linkedinUrl: null,
  githubUrl: null,
  websiteUrl: null,
  photoUrl: null,
};

export async function getPortfolioData(userId: number): Promise<PortfolioData | null> {
  const [head, experiences, education, skills, projects, certifications] = await Promise.all([
    pool.query(
      `SELECT u.slug, u.is_public AS "isPublic", u.allow_cv_download AS "allowCvDownload", ${PROFILE_COLUMNS}
         FROM users u LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1`,
      [userId],
    ),
    pool.query(
      `SELECT id, position, company, start_date AS "startDate", end_date AS "endDate",
              description, achievements, sort_order AS "sortOrder"
         FROM experiences WHERE user_id = $1 ORDER BY sort_order, id`,
      [userId],
    ),
    pool.query(
      `SELECT id, degree, school, start_date AS "startDate", end_date AS "endDate",
              description, sort_order AS "sortOrder"
         FROM education WHERE user_id = $1 ORDER BY sort_order, id`,
      [userId],
    ),
    pool.query(
      `SELECT id, name, category, level, sort_order AS "sortOrder"
         FROM skills WHERE user_id = $1 ORDER BY sort_order, id`,
      [userId],
    ),
    pool.query(
      `SELECT id, title, description, technologies, repo_url AS "repoUrl", demo_url AS "demoUrl",
              image_url AS "imageUrl", sort_order AS "sortOrder"
         FROM projects WHERE user_id = $1 ORDER BY sort_order, id`,
      [userId],
    ),
    pool.query(
      `SELECT id, name, issuer, issue_date AS "issueDate", credential_url AS "credentialUrl",
              sort_order AS "sortOrder"
         FROM certifications WHERE user_id = $1 ORDER BY sort_order, id`,
      [userId],
    ),
  ]);

  const row = head.rows[0];
  if (!row) return null;

  const { slug, isPublic, allowCvDownload, ...profile } = row;
  return {
    settings: { slug, isPublic, allowCvDownload },
    profile: { ...EMPTY_PROFILE, ...profile, fullName: profile.fullName ?? "" },
    experiences: experiences.rows,
    education: education.rows,
    skills: skills.rows,
    projects: projects.rows,
    certifications: certifications.rows,
  };
}

/** Id d'un utilisateur à partir de son slug, uniquement si son portfolio est public. */
export async function findPublicUserId(slug: string): Promise<number | null> {
  const { rows } = await pool.query<{ id: number }>("SELECT id FROM users WHERE slug = $1 AND is_public = TRUE", [
    slug,
  ]);
  return rows[0]?.id ?? null;
}

export async function getDataVersion(userId: number): Promise<number> {
  const { rows } = await pool.query<{ data_version: number }>("SELECT data_version FROM users WHERE id = $1", [userId]);
  return rows[0]?.data_version ?? 0;
}
