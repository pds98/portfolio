/**
 * Client HTTP minimal autour de fetch.
 *  - credentials: "include" : envoie le cookie de session httpOnly à l'API
 *    (localhost:5173 -> localhost:3000 = même site, cookie SameSite=Lax accepté) ;
 *  - toute réponse non 2xx est transformée en ApiError avec le message du serveur.
 */
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function raw(path: string, method: Method = "GET", body?: unknown): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Impossible de joindre l'API. Le backend est-il démarré ?");
  }
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string; details?: FieldError[] };
    throw new ApiError(res.status, payload.error ?? `Erreur ${res.status}`, payload.details ?? []);
  }
  return res;
}

export async function api<T>(path: string, method: Method = "GET", body?: unknown): Promise<T> {
  const res = await raw(path, method, body);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiText(path: string): Promise<string> {
  return (await raw(path)).text();
}

/**
 * Télécharge un fichier (PDF, JSON) en respectant le nom envoyé par le serveur
 * dans Content-Disposition (ex. CV_Demba_Sow.pdf, RF-25).
 */
export async function downloadFile(
  path: string,
  fallbackName: string,
): Promise<{ filename: string; headers: Headers }> {
  const res = await raw(path);
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { filename, headers: res.headers };
}
