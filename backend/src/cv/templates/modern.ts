import type { CvDocument } from "../filter.js";
import { LABELS, formatMonth, formatPeriod } from "../i18n.js";
import { SCREEN_PREVIEW_CSS, escapeHtml, join, levelDots, link, paragraphs } from "../html.js";
import type { CvSection, SkillCategory } from "../../types/portfolio.js";

/**
 * Gabarit « Moderne » : deux colonnes, barre latérale bleu nuit (couleurs du
 * portfolio public : #1a237e -> #0d47a1), niveaux de compétences en pastilles.
 *
 * Mise en page multipage : @page sans marge + fond de la barre latérale peint
 * sur <html> (répété sur chaque page) + box-decoration-break: clone pour que
 * chaque fragment de colonne retrouve ses marges intérieures en haut de page 2.
 */
const SIDEBAR = "68mm";
const CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Helvetica Neue", Arial, "Liberation Sans", sans-serif;
       font-size: 9.4pt; line-height: 1.4; color: #243b53; }
@media print {
  html { background: linear-gradient(to right, #1a237e 0, #1a237e ${SIDEBAR}, #fff ${SIDEBAR}); }
}
.sheet { display: grid; grid-template-columns: ${SIDEBAR} 1fr; }
@media screen { .sheet { background: linear-gradient(to right, #1a237e 0, #1a237e ${SIDEBAR}, #fff ${SIDEBAR}); } }
aside, main { padding: 13mm 7mm 12mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
aside { color: #e8eaf6; }
main { padding-left: 9mm; padding-right: 12mm; }
a { color: inherit; text-decoration: none; }
.photo { width: 34mm; height: 34mm; border-radius: 50%; object-fit: cover; display: block;
         margin: 0 auto 6mm; border: 3px solid rgba(255,255,255,.35); }
aside h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: 1.6px; color: #90caf9;
           margin: 0 0 5px; padding-bottom: 3px; border-bottom: 1px solid rgba(144,202,249,.35); }
aside .block { margin-bottom: 6mm; break-inside: avoid; }
aside .item { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin: 3px 0; }
aside .cat { font-size: 8pt; color: #c5cae9; margin: 5px 0 1px; font-weight: 600; }
aside .contact-line { margin: 3px 0; word-break: break-word; font-size: 8.6pt; }
.dots { display: inline-flex; gap: 2.5px; flex-shrink: 0; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.25); }
.dot.on { background: #90caf9; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { border: 1px solid rgba(144,202,249,.5); border-radius: 10px; padding: 1px 7px; font-size: 8pt; }
header { margin-bottom: 7mm; }
h1 { font-size: 25pt; line-height: 1.1; margin: 0; color: #1a237e; font-weight: 800; letter-spacing: -.3px; }
.headline { font-size: 11.5pt; color: #0d47a1; margin-top: 3px; font-weight: 600; }
main h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1.6px; color: #1a237e;
          margin: 0 0 6px; display: flex; align-items: center; gap: 8px; break-after: avoid; }
main h2::after { content: ""; flex: 1; height: 2px; background: linear-gradient(to right, #0d47a1, transparent); }
main section { margin-bottom: 6mm; }
.entry { position: relative; padding-left: 12px; margin-bottom: 7px; break-inside: avoid;
         border-left: 2px solid #bbdefb; }
.entry::before { content: ""; position: absolute; left: -5px; top: 4px; width: 8px; height: 8px;
                 border-radius: 50%; background: #0d47a1; }
.title { font-weight: 700; color: #102a43; }
.org { color: #0d47a1; font-weight: 600; }
.date { font-size: 8.4pt; color: #627d98; }
p { margin: 2px 0; }
ul { margin: 3px 0 0; padding-left: 14px; }
li { margin: 1px 0; }
.tech { display: flex; flex-wrap: wrap; gap: 3px; margin: 3px 0; }
.tech span { background: #e3f2fd; color: #0d47a1; border-radius: 3px; padding: 0 5px; font-size: 7.8pt; }
${SCREEN_PREVIEW_CSS}
`;

function sidebar(doc: CvDocument): string {
  const { data, lang, sections } = doc;
  const L = LABELS[lang];
  const p = data.profile;
  const by = (cat: SkillCategory) => data.skills.filter((s) => s.category === cat);

  const contact = join([
    p.email && `<div class="contact-line">✉ ${link(`mailto:${p.email}`, p.email)}</div>`,
    p.phone && `<div class="contact-line">☎ ${escapeHtml(p.phone)}</div>`,
    p.city && `<div class="contact-line">⌂ ${escapeHtml(p.city)}</div>`,
    p.linkedinUrl && `<div class="contact-line">in ${link(p.linkedinUrl)}</div>`,
    p.githubUrl && `<div class="contact-line">⌥ ${link(p.githubUrl)}</div>`,
    p.websiteUrl && `<div class="contact-line">⊕ ${link(p.websiteUrl)}</div>`,
  ]);

  const technical = (["langage", "framework", "outil"] as const)
    .map((cat) => {
      const list = by(cat);
      if (!list.length) return "";
      return `<div class="cat">${L.categories[cat]}</div>${list
        .map((s) => `<div class="item"><span>${escapeHtml(s.name)}</span>${levelDots(s.level)}</div>`)
        .join("")}`;
    })
    .join("");

  const showSkills = sections.includes("skills");
  const languages = showSkills ? by("langue") : [];
  const soft = showSkills ? by("soft_skill") : [];

  // Une photo relative (/images/…) n'est pas joignable par Chromium : URL absolue uniquement
  const photo = p.photoUrl && /^https?:\/\//.test(p.photoUrl);

  return `<aside>
    ${photo ? `<img class="photo" src="${escapeHtml(p.photoUrl)}" alt="">` : ""}
    ${contact ? `<div class="block"><h3>${L.contact}</h3>${contact}</div>` : ""}
    ${showSkills && technical ? `<div class="block"><h3>${L.sections.skills}</h3>${technical}</div>` : ""}
    ${
      languages.length
        ? `<div class="block"><h3>${L.categories.langue}</h3>${languages
            .map((s) => `<div class="item"><span>${escapeHtml(s.name)}</span>${levelDots(s.level)}</div>`)
            .join("")}</div>`
        : ""
    }
    ${
      soft.length
        ? `<div class="block"><h3>${L.categories.soft_skill}</h3><div class="chips">${soft
            .map((s) => `<span class="chip">${escapeHtml(s.name)}</span>`)
            .join("")}</div></div>`
        : ""
    }
    ${
      sections.includes("certifications")
        ? `<div class="block"><h3>${L.sections.certifications}</h3>${data.certifications
            .map(
              (c) =>
                `<div class="contact-line"><b>${escapeHtml(c.name)}</b>${
                  c.issuer ? `<br><span style="opacity:.8">${escapeHtml(c.issuer)}</span>` : ""
                }${c.issueDate ? ` · ${formatMonth(c.issueDate, lang)}` : ""}</div>`,
            )
            .join("")}</div>`
        : ""
    }
  </aside>`;
}

function mainSection(doc: CvDocument, section: CvSection): string {
  const { data, lang } = doc;
  const L = LABELS[lang];
  const h2 = `<h2>${L.sections[section]}</h2>`;
  switch (section) {
    case "profile":
      return `<section>${h2}${paragraphs(data.profile.bio)}</section>`;
    case "experiences":
      return `<section>${h2}${data.experiences
        .map(
          (e) => `<div class="entry">
            <div><span class="title">${escapeHtml(e.position)}</span> · <span class="org">${escapeHtml(e.company)}</span></div>
            <div class="date">${formatPeriod(e.startDate, e.endDate, lang)}</div>
            ${paragraphs(e.description)}
            ${e.achievements.length ? `<ul>${e.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
          </div>`,
        )
        .join("")}</section>`;
    case "education":
      return `<section>${h2}${data.education
        .map(
          (e) => `<div class="entry">
            <div><span class="title">${escapeHtml(e.degree)}</span> · <span class="org">${escapeHtml(e.school)}</span></div>
            <div class="date">${formatPeriod(e.startDate, e.endDate, lang)}</div>
            ${paragraphs(e.description)}
          </div>`,
        )
        .join("")}</section>`;
    case "projects":
      return `<section>${h2}${data.projects
        .map(
          (p) => `<div class="entry">
            <div><span class="title">${escapeHtml(p.title)}</span>
              <span class="date">${join([link(p.repoUrl, L.repository), link(p.demoUrl, L.demo)], " · ")}</span></div>
            ${p.technologies.length ? `<div class="tech">${p.technologies.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>` : ""}
            ${paragraphs(p.description)}
          </div>`,
        )
        .join("")}</section>`;
    default:
      return ""; // compétences et certifications sont dans la barre latérale
  }
}

export function renderModern(doc: CvDocument): string {
  const p = doc.data.profile;
  return `<!doctype html><html lang="${doc.lang}"><head><meta charset="utf-8">
<title>CV – ${escapeHtml(p.fullName)}</title><style>${CSS}</style></head>
<body><div class="sheet">
  ${sidebar(doc)}
  <main>
    <header>
      <h1>${escapeHtml(p.fullName)}</h1>
      ${p.headline ? `<div class="headline">${escapeHtml(p.headline)}</div>` : ""}
    </header>
    ${doc.sections.map((s) => mainSection(doc, s)).join("\n")}
  </main>
</div></body></html>`;
}
