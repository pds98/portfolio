import type { CvLang, CvSection, SkillCategory } from "../types/portfolio.js";

/**
 * Libellés des CV en français et en anglais (bonus RF-28).
 * Les titres de sections et les dates sont traduits ; le contenu saisi par
 * l'étudiant (descriptions, réalisations…) est repris tel quel.
 */
interface Labels {
  sections: Record<CvSection, string>;
  categories: Record<SkillCategory, string>;
  present: string;
  contact: string;
  links: string;
  repository: string;
  demo: string;
}

export const LABELS: Record<CvLang, Labels> = {
  fr: {
    sections: {
      profile: "Profil",
      experiences: "Expérience professionnelle",
      education: "Formation",
      skills: "Compétences",
      projects: "Projets",
      certifications: "Certifications",
    },
    categories: {
      langage: "Langages",
      framework: "Frameworks",
      outil: "Outils",
      langue: "Langues",
      soft_skill: "Savoir-être",
    },
    present: "Présent",
    contact: "Contact",
    links: "Liens",
    repository: "Code",
    demo: "Démo",
  },
  en: {
    sections: {
      profile: "Profile",
      experiences: "Professional Experience",
      education: "Education",
      skills: "Skills",
      projects: "Projects",
      certifications: "Certifications",
    },
    categories: {
      langage: "Programming",
      framework: "Frameworks",
      outil: "Tools",
      langue: "Languages",
      soft_skill: "Soft skills",
    },
    present: "Present",
    contact: "Contact",
    links: "Links",
    repository: "Code",
    demo: "Demo",
  },
};

const LOCALES: Record<CvLang, string> = { fr: "fr-CA", en: "en-CA" };

/** "2022-11-01" -> "nov. 2022" (fr) / "Nov 2022" (en). Calcul en UTC : aucun décalage de jour. */
export function formatMonth(isoDate: string, lang: CvLang): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(LOCALES[lang], { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

/** Période "nov. 2022 – nov. 2024", ou "mai 2026 – Présent" si la date de fin est absente. */
export function formatPeriod(start: string, end: string | null, lang: CvLang): string {
  return `${formatMonth(start, lang)} – ${end ? formatMonth(end, lang) : LABELS[lang].present}`;
}
