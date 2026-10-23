import { Router } from "express";
import { config } from "../config.js";
import { toJsonResume } from "../cv/jsonResume.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { cvOptionsSchema } from "../schemas.js";
import { buildCvFilename, getCvHtml, getCvPdf, sendPdf } from "../services/cv.js";
import { getPortfolioData } from "../services/portfolio.js";
import { HttpError, asyncHandler } from "../utils/http.js";

/**
 * Génération du CV (espace privé, utilisateur connecté).
 * Paramètres communs (query string) : template, lang, sections, hide – cf. cvOptionsSchema.
 */
export const cvRouter = Router();
cvRouter.use(requireAuth);

/** GET /api/cv/preview – RF-23 : HTML du CV, affiché dans une <iframe> du tableau de bord. */
cvRouter.get(
  "/preview",
  asyncHandler(async (req, res) => {
    const options = cvOptionsSchema.parse(req.query);
    const html = await getCvHtml(currentUserId(req), options);
    res.type("html").send(html);
  }),
);

/** GET /api/cv/download – RF-20/25/26 : PDF CV_Prenom_Nom.pdf (mis en cache dans Redis). */
cvRouter.get(
  "/download",
  asyncHandler(async (req, res) => {
    const options = cvOptionsSchema.parse(req.query);
    sendPdf(res, await getCvPdf(currentUserId(req), options));
  }),
);

/** GET /api/cv/json – bonus RF-27 : export JSON Resume. */
cvRouter.get(
  "/json",
  asyncHandler(async (req, res) => {
    const data = await getPortfolioData(currentUserId(req));
    if (!data) throw new HttpError(404, "Portfolio introuvable");
    const publicUrl = `${config.corsOrigin}/p/${data.settings.slug}`;
    res.setHeader("Content-Disposition", `attachment; filename="${buildCvFilename(data.profile.fullName, "json")}"`);
    res.json(toJsonResume(data, publicUrl));
  }),
);
