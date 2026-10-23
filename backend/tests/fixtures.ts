import type { CvOptions } from "../src/schemas.js";
import type { PortfolioData } from "../src/types/portfolio.js";
import { CV_SECTIONS } from "../src/types/portfolio.js";

/** Portfolio de test réutilisé par plusieurs suites. */
export const samplePortfolio: PortfolioData = {
  settings: { slug: "eloise-tremblay", isPublic: true, allowCvDownload: true },
  profile: {
    fullName: "Éloïse Tremblay",
    headline: "Développeuse full-stack",
    bio: "Passionnée par le web.",
    email: "eloise@example.com",
    phone: "514-555-0000",
    city: "Montréal",
    linkedinUrl: "https://www.linkedin.com/in/eloise/",
    githubUrl: "https://github.com/eloise",
    websiteUrl: null,
    photoUrl: null,
  },
  experiences: [
    {
      id: 1,
      position: "Développeuse",
      company: "Acme",
      startDate: "2023-05-01",
      endDate: null,
      description: "Applications React.",
      achievements: ["Migration vers TypeScript", "Réduction du temps de build de 40 %"],
      sortOrder: 0,
    },
    {
      id: 2,
      position: "Stagiaire",
      company: "Globex",
      startDate: "2022-01-01",
      endDate: "2022-06-30",
      description: null,
      achievements: [],
      sortOrder: 1,
    },
  ],
  education: [
    {
      id: 10,
      degree: "AEC Programmeur-analyste",
      school: "Collège LaSalle",
      startDate: "2024-09-01",
      endDate: "2026-12-31",
      description: null,
      sortOrder: 0,
    },
  ],
  skills: [
    { id: 20, name: "TypeScript", category: "langage", level: 4, sortOrder: 0 },
    { id: 21, name: "Français", category: "langue", level: 5, sortOrder: 1 },
    { id: 22, name: "Rigueur", category: "soft_skill", level: null, sortOrder: 2 },
  ],
  projects: [
    {
      id: 30,
      title: "Portfolio",
      description: "Mon portfolio.",
      technologies: ["React", "Express"],
      repoUrl: "https://github.com/eloise/portfolio",
      demoUrl: null,
      imageUrl: null,
      sortOrder: 0,
    },
  ],
  certifications: [],
};

export function options(overrides: Partial<CvOptions> = {}): CvOptions {
  return { template: "classic", lang: "fr", sections: [...CV_SECTIONS], hide: {}, ...overrides };
}
