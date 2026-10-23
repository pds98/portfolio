-- =============================================================================
--  Portfolio professionnel – schéma PostgreSQL 16
--  Exécuté automatiquement par l'image postgres au premier démarrage
--  (montage ./backend/db -> /docker-entrypoint-initdb.d, ordre alphabétique :
--   init.sql puis seed.sql).
--
--  Conventions :
--   - toutes les tables de contenu référencent users(id) avec ON DELETE CASCADE
--     => supprimer un compte supprime toutes ses données (RF-04) ;
--   - sort_order permet de réordonner les éléments depuis le tableau de bord ;
--   - users.data_version est incrémentée à chaque modification du contenu :
--     elle entre dans la clé de cache Redis des PDF (RF-26).
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  slug              VARCHAR(100) UNIQUE NOT NULL
                    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_public         BOOLEAN NOT NULL DEFAULT FALSE,
  -- Le visiteur peut-il télécharger le CV depuis le portfolio public ? (§3)
  allow_cv_download BOOLEAN NOT NULL DEFAULT FALSE,
  -- Version des données : incrémentée à chaque écriture (clé de cache du CV)
  data_version      INT NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id           SERIAL PRIMARY KEY,
  user_id      INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name    VARCHAR(150) NOT NULL,
  headline     VARCHAR(200),
  bio          TEXT,
  -- Courriel de contact affiché publiquement (distinct du courriel de connexion)
  email        VARCHAR(255),
  phone        VARCHAR(30),
  city         VARCHAR(100),
  linkedin_url TEXT,
  github_url   TEXT,
  website_url  TEXT,
  photo_url    TEXT
);

CREATE TABLE IF NOT EXISTS experiences (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position     VARCHAR(150) NOT NULL,
  company      VARCHAR(150) NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE,                         -- NULL = poste actuel
  description  TEXT,
  achievements TEXT[] NOT NULL DEFAULT '{}', -- réalisations (puces du CV)
  sort_order   INT NOT NULL DEFAULT 0,
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS education (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  degree      VARCHAR(150) NOT NULL,
  school      VARCHAR(150) NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS skills (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  category   VARCHAR(50) NOT NULL DEFAULT 'outil'
             CHECK (category IN ('langage', 'framework', 'outil', 'langue', 'soft_skill')),
  level      SMALLINT CHECK (level BETWEEN 1 AND 5),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  repo_url     TEXT,
  demo_url     TEXT,
  image_url    TEXT,
  sort_order   INT NOT NULL DEFAULT 0
);

-- Section optionnelle du cahier des charges (§4.2)
CREATE TABLE IF NOT EXISTS certifications (
  id             SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           VARCHAR(150) NOT NULL,
  issuer         VARCHAR(150),
  issue_date     DATE,
  credential_url TEXT,
  sort_order     INT NOT NULL DEFAULT 0
);

-- Bonus : statistiques de visites (compteur Redis, persisté périodiquement ici)
CREATE TABLE IF NOT EXISTS portfolio_visits (
  user_id    INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total      BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bonus : formulaire de contact (limité en débit via Redis)
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(200),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index : toutes les lectures filtrent par utilisateur et trient par sort_order
CREATE INDEX IF NOT EXISTS idx_experiences_user    ON experiences    (user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_education_user      ON education      (user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_skills_user         ON skills         (user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_user       ON projects       (user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_certifications_user ON certifications (user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_messages_user       ON contact_messages (user_id, created_at DESC);
