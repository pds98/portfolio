/**
 * Utilitaires de génération HTML pour les gabarits de CV.
 * TOUTE donnée saisie par l'utilisateur passe par escapeHtml() : un nom comme
 * <script>alert(1)</script> s'affiche tel quel au lieu de s'exécuter (XSS).
 */
export function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Concatène des fragments HTML DÉJÀ échappés en ignorant les valeurs vides. */
export const join = (parts: (string | false | null | undefined)[], sep = ""): string =>
  parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(sep);

/** "https://www.linkedin.com/in/demba/" -> "linkedin.com/in/demba" (plus lisible sur papier). */
export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/** Lien cliquable dans le PDF, texte raccourci. */
export function link(url: string | null, label?: string): string {
  if (!url) return "";
  return `<a href="${escapeHtml(url)}">${escapeHtml(label ?? shortUrl(url))}</a>`;
}

/** Niveau 1–5 sous forme de pastilles ●●●○○ (accessible : aria-label). */
export function levelDots(level: number | null): string {
  if (!level) return "";
  const dots = Array.from({ length: 5 }, (_, i) => `<span class="dot${i < level ? " on" : ""}"></span>`).join("");
  return `<span class="dots" aria-label="${level}/5">${dots}</span>`;
}

/** Paragraphes : conserve les retours à la ligne saisis par l'utilisateur. */
export function paragraphs(text: string | null): string {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Styles communs à l'aperçu (écran) : la feuille A4 est centrée sur un fond gris,
 * avec un repère rouge pointillé à chaque fin de page (aide pour RF-24).
 */
export const SCREEN_PREVIEW_CSS = `
@media screen {
  html { background: #e9ecef; }
  body { margin: 0; padding: 24px 0; }
  .sheet {
    width: 210mm; min-height: 297mm; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,.18);
    position: relative; overflow: hidden;
  }
  .sheet::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 2px),
      rgba(229,57,53,.55) calc(297mm - 2px), rgba(229,57,53,.55) 297mm);
  }
}`;
