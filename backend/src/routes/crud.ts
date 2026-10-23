import { Router } from "express";
import type { ZodType, ZodTypeDef } from "zod";
import { pool, withTransaction } from "../db.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import {
  certificationSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  reorderSchema,
  skillSchema,
} from "../schemas.js";
import { invalidateUserContent } from "../services/cache.js";
import { HttpError, asyncHandler, parseId } from "../utils/http.js";

/**
 * Fabrique de routeurs CRUD génériques.
 * Les 5 ressources du portfolio partagent exactement le même comportement :
 * seuls la table, les colonnes et le schéma de validation changent.
 *
 *   GET    /           liste (triée par sort_order)
 *   GET    /:id        un élément
 *   POST   /           création (ajouté en fin de liste)
 *   PUT    /reorder    nouvel ordre d'affichage { ids: [3, 1, 2] }
 *   PUT    /:id        modification complète
 *   DELETE /:id        suppression
 *
 * Sécurité :
 *  - chaque requête est filtrée par user_id = utilisateur connecté
 *    (impossible de lire ou modifier les données d'un autre compte) ;
 *  - les noms de colonnes proviennent de la définition ci-dessous (liste
 *    blanche), jamais de l'utilisateur ; les valeurs sont toujours passées en
 *    paramètres $1, $2… (requêtes paramétrées, aucune injection SQL possible).
 */
interface ResourceDefinition<T extends Record<string, unknown>> {
  table: string;
  /** champ API (camelCase) -> colonne SQL (snake_case) */
  columns: Record<keyof T & string, string>;
  schema: ZodType<T, ZodTypeDef, unknown>;
}

export function createCrudRouter<T extends Record<string, unknown>>(def: ResourceDefinition<T>): Router {
  const router = Router();
  router.use(requireAuth);

  const fields = Object.keys(def.columns) as (keyof T & string)[];
  const selectList = ["id", ...fields.map((f) => `${def.columns[f]} AS "${f}"`), `sort_order AS "sortOrder"`].join(
    ", ",
  );

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const { rows } = await pool.query(
        `SELECT ${selectList} FROM ${def.table} WHERE user_id = $1 ORDER BY sort_order, id`,
        [currentUserId(req)],
      );
      res.json(rows);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const { rows } = await pool.query(`SELECT ${selectList} FROM ${def.table} WHERE id = $1 AND user_id = $2`, [
        parseId(req.params.id),
        currentUserId(req),
      ]);
      if (!rows[0]) throw new HttpError(404, "Élément introuvable");
      res.json(rows[0]);
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const userId = currentUserId(req);
      const data = def.schema.parse(req.body);
      const columns = fields.map((f) => def.columns[f]);
      const values = fields.map((f) => data[f]);
      const placeholders = values.map((_, i) => `$${i + 2}`);
      // Nouvel élément placé en dernière position
      const { rows } = await pool.query(
        `INSERT INTO ${def.table} (user_id, ${columns.join(", ")}, sort_order)
         VALUES ($1, ${placeholders.join(", ")},
                 (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM ${def.table} WHERE user_id = $1))
         RETURNING ${selectList}`,
        [userId, ...values],
      );
      await invalidateUserContent(userId);
      res.status(201).json(rows[0]);
    }),
  );

  // Déclarée AVANT /:id, sinon Express interpréterait « reorder » comme un id
  router.put(
    "/reorder",
    asyncHandler(async (req, res) => {
      const userId = currentUserId(req);
      const { ids } = reorderSchema.parse(req.body);
      await withTransaction(async (client) => {
        const owned = await client.query(`SELECT id FROM ${def.table} WHERE user_id = $1 AND id = ANY($2::int[])`, [
          userId,
          ids,
        ]);
        if (owned.rowCount !== new Set(ids).size) throw new HttpError(400, "Liste d'identifiants invalide");
        // Une seule requête : sort_order = position de l'id dans le tableau reçu
        await client.query(
          `UPDATE ${def.table} t SET sort_order = o.pos
             FROM unnest($2::int[]) WITH ORDINALITY AS o(id, pos)
            WHERE t.id = o.id AND t.user_id = $1`,
          [userId, ids],
        );
      });
      await invalidateUserContent(userId);
      res.status(204).end();
    }),
  );

  router.put(
    "/:id",
    asyncHandler(async (req, res) => {
      const userId = currentUserId(req);
      const id = parseId(req.params.id);
      const data = def.schema.parse(req.body);
      const assignments = fields.map((f, i) => `${def.columns[f]} = $${i + 3}`);
      const { rows } = await pool.query(
        `UPDATE ${def.table} SET ${assignments.join(", ")}
          WHERE id = $1 AND user_id = $2 RETURNING ${selectList}`,
        [id, userId, ...fields.map((f) => data[f])],
      );
      if (!rows[0]) throw new HttpError(404, "Élément introuvable");
      await invalidateUserContent(userId);
      res.json(rows[0]);
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const userId = currentUserId(req);
      const result = await pool.query(`DELETE FROM ${def.table} WHERE id = $1 AND user_id = $2`, [
        parseId(req.params.id),
        userId,
      ]);
      if (!result.rowCount) throw new HttpError(404, "Élément introuvable");
      await invalidateUserContent(userId);
      res.status(204).end();
    }),
  );

  return router;
}

// ------------------------------------------------------------------ ressources
export const experiencesRouter = createCrudRouter({
  table: "experiences",
  schema: experienceSchema,
  columns: {
    position: "position",
    company: "company",
    startDate: "start_date",
    endDate: "end_date",
    description: "description",
    achievements: "achievements",
  },
});

export const educationRouter = createCrudRouter({
  table: "education",
  schema: educationSchema,
  columns: {
    degree: "degree",
    school: "school",
    startDate: "start_date",
    endDate: "end_date",
    description: "description",
  },
});

export const skillsRouter = createCrudRouter({
  table: "skills",
  schema: skillSchema,
  columns: { name: "name", category: "category", level: "level" },
});

export const projectsRouter = createCrudRouter({
  table: "projects",
  schema: projectSchema,
  columns: {
    title: "title",
    description: "description",
    technologies: "technologies",
    repoUrl: "repo_url",
    demoUrl: "demo_url",
    imageUrl: "image_url",
  },
});

export const certificationsRouter = createCrudRouter({
  table: "certifications",
  schema: certificationSchema,
  columns: { name: "name", issuer: "issuer", issueDate: "issue_date", credentialUrl: "credential_url" },
});
