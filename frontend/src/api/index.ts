import type {
  Certification,
  CurrentUser,
  CvLang,
  CvSection,
  CvTemplate,
  Education,
  Experience,
  PortfolioData,
  PortfolioSettings,
  Profile,
  Project,
  Skill,
} from "../types/portfolio";
import { api, apiText, downloadFile } from "./client";

/** Fonctions typées pour chaque point d'accès de l'API (cf. docs/API.md). */

// ------------------------------------------------------------ auth
export const authApi = {
  me: () => api<{ user: CurrentUser }>("/api/auth/me"),
  login: (email: string, password: string) =>
    api<{ user: CurrentUser }>("/api/auth/login", "POST", { email, password }),
  register: (fullName: string, email: string, password: string) =>
    api<{ user: CurrentUser }>("/api/auth/register", "POST", { fullName, email, password }),
  logout: () => api<void>("/api/auth/logout", "POST"),
  changePassword: (currentPassword: string, newPassword: string) =>
    api<void>("/api/auth/password", "PUT", { currentPassword, newPassword }),
  deleteAccount: (password: string) => api<void>("/api/auth/account", "DELETE", { password }),
};

// ------------------------------------------------------------ profil
export type ProfileInput = Omit<Profile, never>;
export const profileApi = {
  get: () => api<{ profile: Profile; settings: PortfolioSettings }>("/api/profile"),
  update: (profile: ProfileInput) => api<{ profile: Profile }>("/api/profile", "PUT", profile),
  updateSettings: (settings: PortfolioSettings) =>
    api<{ settings: PortfolioSettings }>("/api/profile/settings", "PUT", settings),
};

// ------------------------------------------------------------ contenu (CRUD générique)
export type ResourceName = "experiences" | "education" | "skills" | "projects" | "certifications";
export interface ResourceTypes {
  experiences: Experience;
  education: Education;
  skills: Skill;
  projects: Project;
  certifications: Certification;
}
/** Données envoyées à la création / modification : sans id ni sortOrder (gérés par le serveur). */
export type ResourceInput<R extends ResourceName> = Omit<ResourceTypes[R], "id" | "sortOrder">;

export function resourceApi<R extends ResourceName>(name: R) {
  const base = `/api/${name}`;
  return {
    list: () => api<ResourceTypes[R][]>(base),
    create: (data: ResourceInput<R>) => api<ResourceTypes[R]>(base, "POST", data),
    update: (id: number, data: ResourceInput<R>) => api<ResourceTypes[R]>(`${base}/${id}`, "PUT", data),
    remove: (id: number) => api<void>(`${base}/${id}`, "DELETE"),
    reorder: (ids: number[]) => api<void>(`${base}/reorder`, "PUT", { ids }),
  };
}

// ------------------------------------------------------------ public
export const publicApi = {
  portfolio: (slug: string) => api<PortfolioData>(`/api/public/${encodeURIComponent(slug)}`),
  contact: (slug: string, msg: { name: string; email: string; subject: string; message: string }) =>
    api<{ ok: true }>(`/api/public/${encodeURIComponent(slug)}/contact`, "POST", msg),
  downloadCv: (slug: string, template: CvTemplate = "modern") =>
    downloadFile(`/api/public/${encodeURIComponent(slug)}/cv?template=${template}`, "CV.pdf"),
};

// ------------------------------------------------------------ CV
export interface CvChoice {
  template: CvTemplate;
  lang: CvLang;
  sections: CvSection[];
  /** éléments masqués : { experiences: [3, 5] } */
  hidden: Partial<Record<CvSection, number[]>>;
}

/** Sérialise les choix en query string : ?template=…&lang=…&sections=…&hide=experiences:3 */
export function cvQuery(choice: CvChoice): string {
  const hide = Object.entries(choice.hidden).flatMap(([section, ids]) => (ids ?? []).map((id) => `${section}:${id}`));
  const params = new URLSearchParams({
    template: choice.template,
    lang: choice.lang,
    sections: choice.sections.join(","),
  });
  if (hide.length) params.set("hide", hide.join(","));
  return params.toString();
}

export const cvApi = {
  preview: (choice: CvChoice) => apiText(`/api/cv/preview?${cvQuery(choice)}`),
  download: (choice: CvChoice) => downloadFile(`/api/cv/download?${cvQuery(choice)}`, "CV.pdf"),
  downloadJson: () => downloadFile("/api/cv/json", "CV.json"),
};

// ------------------------------------------------------------ statistiques
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
}
export const statsApi = {
  get: () => api<{ visits: number; messages: ContactMessage[] }>("/api/stats"),
};
