import type { CvOptions } from "../schemas.js";
import type { CvSection, PortfolioData } from "../types/portfolio.js";

/** Données prêtes à être mises en page : seules les sections / éléments choisis (RF-22). */
export interface CvDocument {
  data: PortfolioData;
  /** Sections à afficher, dans l'ordre canonique. */
  sections: CvSection[];
  lang: CvOptions["lang"];
}

/**
 * Applique les choix de l'étudiant :
 *  - une section absente de `options.sections` disparaît du CV ;
 *  - un élément dont l'id figure dans `options.hide[section]` est retiré ;
 *  - une section devenue vide n'est pas affichée (pas de titre orphelin).
 * Fonction pure (aucun accès réseau / BD) : testée unitairement.
 */
export function applyCvOptions(source: PortfolioData, options: CvOptions): CvDocument {
  const hidden = (section: CvSection) => new Set(options.hide[section] ?? []);
  const keep = <T extends { id: number }>(section: CvSection, items: T[]): T[] =>
    options.sections.includes(section) ? items.filter((item) => !hidden(section).has(item.id)) : [];

  const data: PortfolioData = {
    ...source,
    experiences: keep("experiences", source.experiences),
    education: keep("education", source.education),
    skills: keep("skills", source.skills),
    projects: keep("projects", source.projects),
    certifications: keep("certifications", source.certifications),
  };

  const sections = options.sections.filter((section) => {
    if (section === "profile") return Boolean(source.profile.bio);
    return data[section].length > 0;
  });

  return { data, sections, lang: options.lang };
}
