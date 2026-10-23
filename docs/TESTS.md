# Rapport de tests

Date d'exécution : 23 octobre 2026 · Node.js 22 · PostgreSQL 16 · Redis 7 · Chromium (Puppeteer)

## Synthèse

| Projet | Outil | Tests | Résultat |
|---|---|---|---|
| Backend : unitaires | Vitest | 40 | ✅ tous réussis |
| Backend : intégration (vraie base PostgreSQL + Redis + génération PDF) | Vitest + Supertest | 17 | ✅ tous réussis |
| Frontend : composants et utilitaires | Vitest + React Testing Library | 9 | ✅ tous réussis |
| **Total** | | **66** | ✅ |

Qualité du code (aucune erreur) :

| Vérification | Backend | Frontend |
|---|---|---|
| TypeScript `strict` (`tsc --noEmit`) | ✅ | ✅ (3 projets : app, intro 3D, config Vite) |
| ESLint | ✅ 0 erreur | ✅ 0 erreur (4 avertissements « fast refresh », sans impact) |
| Prettier (`--check`) | ✅ | ✅ |
| Build de production | ✅ `tsc` | ✅ `vite build` |

## Couverture des exigences du cahier des charges

| Exigence | Où c'est testé |
|---|---|
| RF-01 inscription, hachage bcrypt | `auth.test.ts` (hachage, sel aléatoire, règles du mot de passe) · intégration (inscription, doublon 409) |
| RF-02 connexion / déconnexion, sessions Redis | `auth.test.ts` (création, expiration, révocation) · intégration (cookie httpOnly, déconnexion = 401 ensuite) |
| RF-03 changement de mot de passe | intégration (mauvais mot de passe refusé, nouveau mot de passe accepté) |
| RF-04 suppression du compte et des données | intégration (cascade SQL vérifiée, portfolio public en 404) |
| §4.2 CRUD + ordre d'affichage | intégration (création, modification, réordonnancement, suppression, isolation entre comptes) |
| RF-11 public / privé | intégration (portfolio privé = 404) |
| RF-13 cache Redis + invalidation | intégration (`X-Cache` MISS → HIT → MISS après modification) |
| RF-20 / RF-25 PDF `CV_Prenom_Nom.pdf` | `cv.test.ts` (nom de fichier, accents) · intégration (vrai PDF généré par Chromium) |
| RF-21 deux modèles | `cv.test.ts` (classique et moderne, rendus différents) |
| RF-22 choix des sections et éléments | `cv.test.ts` (filtrage) · intégration (aperçu sans la section décochée) · frontend (`cvQuery`) |
| RF-23 aperçu | intégration (`/api/cv/preview` renvoie le HTML) |
| RF-24 une ou deux pages | `cv.test.ts` (comptage des pages) · intégration (`X-CV-Pages` ≤ 2) |
| RF-26 PDF en cache (utilisateur + modèle + version) | `cv.test.ts` (format de clé, nouvelle version = nouvelle clé) · intégration (MISS → HIT → MISS) |
| RF-27 (bonus) export JSON Resume | `cv.test.ts` · intégration |
| RF-28 (bonus) FR / EN | `cv.test.ts` (titres et dates traduits) |
| Sécurité : validation Zod, XSS | `schemas.test.ts` · `cv.test.ts` (échappement HTML) |
| Bonus : limitation du débit | intégration (seuls les échecs comptent) · frontend (erreur 429 affichée) |

## Lancer les tests

```bash
# Avec Docker (services démarrés par docker compose up)
docker compose exec backend npm test                    # unitaires
docker compose exec backend npm run test:integration    # + intégration et PDF
docker compose exec frontend npm test

# En local
cd backend  && npm test
cd frontend && npm test
```

## Détail : backend (57 tests)

| Fichier | Suite | Test | Résultat |
|---|---|---|---|
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | refuse l'accès au tableau de bord sans session (401) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | inscrit un utilisateur et ouvre une session httpOnly (RF-01, RF-02) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | refuse un second compte avec le même courriel (409) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | ne compte que les échecs dans la limite anti force brute | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | refuse un mauvais mot de passe sans révéler si le compte existe | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | valide les données reçues (400 + détail des champs) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | CRUD des expériences et réordonnancement (§4.2) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | isole les données entre utilisateurs | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | un portfolio privé est introuvable publiquement (RF-11) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | met en cache le portfolio public et l'invalide à chaque modification (RF-13) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | refuse le téléchargement public du CV si l'étudiant ne l'autorise pas | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | renvoie l'aperçu HTML du CV selon le gabarit et les sections (RF-22, RF-23) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | exporte le CV en JSON Resume (bonus RF-27) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | génère le PDF, puis le sert depuis le cache Redis (RF-20, RF-25, RF-26) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | change le mot de passe (RF-03) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | la déconnexion supprime la session dans Redis (RF-02) | ✅ |
| `tests/integration/api.test.ts` | API (intégration PostgreSQL + Redis) | supprime le compte et toutes ses données (RF-04) | ✅ |
| `tests/cv.test.ts` | nom du fichier (RF-25) | suit le format CV_Prenom_Nom.pdf, sans accents | ✅ |
| `tests/cv.test.ts` | options de génération (RF-22) | lit les paramètres de la query string | ✅ |
| `tests/cv.test.ts` | options de génération (RF-22) | utilise des valeurs par défaut sûres | ✅ |
| `tests/cv.test.ts` | options de génération (RF-22) | refuse un gabarit inconnu | ✅ |
| `tests/cv.test.ts` | options de génération (RF-22) | retire les sections non cochées et les éléments masqués | ✅ |
| `tests/cv.test.ts` | options de génération (RF-22) | n'affiche pas une section vide (pas de titre orphelin) | ✅ |
| `tests/cv.test.ts` | gabarits HTML (RF-21) | le gabarit classic contient les données du profil | ✅ |
| `tests/cv.test.ts` | gabarits HTML (RF-21) | le gabarit modern contient les données du profil | ✅ |
| `tests/cv.test.ts` | gabarits HTML (RF-21) | les deux gabarits produisent des mises en page différentes | ✅ |
| `tests/cv.test.ts` | gabarits HTML (RF-21) | échappe le HTML saisi par l'utilisateur (protection XSS) | ✅ |
| `tests/cv.test.ts` | gabarits HTML (RF-21) | traduit les titres et les dates en anglais (bonus RF-28) | ✅ |
| `tests/cv.test.ts` | formatage | formate les dates sans décalage de fuseau horaire | ✅ |
| `tests/cv.test.ts` | formatage | affiche les niveaux en pastilles accessibles | ✅ |
| `tests/cv.test.ts` | formatage | échappe tous les caractères spéciaux | ✅ |
| `tests/cv.test.ts` | cache du PDF (RF-26) | la clé contient l'utilisateur, le gabarit et la version des données | ✅ |
| `tests/cv.test.ts` | cache du PDF (RF-26) | une modification des données (nouvelle version) change la clé | ✅ |
| `tests/cv.test.ts` | cache du PDF (RF-26) | des options différentes donnent des clés différentes | ✅ |
| `tests/cv.test.ts` | cache du PDF (RF-26) | des options équivalentes (ordre différent) donnent la même clé | ✅ |
| `tests/cv.test.ts` | PDF et exports | compte les pages d'un PDF (contrôle 1–2 pages, RF-24) | ✅ |
| `tests/cv.test.ts` | PDF et exports | exporte au format JSON Resume (bonus RF-27) | ✅ |
| `tests/auth.test.ts` | hachage des mots de passe (RF-01) | ne stocke jamais le mot de passe en clair et le vérifie correctement | ✅ |
| `tests/auth.test.ts` | hachage des mots de passe (RF-01) | produit un hachage différent à chaque appel (sel aléatoire) | ✅ |
| `tests/auth.test.ts` | sessions Redis (RF-02) | génère des jetons longs et uniques | ✅ |
| `tests/auth.test.ts` | sessions Redis (RF-02) | crée une session avec TTL et retrouve l'utilisateur | ✅ |
| `tests/auth.test.ts` | sessions Redis (RF-02) | la déconnexion invalide immédiatement le jeton | ✅ |
| `tests/auth.test.ts` | sessions Redis (RF-02) | révoque toutes les autres sessions (changement de mot de passe) | ✅ |
| `tests/auth.test.ts` | sessions Redis (RF-02) | un jeton inconnu ne donne accès à rien | ✅ |
| `tests/auth.test.ts` | validation des entrées d'authentification (Zod) | accepte une inscription valide et normalise le courriel | ✅ |
| `tests/auth.test.ts` | validation des entrées d'authentification (Zod) | refuse un mot de passe court | ✅ |
| `tests/auth.test.ts` | validation des entrées d'authentification (Zod) | refuse un mot de passe sans chiffre | ✅ |
| `tests/auth.test.ts` | validation des entrées d'authentification (Zod) | refuse un mot de passe sans lettre | ✅ |
| `tests/auth.test.ts` | validation des entrées d'authentification (Zod) | refuse un courriel invalide | ✅ |
| `tests/auth.test.ts` | validation des entrées d'authentification (Zod) | applique les règles de complexité au nouveau mot de passe | ✅ |
| `tests/auth.test.ts` | slug (RF-12) | produit une URL lisible sans accents | ✅ |
| `tests/schemas.test.ts` | validation du contenu (Zod) | accepte une expérience valide, poste actuel (sans date de fin) | ✅ |
| `tests/schemas.test.ts` | validation du contenu (Zod) | refuse une date de fin antérieure à la date de début | ✅ |
| `tests/schemas.test.ts` | validation du contenu (Zod) | refuse un format de date invalide | ✅ |
| `tests/schemas.test.ts` | validation du contenu (Zod) | limite le niveau de compétence à 1–5 et la catégorie à la liste prévue | ✅ |
| `tests/schemas.test.ts` | validation du contenu (Zod) | convertit les champs vides du profil en null et valide les URL | ✅ |
| `tests/schemas.test.ts` | validation du contenu (Zod) | n'accepte que des slugs lisibles | ✅ |

## Détail : frontend (9 tests)

| Fichier | Suite | Test | Résultat |
|---|---|---|---|
| `src/test/components.test.tsx` | <TimelineSection /> (expériences du portfolio public) | affiche chaque poste, l'entreprise, la période et les réalisations | ✅ |
| `src/test/components.test.tsx` | <TimelineSection /> (expériences du portfolio public) | ne rend rien quand il n'y a aucune entrée | ✅ |
| `src/test/components.test.tsx` | <ContactForm /> (bonus formulaire de contact) | affiche les erreurs de validation sans appeler l'API | ✅ |
| `src/test/components.test.tsx` | <ContactForm /> (bonus formulaire de contact) | envoie un message valide puis affiche la confirmation | ✅ |
| `src/test/components.test.tsx` | <ContactForm /> (bonus formulaire de contact) | affiche l'erreur renvoyée par le serveur (ex. limite de débit 429) | ✅ |
| `src/test/components.test.tsx` | utilitaires | valide le formulaire de contact | ✅ |
| `src/test/components.test.tsx` | utilitaires | formate une période en français | ✅ |
| `src/test/components.test.tsx` | utilitaires | sérialise les choix du CV dans la query string attendue par l'API | ✅ |
| `src/test/contract.test.ts` | contrat partagé frontend / backend | frontend/src/types/portfolio.ts est identique à la version du backend | ✅ |
