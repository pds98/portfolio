import type { SkillCategory } from "../types/portfolio";

/** "2022-11-01" -> "nov. 2022" (calcul en UTC pour éviter un décalage d'un jour). */
export function formatMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-CA", { month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatPeriod(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Présent"}`;
}

/** Années d'expérience depuis la plus ancienne date de début. */
export function yearsSince(dates: string[]): number {
  if (dates.length === 0) return 0;
  const first = Math.min(...dates.map((d) => new Date(`${d}T00:00:00Z`).getTime()));
  return Math.max(0, Math.floor((Date.now() - first) / (365.25 * 24 * 3600 * 1000)));
}

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  langage: "Langages",
  framework: "Frameworks",
  outil: "Outils",
  langue: "Langues",
  soft_skill: "Savoir-être",
};

export const LEVEL_LABELS = ["", "Notions", "Débutant", "Intermédiaire", "Avancé", "Expert"] as const;
