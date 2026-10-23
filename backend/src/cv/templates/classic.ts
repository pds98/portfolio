import type { CvDocument } from "../filter.js";
import { LABELS, formatMonth, formatPeriod } from "../i18n.js";
import { SCREEN_PREVIEW_CSS, escapeHtml, join, link, paragraphs } from "../html.js";
import { SKILL_CATEGORIES } from "../../types/portfolio.js";
import type { CvSection } from "../../types/portfolio.js";

/**
 * Gabarit « Classique » : une colonne, typographie à empattements pour les titres,
 * sobre et dense – le format attendu par la plupart des recruteurs québécois.
 */
const CSS = `
@page { size: A4; margin: 14mm 16mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Helvetica Neue", Arial, "Liberation Sans", sans-serif;
       font-size: 9.6pt; line-height: 1.38; color: #1f2933; }
.sheet { background: #fff; }
@media screen { .sheet { padding: 14mm 16mm; } }
a { color: inherit; text-decoration: none; }
header { text-align: center; padding-bottom: 8px; border-bottom: 2px solid #1a365d; margin-bottom: 10px; }
h1 { font-family: Georgia, "Times New Roman", "Liberation Serif", serif; font-size: 23pt;
     letter-spacing: .5px; margin: 0; color: #1a365d; }
.headline { font-size: 11pt; color: #3c4a5c; margin-top: 2px; }
.contact { margin-top: 5px; font-size: 8.8pt; color: #3c4a5c; }
.contact span + span::before { content: "·"; margin: 0 7px; color: #9aa5b1; }
section { margin-top: 10px; }
h2 { font-family: Georgia, "Times New Roman", "Liberation Serif", serif; font-size: 11pt;
     text-transform: uppercase; letter-spacing: 1.4px; color: #1a365d;
     border-bottom: 1px solid #cbd2d9; padding-bottom: 2px; margin: 0 0 6px; break-after: avoid; }
.entry { margin-bottom: 7px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.title { font-weight: 700; }
.org { color: #3c4a5c; }
.date { color: #616e7c; font-size: 8.8pt; white-space: nowrap; }
p { margin: 2px 0; }
ul { margin: 3px 0 0; padding-left: 15px; }
li { margin: 1px 0; }
.skills-line { margin: 2px 0; }
.skills-line b { color: #1a365d; }
.tech { font-style: italic; color: #52606d; font-size: 8.8pt; }
${SCREEN_PREVIEW_CSS}
`;

function renderSection(doc: CvDocument, section: CvSection): string {
  const { data, lang } = doc;
  const L = LABELS[lang];
  const title = `<h2>${L.sections[section]}</h2>`;

  switch (section) {
    case "profile":
      return `<section>${title}${paragraphs(data.profile.bio)}</section>`;

    case "experiences":
      return `<section>${title}${data.experiences
        .map(
          (e) => `<div class="entry">
            <div class="row"><div><span class="title">${escapeHtml(e.position)}</span>
              <span class="org"> — ${escapeHtml(e.company)}</span></div>
              <div class="date">${formatPeriod(e.startDate, e.endDate, lang)}</div></div>
            ${paragraphs(e.description)}
            ${e.achievements.length ? `<ul>${e.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
          </div>`,
        )
        .join("")}</section>`;

    case "education":
      return `<section>${title}${data.education
        .map(
          (e) => `<div class="entry">
            <div class="row"><div><span class="title">${escapeHtml(e.degree)}</span>
              <span class="org"> — ${escapeHtml(e.school)}</span></div>
              <div class="date">${formatPeriod(e.startDate, e.endDate, lang)}</div></div>
            ${paragraphs(e.description)}
          </div>`,
        )
        .join("")}</section>`;

    case "skills": {
      // Une ligne par catégorie : « Langages : TypeScript, Python, SQL »
      const lines = SKILL_CATEGORIES.map((cat) => {
        const names = data.skills.filter((s) => s.category === cat).map((s) => escapeHtml(s.name));
        return names.length ? `<p class="skills-line"><b>${L.categories[cat]} :</b> ${names.join(", ")}</p>` : "";
      });
      return `<section>${title}${lines.join("")}</section>`;
    }

    case "projects":
      return `<section>${title}${data.projects
        .map(
          (p) => `<div class="entry">
            <div class="row"><span class="title">${escapeHtml(p.title)}</span>
              <span class="date">${join([link(p.repoUrl, L.repository), link(p.demoUrl, L.demo)], " · ")}</span></div>
            ${p.technologies.length ? `<div class="tech">${p.technologies.map(escapeHtml).join(" · ")}</div>` : ""}
            ${paragraphs(p.description)}
          </div>`,
        )
        .join("")}</section>`;

    case "certifications":
      return `<section>${title}<ul>${data.certifications
        .map(
          (c) =>
            `<li><b>${escapeHtml(c.name)}</b>${c.issuer ? ` — ${escapeHtml(c.issuer)}` : ""}${
              c.issueDate ? ` (${formatMonth(c.issueDate, lang)})` : ""
            }${c.credentialUrl ? ` · ${link(c.credentialUrl)}` : ""}</li>`,
        )
        .join("")}</ul></section>`;
  }
}

export function renderClassic(doc: CvDocument): string {
  const p = doc.data.profile;
  const contact = join(
    [
      p.email && `<span>${link(`mailto:${p.email}`, p.email)}</span>`,
      p.phone && `<span>${escapeHtml(p.phone)}</span>`,
      p.city && `<span>${escapeHtml(p.city)}</span>`,
      p.linkedinUrl && `<span>${link(p.linkedinUrl)}</span>`,
      p.githubUrl && `<span>${link(p.githubUrl)}</span>`,
      p.websiteUrl && `<span>${link(p.websiteUrl)}</span>`,
    ],
    "",
  );

  return `<!doctype html><html lang="${doc.lang}"><head><meta charset="utf-8">
<title>CV – ${escapeHtml(p.fullName)}</title><style>${CSS}</style></head>
<body><div class="sheet">
  <header>
    <h1>${escapeHtml(p.fullName)}</h1>
    ${p.headline ? `<div class="headline">${escapeHtml(p.headline)}</div>` : ""}
    ${contact ? `<div class="contact">${contact}</div>` : ""}
  </header>
  ${doc.sections.map((s) => renderSection(doc, s)).join("\n")}
</div></body></html>`;
}
