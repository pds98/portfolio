import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http.js";

/**
 * Gestionnaire d'erreurs global (dernier middleware Express).
 *  - ZodError  -> 400 avec le détail des champs invalides
 *  - HttpError -> son code HTTP
 *  - violation d'unicité PostgreSQL (23505) -> 409
 *  - tout le reste -> 500 sans fuite de détails internes
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Données invalides",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
    return res.status(409).json({ error: "Cette valeur est déjà utilisée" });
  }
  console.error(err);
  return res.status(500).json({ error: "Erreur interne du serveur" });
};
