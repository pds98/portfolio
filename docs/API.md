# Documentation de l'API

Base : `http://localhost:3000`. Corps et réponses en JSON (sauf PDF et aperçu HTML).

**Authentification.** Les routes 🔒 exigent le cookie de session `sid` (httpOnly), posé par `/api/auth/register` ou `/api/auth/login`. Côté navigateur : `fetch(url, { credentials: "include" })`. Sans session valide : `401`.

**Erreurs.** Format commun `{ "error": "message" }`. Les erreurs de validation (400) ajoutent `details: [{ field, message }]`.

| Code | Signification |
|---|---|
| 400 | Données invalides (Zod) ou mot de passe actuel incorrect |
| 401 | Non connecté / session expirée / identifiants incorrects |
| 403 | Action non autorisée (ex. téléchargement public du CV désactivé) |
| 404 | Ressource introuvable, ou appartenant à un autre utilisateur |
| 409 | Courriel ou slug déjà utilisé |
| 429 | Trop de requêtes (limitation du débit Redis) |

---

## Santé

| Méthode | Route | Description | Réponse |
|---|---|---|---|
| GET | `/api/health` | État de PostgreSQL et de Redis | `{ status: "ok", postgres: "up", redis: "up" }` (503 si un service est en panne) |

## Authentification (RF-01 à RF-04)

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, email, password }` | `201 { user }` + cookie. Mot de passe : 8 car. min., une lettre, un chiffre. Limite : 20 / h / IP |
| POST | `/api/auth/login` | `{ email, password }` | `200 { user }` + cookie. Limite : 10 échecs / 15 min / IP |
| POST | `/api/auth/logout` | – | `204`, la session est supprimée de Redis |
| GET 🔒 | `/api/auth/me` | – | `{ user: { id, email, slug, fullName, isPublic } }` |
| PUT 🔒 | `/api/auth/password` | `{ currentPassword, newPassword }` | `204`, les autres sessions sont révoquées |
| DELETE 🔒 | `/api/auth/account` | `{ password }` | `204`, compte, données et caches supprimés |

## Profil et publication

| Méthode | Route | Corps / réponse |
|---|---|---|
| GET 🔒 | `/api/profile` | `{ profile, settings }` |
| PUT 🔒 | `/api/profile` | `{ fullName, headline, bio, email, phone, city, linkedinUrl, githubUrl, websiteUrl, photoUrl }` (champs facultatifs : `""` → `null`) |
| PUT 🔒 | `/api/profile/settings` | `{ slug, isPublic, allowCvDownload }`. RF-11, RF-12. `409` si le slug est pris |

## Contenu du portfolio (CRUD, §4.2)

Même interface pour les 5 ressources : `experiences`, `education`, `skills`, `projects`, `certifications`.

| Méthode | Route | Description |
|---|---|---|
| GET 🔒 | `/api/{ressource}` | Liste triée par `sortOrder` |
| GET 🔒 | `/api/{ressource}/:id` | Un élément |
| POST 🔒 | `/api/{ressource}` | Création (placé en dernière position) → `201` |
| PUT 🔒 | `/api/{ressource}/:id` | Modification complète |
| PUT 🔒 | `/api/{ressource}/reorder` | `{ ids: [3, 1, 2] }`, nouvel ordre d'affichage → `204` |
| DELETE 🔒 | `/api/{ressource}/:id` | Suppression → `204` |

Champs par ressource :

| Ressource | Champs (`*` = requis) |
|---|---|
| experiences | `position*`, `company*`, `startDate*` (AAAA-MM-JJ), `endDate` (null = actuel, ≥ début), `description`, `achievements` (string[]) |
| education | `degree*`, `school*`, `startDate*`, `endDate`, `description` |
| skills | `name*`, `category*` (`langage` · `framework` · `outil` · `langue` · `soft_skill`), `level` (1–5 ou null) |
| projects | `title*`, `description`, `technologies` (string[]), `repoUrl`, `demoUrl`, `imageUrl` |
| certifications | `name*`, `issuer`, `issueDate`, `credentialUrl` |

Toute écriture invalide le cache Redis du portfolio et incrémente la version des données.

## Espace public (sans authentification)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/public/:slug` | Portfolio complet `{ settings, profile, experiences, education, skills, projects, certifications }`. **Mis en cache** (en-tête `X-Cache: HIT/MISS`). `404` si privé ou inexistant |
| GET | `/api/public/:slug/cv?template=modern` | PDF du CV, seulement si `allowCvDownload` (sinon `403`) |
| POST | `/api/public/:slug/contact` | `{ name, email, subject?, message }` → `201`. Limite : 5 / h / IP |

## Génération du CV (§4.4)

Paramètres communs (query string) :

| Paramètre | Valeurs | Défaut | Exigence |
|---|---|---|---|
| `template` | `classic` · `modern` | `classic` | RF-21 |
| `lang` | `fr` · `en` | `fr` | RF-28 |
| `sections` | liste séparée par des virgules : `profile,experiences,education,skills,projects,certifications` | toutes | RF-22 |
| `hide` | éléments à exclure `section:id`, ex. `experiences:3,projects:7` | aucun | RF-22 |

| Méthode | Route | Réponse |
|---|---|---|
| GET 🔒 | `/api/cv/preview` | `text/html` : aperçu identique au PDF (RF-23) |
| GET 🔒 | `/api/cv/download` | `application/pdf`, `Content-Disposition: attachment; filename="CV_Prenom_Nom.pdf"` (RF-25). En-têtes : `X-Cache` (RF-26), `X-CV-Pages` (RF-24) |
| GET 🔒 | `/api/cv/json` | Export JSON Resume `CV_Prenom_Nom.json` (RF-27) |

Exemple :

```bash
curl -c cookies.txt -H "Content-Type: application/json" \
     -d '{"email":"demba.sow@example.com","password":"Portfolio2026!"}' \
     http://localhost:3000/api/auth/login

curl -b cookies.txt -OJ "http://localhost:3000/api/cv/download?template=modern&lang=fr&hide=experiences:5"
# -> CV_Demba_Sow.pdf
```

## Statistiques (bonus)

| Méthode | Route | Réponse |
|---|---|---|
| GET 🔒 | `/api/stats` | `{ visits, messages: [{ id, name, email, subject, message, createdAt }] }` |
