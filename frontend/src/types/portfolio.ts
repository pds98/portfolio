/**
 * Types du domaine, exposés par l'API en camelCase.
 * Le même fichier est copié dans frontend/src/types/portfolio.ts : les deux
 * applications sont construites dans des conteneurs Docker séparés, donc on
 * partage le contrat par copie (vérifiée par un test) plutôt que par import.
 */

export const SKILL_CATEGORIES = ["langage", "framework", "outil", "langue", "soft_skill"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const CV_TEMPLATES = ["classic", "modern"] as const;
export type CvTemplate = (typeof CV_TEMPLATES)[number];

export const CV_LANGS = ["fr", "en"] as const;
export type CvLang = (typeof CV_LANGS)[number];

export const CV_SECTIONS = ["profile", "experiences", "education", "skills", "projects", "certifications"] as const;
export type CvSection = (typeof CV_SECTIONS)[number];

export interface Profile {
  fullName: string;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  photoUrl: string | null;
}

export interface Experience {
  id: number;
  position: string;
  company: string;
  startDate: string; // AAAA-MM-JJ
  endDate: string | null; // null = poste actuel
  description: string | null;
  achievements: string[];
  sortOrder: number;
}

export interface Education {
  id: number;
  degree: string;
  school: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  sortOrder: number;
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  level: number | null; // 1 à 5
  sortOrder: number;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  technologies: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  credentialUrl: string | null;
  sortOrder: number;
}

export interface PortfolioSettings {
  slug: string;
  isPublic: boolean;
  allowCvDownload: boolean;
}

/** Agrégat complet d'un portfolio : utilisé par la page publique et par le CV. */
export interface PortfolioData {
  settings: PortfolioSettings;
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

export interface CurrentUser {
  id: number;
  email: string;
  slug: string;
  fullName: string;
  isPublic: boolean;
}
