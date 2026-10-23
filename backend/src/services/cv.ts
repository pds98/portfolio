import { createHash } from "node:crypto";
import type { Response } from "express";
import { commandOptions } from "redis";
import { config } from "../config.js";
import { countPdfPages, htmlToPdfFitted } from "../cv/pdf.js";
import { renderCvHtml } from "../cv/render.js";
import { redis } from "../redis.js";
import type { CvOptions } from "../schemas.js";
import type { PortfolioData } from "../types/portfolio.js";
import { HttpError } from "../utils/http.js";
import { getDataVersion, getPortfolioData } from "./portfolio.js";

/**
 * RF-25 : nom de fichier « CV_Prenom_Nom.pdf ».
 *   "Demba Sow"         -> CV_Demba_Sow.pdf
 *   "Éloïse de la Tour" -> CV_Eloise_de_la_Tour.pdf
 * Accents retirés et caractères spéciaux supprimés : nom sûr pour tous les OS.
 */
export function buildCvFilename(fullName: string, extension = "pdf"): string {
  const parts = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return `CV_${parts.length ? parts.join("_") : "Portfolio"}.${extension}`;
}

/**
 * RF-26 : clé de cache du PDF.
 *   cv:{userId}:{template}:v{dataVersion}:{empreinte des options}
 * - la version change à chaque modification -> l'ancien PDF n'est plus jamais servi ;
 * - l'empreinte distingue les variantes (langue, sections, éléments masqués),
 *   sinon deux CV différents partageraient la même clé.
 */
export function cvCacheKey(userId: number, dataVersion: number, options: CvOptions): string {
  const normalized = {
    lang: options.lang,
    sections: [...options.sections].sort(),
    hide: Object.fromEntries(
      Object.entries(options.hide)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, ids]) => [k, [...(ids ?? [])].sort((x, y) => x - y)]),
    ),
  };
  const hash = createHash("sha1").update(JSON.stringify(normalized)).digest("hex").slice(0, 12);
  return `cv:${userId}:${options.template}:v${dataVersion}:${hash}`;
}

async function loadData(userId: number): Promise<PortfolioData> {
  const data = await getPortfolioData(userId);
  if (!data) throw new HttpError(404, "Portfolio introuvable");
  if (!data.profile.fullName) throw new HttpError(400, "Renseignez votre nom dans le profil avant de générer le CV");
  return data;
}

/** RF-23 : HTML de l'aperçu (le même que celui converti en PDF). */
export async function getCvHtml(userId: number, options: CvOptions): Promise<string> {
  return renderCvHtml(await loadData(userId), options);
}

export interface CvPdfResult {
  pdf: Buffer;
  filename: string;
  pages: number;
  cache: "HIT" | "MISS";
}

/** RF-20 / RF-26 : PDF servi depuis Redis s'il existe, sinon généré puis mis en cache. */
export async function getCvPdf(userId: number, options: CvOptions): Promise<CvPdfResult> {
  const version = await getDataVersion(userId);
  const key = cvCacheKey(userId, version, options);

  const cached = await redis.get(commandOptions({ returnBuffers: true }), key);
  const data = await loadData(userId); // nécessaire pour le nom de fichier
  const filename = buildCvFilename(data.profile.fullName);

  if (cached) return { pdf: cached, filename, pages: countPdfPages(cached), cache: "HIT" };

  const { pdf, pages } = await htmlToPdfFitted(renderCvHtml(data, options));
  await redis.set(key, pdf, { EX: config.cvCacheTtlSeconds });
  return { pdf, filename, pages, cache: "MISS" };
}

export function sendPdf(res: Response, result: CvPdfResult, disposition: "attachment" | "inline" = "attachment"): void {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${result.filename}"`);
  res.setHeader("Content-Length", result.pdf.length);
  res.setHeader("X-Cache", result.cache);
  res.setHeader("X-CV-Pages", result.pages);
  res.end(result.pdf);
}
