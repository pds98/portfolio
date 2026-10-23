import { describe, expect, it } from "vitest";
import { applyCvOptions } from "../src/cv/filter.js";
import { escapeHtml, levelDots } from "../src/cv/html.js";
import { formatMonth, formatPeriod } from "../src/cv/i18n.js";
import { toJsonResume } from "../src/cv/jsonResume.js";
import { countPdfPages } from "../src/cv/pdf.js";
import { renderCvHtml } from "../src/cv/render.js";
import { cvOptionsSchema } from "../src/schemas.js";
import { buildCvFilename, cvCacheKey } from "../src/services/cv.js";
import { options, samplePortfolio } from "./fixtures.js";

describe("nom du fichier (RF-25)", () => {
  it("suit le format CV_Prenom_Nom.pdf, sans accents", () => {
    expect(buildCvFilename("Demba Sow")).toBe("CV_Demba_Sow.pdf");
    expect(buildCvFilename("Éloïse Tremblay")).toBe("CV_Eloise_Tremblay.pdf");
    expect(buildCvFilename("Jean-Luc  O'Brien")).toBe("CV_Jean-Luc_OBrien.pdf");
    expect(buildCvFilename("Demba Sow", "json")).toBe("CV_Demba_Sow.json");
  });
});

describe("options de génération (RF-22)", () => {
  it("lit les paramètres de la query string", () => {
    const o = cvOptionsSchema.parse({
      template: "modern",
      lang: "en",
      sections: "skills,experiences,inconnue",
      hide: "experiences:2,projects:30,bidon:1",
    });
    expect(o.template).toBe("modern");
    expect(o.sections).toEqual(["experiences", "skills"]); // ordre canonique, valeurs inconnues ignorées
    expect(o.hide).toEqual({ experiences: [2], projects: [30] });
  });

  it("utilise des valeurs par défaut sûres", () => {
    const o = cvOptionsSchema.parse({});
    expect(o.template).toBe("classic");
    expect(o.lang).toBe("fr");
    expect(o.sections).toHaveLength(6);
  });

  it("refuse un gabarit inconnu", () => {
    expect(cvOptionsSchema.safeParse({ template: "pirate" }).success).toBe(false);
  });

  it("retire les sections non cochées et les éléments masqués", () => {
    const doc = applyCvOptions(
      samplePortfolio,
      options({ sections: ["experiences", "skills"], hide: { experiences: [2] } }),
    );
    expect(doc.sections).toEqual(["experiences", "skills"]);
    expect(doc.data.experiences.map((e) => e.id)).toEqual([1]);
    expect(doc.data.projects).toHaveLength(0);
  });

  it("n'affiche pas une section vide (pas de titre orphelin)", () => {
    const doc = applyCvOptions(samplePortfolio, options());
    expect(doc.sections).not.toContain("certifications");
  });
});

describe("gabarits HTML (RF-21)", () => {
  it.each(["classic", "modern"] as const)("le gabarit %s contient les données du profil", (template) => {
    const html = renderCvHtml(samplePortfolio, options({ template }));
    expect(html).toContain("Éloïse Tremblay");
    expect(html).toContain("Développeuse full-stack");
    expect(html).toContain("Migration vers TypeScript");
    expect(html).toContain("@page");
  });

  it("les deux gabarits produisent des mises en page différentes", () => {
    const classic = renderCvHtml(samplePortfolio, options({ template: "classic" }));
    const modern = renderCvHtml(samplePortfolio, options({ template: "modern" }));
    expect(classic).not.toBe(modern);
    expect(modern).toContain("<aside>");
  });

  it("échappe le HTML saisi par l'utilisateur (protection XSS)", () => {
    const evil = {
      ...samplePortfolio,
      profile: { ...samplePortfolio.profile, fullName: '<script>alert("x")</script>' },
    };
    const html = renderCvHtml(evil, options());
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("traduit les titres et les dates en anglais (bonus RF-28)", () => {
    const html = renderCvHtml(samplePortfolio, options({ lang: "en" }));
    expect(html).toContain("Professional Experience");
    expect(html).toContain("Present");
    expect(html).not.toContain("Expérience professionnelle");
  });
});

describe("formatage", () => {
  it("formate les dates sans décalage de fuseau horaire", () => {
    expect(formatMonth("2023-01-01", "en")).toBe("Jan 2023");
    expect(formatPeriod("2023-05-01", null, "fr")).toMatch(/2023 – Présent$/);
  });

  it("affiche les niveaux en pastilles accessibles", () => {
    const dots = levelDots(3);
    expect(dots).toContain('aria-label="3/5"');
    expect(dots.match(/dot on/g)).toHaveLength(3);
    expect(levelDots(null)).toBe("");
  });

  it("échappe tous les caractères spéciaux", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
});

describe("cache du PDF (RF-26)", () => {
  it("la clé contient l'utilisateur, le gabarit et la version des données", () => {
    expect(cvCacheKey(5, 12, options({ template: "modern" }))).toMatch(/^cv:5:modern:v12:[0-9a-f]{12}$/);
  });

  it("une modification des données (nouvelle version) change la clé", () => {
    expect(cvCacheKey(5, 12, options())).not.toBe(cvCacheKey(5, 13, options()));
  });

  it("des options différentes donnent des clés différentes", () => {
    expect(cvCacheKey(1, 1, options({ lang: "fr" }))).not.toBe(cvCacheKey(1, 1, options({ lang: "en" })));
    expect(cvCacheKey(1, 1, options())).not.toBe(cvCacheKey(1, 1, options({ hide: { projects: [30] } })));
  });

  it("des options équivalentes (ordre différent) donnent la même clé", () => {
    const a = options({ hide: { projects: [3, 1], experiences: [2] } });
    const b = options({ hide: { experiences: [2], projects: [1, 3] } });
    expect(cvCacheKey(1, 1, a)).toBe(cvCacheKey(1, 1, b));
  });
});

describe("PDF et exports", () => {
  it("compte les pages d'un PDF (contrôle 1–2 pages, RF-24)", () => {
    const fake = Buffer.from("<< /Type /Pages /Count 2 >> << /Type /Page >> << /Type/Page >>", "latin1");
    expect(countPdfPages(fake)).toBe(2);
  });

  it("exporte au format JSON Resume (bonus RF-27)", () => {
    const resume = toJsonResume(samplePortfolio, "http://localhost:5173/p/eloise-tremblay");
    expect(resume.basics.name).toBe("Éloïse Tremblay");
    expect(resume.work[0]?.highlights).toContain("Migration vers TypeScript");
    expect(resume.languages).toEqual([{ language: "Français", fluency: "5/5" }]);
  });
});
