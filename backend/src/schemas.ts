import { z } from "zod";
import { CV_LANGS, CV_SECTIONS, CV_TEMPLATES, SKILL_CATEGORIES } from "./types/portfolio.js";

/**
 * Schémas Zod : validation ET typage de toutes les entrées de l'API.
 * Une donnée qui ne passe pas le schéma n'atteint jamais la base de données.
 */

// ---------------------------------------------------------------- utilitaires
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : AAAA-MM-JJ");

/** Texte facultatif : "" ou espaces -> null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

/** URL http(s) facultative : "" -> null. */
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/\S+$/i.test(v) || v.startsWith("/"), "URL invalide (http:// ou https://)");

const stringList = (maxItems: number, maxLen: number) =>
  z.array(z.string().trim().min(1).max(maxLen)).max(maxItems).default([]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "3 caractères minimum")
  .max(100)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lettres minuscules, chiffres et tirets uniquement");

const passwordSchema = z
  .string()
  .min(8, "8 caractères minimum")
  .max(128)
  .regex(/[A-Za-z]/, "Au moins une lettre")
  .regex(/\d/, "Au moins un chiffre");

/** Fin >= début (ou fin absente). */
const datesInOrder = (v: { startDate: string; endDate: string | null }) =>
  v.endDate === null || v.endDate >= v.startDate;
const DATES_MSG = { message: "La date de fin doit suivre la date de début", path: ["endDate"] };

// ---------------------------------------------------------------- auth
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Courriel invalide").max(255),
  password: passwordSchema,
  fullName: z.string().trim().min(2, "Nom requis").max(150),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Courriel invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({ password: z.string().min(1) });

// ---------------------------------------------------------------- profil
export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis").max(150),
  headline: optionalText(200),
  bio: optionalText(3000),
  email: z
    .string()
    .trim()
    .max(255)
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || z.string().email().safeParse(v).success, "Courriel invalide"),
  phone: optionalText(30),
  city: optionalText(100),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  websiteUrl: optionalUrl,
  photoUrl: optionalUrl,
});

export const settingsSchema = z.object({
  slug: slugSchema,
  isPublic: z.boolean(),
  allowCvDownload: z.boolean(),
});

// ---------------------------------------------------------------- contenu (CRUD)
export const experienceSchema = z
  .object({
    position: z.string().trim().min(1, "Poste requis").max(150),
    company: z.string().trim().min(1, "Entreprise requise").max(150),
    startDate: isoDate,
    endDate: isoDate.nullish().transform((v) => v ?? null),
    description: optionalText(2000),
    achievements: stringList(15, 300),
  })
  .refine(datesInOrder, DATES_MSG);

export const educationSchema = z
  .object({
    degree: z.string().trim().min(1, "Diplôme requis").max(150),
    school: z.string().trim().min(1, "Établissement requis").max(150),
    startDate: isoDate,
    endDate: isoDate.nullish().transform((v) => v ?? null),
    description: optionalText(2000),
  })
  .refine(datesInOrder, DATES_MSG);

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  category: z.enum(SKILL_CATEGORIES),
  level: z
    .number()
    .int()
    .min(1)
    .max(5)
    .nullish()
    .transform((v) => v ?? null),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Titre requis").max(150),
  description: optionalText(3000),
  technologies: stringList(20, 50),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  imageUrl: optionalUrl,
});

export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(150),
  issuer: optionalText(150),
  issueDate: isoDate.nullish().transform((v) => v ?? null),
  credentialUrl: optionalUrl,
});

export const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(500),
});

// ---------------------------------------------------------------- CV
/**
 * Paramètres de génération du CV, passés en query string :
 *   ?template=modern&lang=en&sections=profile,experiences&hide=experiences:3,projects:7
 *  - sections : sections à inclure (RF-22) ; absent = toutes ;
 *  - hide     : éléments précis à exclure, au format section:id (RF-22).
 */
export const cvOptionsSchema = z.object({
  template: z.enum(CV_TEMPLATES).default("classic"),
  lang: z.enum(CV_LANGS).default("fr"),
  sections: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw) return [...CV_SECTIONS];
      const wanted = raw.split(",").map((s) => s.trim());
      // On garde l'ordre canonique des sections, en ignorant les valeurs inconnues
      return CV_SECTIONS.filter((s) => wanted.includes(s));
    }),
  hide: z
    .string()
    .optional()
    .transform((raw) => {
      const hidden: Partial<Record<(typeof CV_SECTIONS)[number], number[]>> = {};
      for (const token of (raw ?? "").split(",")) {
        const [section, id] = token.split(":");
        const n = Number(id);
        if (section && (CV_SECTIONS as readonly string[]).includes(section) && Number.isInteger(n) && n > 0) {
          const key = section as (typeof CV_SECTIONS)[number];
          (hidden[key] ??= []).push(n);
        }
      }
      return hidden;
    }),
});
export type CvOptions = z.infer<typeof cvOptionsSchema>;

// ---------------------------------------------------------------- contact (bonus)
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email("Courriel invalide").max(255),
  subject: optionalText(200),
  message: z.string().trim().min(10, "10 caractères minimum").max(5000),
});
