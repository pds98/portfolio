import type { PortfolioData } from "../types/portfolio.js";

/**
 * Bonus RF-27 : export au format standard JSON Resume (https://jsonresume.org/schema).
 * Permet de réutiliser les données dans d'autres outils (thèmes jsonresume, ATS…).
 */
export function toJsonResume(data: PortfolioData, publicUrl?: string) {
  const p = data.profile;
  const profiles = [
    p.linkedinUrl && { network: "LinkedIn", url: p.linkedinUrl },
    p.githubUrl && { network: "GitHub", url: p.githubUrl },
  ].filter(Boolean);

  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: p.fullName,
      label: p.headline ?? undefined,
      email: p.email ?? undefined,
      phone: p.phone ?? undefined,
      url: p.websiteUrl ?? publicUrl,
      summary: p.bio ?? undefined,
      image: p.photoUrl ?? undefined,
      location: p.city ? { city: p.city } : undefined,
      profiles,
    },
    work: data.experiences.map((e) => ({
      name: e.company,
      position: e.position,
      startDate: e.startDate,
      endDate: e.endDate ?? undefined,
      summary: e.description ?? undefined,
      highlights: e.achievements,
    })),
    education: data.education.map((e) => ({
      institution: e.school,
      studyType: e.degree,
      startDate: e.startDate,
      endDate: e.endDate ?? undefined,
    })),
    skills: data.skills
      .filter((s) => s.category !== "langue")
      .map((s) => ({ name: s.name, level: s.level ? `${s.level}/5` : undefined, keywords: [s.category] })),
    languages: data.skills
      .filter((s) => s.category === "langue")
      .map((s) => ({ language: s.name, fluency: s.level ? `${s.level}/5` : undefined })),
    projects: data.projects.map((pr) => ({
      name: pr.title,
      description: pr.description ?? undefined,
      keywords: pr.technologies,
      url: pr.demoUrl ?? pr.repoUrl ?? undefined,
    })),
    certificates: data.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer ?? undefined,
      date: c.issueDate ?? undefined,
      url: c.credentialUrl ?? undefined,
    })),
  };
}
