import type { CvOptions } from "../schemas.js";
import type { CvTemplate, PortfolioData } from "../types/portfolio.js";
import { applyCvOptions, type CvDocument } from "./filter.js";
import { renderClassic } from "./templates/classic.js";
import { renderModern } from "./templates/modern.js";

/**
 * Registre des gabarits (RF-21). Ajouter un 3e modèle = écrire une fonction
 * (doc) => html et l'enregistrer ici ; le reste de la chaîne ne change pas.
 */
const TEMPLATES: Record<CvTemplate, (doc: CvDocument) => string> = {
  classic: renderClassic,
  modern: renderModern,
};

/** Produit le HTML complet du CV : utilisé tel quel pour l'aperçu ET pour le PDF. */
export function renderCvHtml(data: PortfolioData, options: CvOptions): string {
  return TEMPLATES[options.template](applyCvOptions(data, options));
}
