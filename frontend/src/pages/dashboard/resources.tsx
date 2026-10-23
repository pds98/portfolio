import { SKILL_CATEGORIES } from "../../types/portfolio";
import { CATEGORY_LABELS, LEVEL_LABELS, formatMonth, formatPeriod } from "../../utils/format";
import type { ResourceConfig } from "./ResourcePanel";

/** Configuration des 5 panneaux CRUD : champs du formulaire et rendu de chaque ligne. */

export const experiencesConfig: ResourceConfig<"experiences"> = {
  resource: "experiences",
  title: "Expériences",
  singular: "expérience",
  empty: "Aucune expérience pour l'instant. Ajoutez votre premier poste.",
  fields: [
    { name: "position", label: "Poste", type: "text", required: true, width: 6 },
    { name: "company", label: "Entreprise", type: "text", required: true, width: 6 },
    { name: "startDate", label: "Date de début", type: "date", required: true, width: 6 },
    {
      name: "endDate",
      label: "Date de fin",
      type: "date",
      width: 6,
      helper: "Laisser vide si c'est votre poste actuel",
    },
    { name: "description", label: "Description", type: "textarea" },
    { name: "achievements", label: "Réalisations", type: "lines", helper: "Une réalisation par ligne (puces du CV)" },
  ],
  primary: (e) => `${e.position} — ${e.company}`,
  secondary: (e) => formatPeriod(e.startDate, e.endDate),
};

export const educationConfig: ResourceConfig<"education"> = {
  resource: "education",
  title: "Formations",
  singular: "formation",
  empty: "Aucune formation pour l'instant.",
  fields: [
    { name: "degree", label: "Diplôme", type: "text", required: true, width: 6 },
    { name: "school", label: "Établissement", type: "text", required: true, width: 6 },
    { name: "startDate", label: "Date de début", type: "date", required: true, width: 6 },
    { name: "endDate", label: "Date de fin (prévue)", type: "date", width: 6 },
    { name: "description", label: "Description", type: "textarea" },
  ],
  primary: (e) => `${e.degree} — ${e.school}`,
  secondary: (e) => formatPeriod(e.startDate, e.endDate),
};

export const skillsConfig: ResourceConfig<"skills"> = {
  resource: "skills",
  title: "Compétences",
  singular: "compétence",
  empty: "Aucune compétence pour l'instant.",
  fields: [
    { name: "name", label: "Nom", type: "text", required: true, width: 6 },
    {
      name: "category",
      label: "Catégorie",
      type: "select",
      required: true,
      width: 6,
      options: SKILL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
    },
    {
      name: "level",
      label: "Niveau",
      type: "level",
      helper: "1 = notions · 5 = expert (facultatif pour le savoir-être)",
    },
  ],
  primary: (s) => s.name,
  secondary: (s) => `${CATEGORY_LABELS[s.category]}${s.level ? ` · ${LEVEL_LABELS[s.level]} (${s.level}/5)` : ""}`,
};

export const projectsConfig: ResourceConfig<"projects"> = {
  resource: "projects",
  title: "Projets",
  singular: "projet",
  empty: "Aucun projet pour l'instant.",
  fields: [
    { name: "title", label: "Titre", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "technologies",
      label: "Technologies",
      type: "tags",
      helper: "Séparées par des virgules : React, Express, PostgreSQL",
    },
    { name: "repoUrl", label: "Lien du dépôt", type: "url", width: 6 },
    { name: "demoUrl", label: "Lien de démonstration", type: "url", width: 6 },
    { name: "imageUrl", label: "Image (URL)", type: "url" },
  ],
  primary: (p) => p.title,
  secondary: (p) => p.technologies.join(" · "),
};

export const certificationsConfig: ResourceConfig<"certifications"> = {
  resource: "certifications",
  title: "Certifications",
  singular: "certification",
  empty: "Aucune certification pour l'instant (section facultative).",
  fields: [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "issuer", label: "Organisme", type: "text", width: 6 },
    { name: "issueDate", label: "Date d'obtention", type: "date", width: 6 },
    { name: "credentialUrl", label: "Lien de vérification", type: "url" },
  ],
  primary: (c) => c.name,
  secondary: (c) => [c.issuer, c.issueDate && formatMonth(c.issueDate)].filter(Boolean).join(" · "),
};
