import type { PoolClient } from "pg";

/**
 * Transforme un nom en slug lisible et unique (RF-12).
 *   "Demba Sow"      -> "demba-sow"
 *   "Éloïse D'Amour" -> "eloise-d-amour"
 * En cas de collision : "demba-sow-2", "demba-sow-3", …
 */
export function toSlug(text: string): string {
  const slug = text
    .normalize("NFD") // sépare les lettres de leurs accents…
    .replace(/[̀-ͯ]/g, "") // … puis supprime les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug.length >= 3 ? slug : `portfolio-${slug || "user"}`;
}

export async function slugify(text: string, client: PoolClient): Promise<string> {
  const base = toSlug(text);
  const { rows } = await client.query<{ slug: string }>("SELECT slug FROM users WHERE slug = $1 OR slug LIKE $2", [
    base,
    `${base}-%`,
  ]);
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
