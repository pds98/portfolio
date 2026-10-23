import puppeteer, { type Browser } from "puppeteer-core";
import { config } from "../config.js";

/**
 * Conversion HTML -> PDF avec Puppeteer (Chromium sans interface).
 *
 * - « puppeteer-core » : n'embarque pas son propre Chromium (≈170 Mo) ; on
 *   utilise celui installé par apk dans l'image Docker (PUPPETEER_EXECUTABLE_PATH).
 * - Un seul navigateur est lancé puis réutilisé (lancer Chromium coûte ~1 s) ;
 *   chaque génération ouvre simplement un nouvel onglet.
 */
let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        executablePath: config.chromiumPath,
        headless: true,
        // --no-sandbox : requis quand Chromium tourne en root dans un conteneur
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
      })
      .then((browser) => {
        // Si Chromium plante, on le relancera à la prochaine demande
        browser.on("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((err: unknown) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

/** Nombre de pages d'un PDF (compte les objets /Type /Page, hors /Pages). */
export function countPdfPages(pdf: Buffer): number {
  return (pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-z])/g) ?? []).length;
}

export async function htmlToPdf(html: string, scale = 1): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.emulateMediaType("print");
    // « load » + délai max : une image distante injoignable ne bloque pas la génération
    await page.setContent(html, { waitUntil: "load", timeout: 15_000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true, // nécessaire pour la barre latérale colorée du gabarit moderne
      preferCSSPageSize: true, // respecte les marges @page définies par chaque gabarit
      scale,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

/**
 * RF-24 : le CV doit tenir sur 1 ou 2 pages. Si le contenu déborde, on réduit
 * progressivement l'échelle (90 %, 80 %, 72 %) plutôt que de tronquer.
 */
export async function htmlToPdfFitted(html: string, maxPages = 2): Promise<{ pdf: Buffer; pages: number }> {
  let pdf: Buffer = Buffer.alloc(0);
  let pages = 0;
  for (const scale of [1, 0.9, 0.8, 0.72]) {
    pdf = await htmlToPdf(html, scale);
    pages = countPdfPages(pdf);
    if (pages <= maxPages) break;
  }
  return { pdf, pages };
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    browserPromise = null;
    await browser?.close();
  }
}
