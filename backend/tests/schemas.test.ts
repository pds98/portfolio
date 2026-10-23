import { describe, expect, it } from "vitest";
import { experienceSchema, profileSchema, settingsSchema, skillSchema } from "../src/schemas.js";

describe("validation du contenu (Zod)", () => {
  const exp = { position: "Dev", company: "Acme", startDate: "2023-01-01", endDate: null, achievements: [] };

  it("accepte une expérience valide, poste actuel (sans date de fin)", () => {
    expect(experienceSchema.safeParse(exp).success).toBe(true);
  });

  it("refuse une date de fin antérieure à la date de début", () => {
    const r = experienceSchema.safeParse({ ...exp, endDate: "2022-01-01" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["endDate"]);
  });

  it("refuse un format de date invalide", () => {
    expect(experienceSchema.safeParse({ ...exp, startDate: "01/01/2023" }).success).toBe(false);
  });

  it("limite le niveau de compétence à 1–5 et la catégorie à la liste prévue", () => {
    expect(skillSchema.safeParse({ name: "SQL", category: "langage", level: 6 }).success).toBe(false);
    expect(skillSchema.safeParse({ name: "SQL", category: "magie", level: 3 }).success).toBe(false);
    expect(skillSchema.parse({ name: "Rigueur", category: "soft_skill" }).level).toBeNull();
  });

  it("convertit les champs vides du profil en null et valide les URL", () => {
    const p = profileSchema.parse({ fullName: "Demba Sow", headline: "  ", githubUrl: "" });
    expect(p.headline).toBeNull();
    expect(p.githubUrl).toBeNull();
    expect(profileSchema.safeParse({ fullName: "Demba Sow", githubUrl: "javascript:alert(1)" }).success).toBe(false);
  });

  it("n'accepte que des slugs lisibles", () => {
    expect(settingsSchema.safeParse({ slug: "Demba-Sow", isPublic: true, allowCvDownload: false }).success).toBe(true);
    expect(settingsSchema.safeParse({ slug: "demba sow!", isPublic: true, allowCvDownload: false }).success).toBe(
      false,
    );
  });
});
