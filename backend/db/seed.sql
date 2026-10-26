-- =============================================================================
--  Données de démonstration – exécuté après init.sql (ordre alphabétique).
--  Compte : demba.sow@example.com / Portfolio2026!   (hash bcrypt, coût 12)
--  Portfolio public : http://localhost:5173/p/demba-sow
--  Contenu repris du portfolio personnel github.com/pds98/portfolio.
-- =============================================================================

INSERT INTO users (email, password_hash, slug, is_public, allow_cv_download)
VALUES (
  'demba.sow@example.com',
  '$2b$12$DyKEPIUfTAvBKH3XFy7ZlOc7/tl/AxwZQl/K68MxPzVtGpRya3cHa',
  'demba-sow',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Chaque INSERT retrouve l'id du compte démo par son slug. Les gardes
-- NOT EXISTS / ON CONFLICT rendent le script ré-exécutable sans doublons.
INSERT INTO profiles (user_id, full_name, headline, bio, email, city, linkedin_url, github_url, photo_url)
SELECT id,
       'Demba Sow',
       'Programmeur-analyste · Analyste de données',
       'Programmeur-analyste en formation et analyste de données expérimenté, je me distingue par un profil polyvalent alliant compétences techniques, sens de l''analyse et créativité visuelle. Plusieurs années d''expérience en développement web, automatisation de données et support informatique m''ont donné une vision globale des systèmes numériques et des enjeux métiers.',
       'demba.sow@example.com',
       'Montréal, QC',
       'https://www.linkedin.com/in/pape-demba-sow-8a5b3b1b2/',
       'https://github.com/pds98',
       '/images/me.PNG'
FROM users WHERE slug = 'demba-sow'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO experiences (user_id, position, company, start_date, end_date, description, achievements, sort_order)
SELECT u.id, e.position, e.company, e.start_date::date, e.end_date::date, e.description, e.achievements, e.sort_order
FROM users u
CROSS JOIN (VALUES
  ('Technicien informatique', 'Revenu Québec', '2026-05-01', NULL,
   'Soutien technique et préparation des postes de travail.',
   ARRAY['Préparation, configuration et déploiement des postes de travail',
         'Accueil technique des nouveaux employés et des retours de congé',
         'Automatisation du suivi des livraisons d''équipement en Python'], 0),
  ('Analyste et technicien', 'RISC Group', '2024-12-01', '2025-01-31',
   'Analyse de données et support technique.',
   ARRAY['Analyse de données et automatisation des rapports',
         'Création de tableaux de bord et KPI (Excel, Power BI)',
         'Support technique et assistance utilisateur'], 1),
  ('Analyste de données', 'Philip Morris International', '2022-11-01', '2024-11-30',
   'Reporting d''affaires et outils décisionnels.',
   ARRAY['Automatisation du reporting d''affaires',
         'Réalisation de rapports et tableaux de bord (Excel, Power BI)',
         'Amélioration des outils décisionnels'], 2),
  ('Développeur web', 'Bank Cofina', '2021-01-01', '2022-11-30',
   'Développement d''applications web.',
   ARRAY['Création de prototypes UI/UX',
         'Intégration d''API et tests logiciels',
         'Optimisation des applications web'], 3),
  ('Technicien informatique', 'Digital Ubuntu', '2021-01-01', '2022-11-30',
   'Support informatique logiciel et matériel.',
   ARRAY['Support informatique (logiciel et matériel)',
         'Développement et débogage d''outils internes',
         'Assistance et formation des utilisateurs'], 4)
) AS e(position, company, start_date, end_date, description, achievements, sort_order)
WHERE u.slug = 'demba-sow'
  AND NOT EXISTS (SELECT 1 FROM experiences x WHERE x.user_id = u.id);

INSERT INTO education (user_id, degree, school, start_date, end_date, description, sort_order)
SELECT u.id, e.degree, e.school, e.start_date::date, e.end_date::date, e.description, e.sort_order
FROM users u
CROSS JOIN (VALUES
  ('AEC Programmeur-analyste', 'Collège LaSalle, Montréal', '2025-09-01', '2026-12-31',
   'Développement d''applications, bases de données, architecture logicielle.', 0),
  ('Licence en génie logiciel', 'ISM, Dakar', '2015-10-01', '2018-07-31',
   'Programmation, systèmes d''information et gestion de projets.', 1)
) AS e(degree, school, start_date, end_date, description, sort_order)
WHERE u.slug = 'demba-sow'
  AND NOT EXISTS (SELECT 1 FROM education x WHERE x.user_id = u.id);

INSERT INTO skills (user_id, name, category, level, sort_order)
SELECT u.id, s.name, s.category, s.level, s.sort_order
FROM users u
CROSS JOIN (VALUES
  ('TypeScript / JavaScript', 'langage', 4, 0),
  ('Python', 'langage', 4, 1),
  ('Java', 'langage', 3, 2),
  ('SQL', 'langage', 4, 3),
  ('React', 'framework', 4, 4),
  ('Node.js / Express', 'framework', 3, 5),
  ('Spring Boot', 'framework', 3, 6),
  ('Power BI', 'outil', 5, 7),
  ('Excel avancé', 'outil', 5, 8),
  ('Docker', 'outil', 3, 9),
  ('Git', 'outil', 4, 10),
  ('Figma', 'outil', 4, 11),
  ('Français', 'langue', 5, 12),
  ('Anglais', 'langue', 3, 13),
  ('Autonomie', 'soft_skill', NULL, 14),
  ('Rigueur', 'soft_skill', NULL, 15),
  ('Esprit d''analyse', 'soft_skill', NULL, 16)
) AS s(name, category, level, sort_order)
WHERE u.slug = 'demba-sow'
  AND NOT EXISTS (SELECT 1 FROM skills x WHERE x.user_id = u.id);

INSERT INTO projects (user_id, title, description, technologies, repo_url, demo_url, image_url, sort_order)
SELECT u.id, p.title, p.description, p.technologies, p.repo_url, p.demo_url, p.image_url, p.sort_order
FROM users u
CROSS JOIN (VALUES
  ('Smart Tax Collect – Recouvrement fiscal',
   'Plateforme municipale de recouvrement des taxes sur les activités informelles : interface web de la mairie (tableau de bord, carte des commerçants, export CSV), application mobile des agents (scan QR anti-fraude, encaissement espèces / Mobile Money, reçu QR) et mode hors ligne avec synchronisation sans doublon.',
   ARRAY['Node.js', 'Express', 'JWT', 'Flutter', 'Dart', 'SQLite', 'Chart.js', 'Leaflet', 'Fly.io'],
   NULL, 'https://smart-tax-collect.fly.dev', NULL, 0),
  ('Gorée Island – Billetterie numérique',
   'Achat en ligne des billets de la chaloupe et du site de l''île de Gorée : paiement carte ou Wave, vérification d''identité, QR code scanné sur place avec détection des doubles scans.',
   ARRAY['FastAPI', 'Python', 'PostgreSQL', 'React Native', 'Expo', 'Docker'],
   'https://github.com/pds98/goree-island-backend', NULL, NULL, 1),
  ('Portfolio professionnel + générateur de CV',
   'Application full-stack : portfolio public, tableau de bord privé et génération de CV PDF avec cache Redis.',
   ARRAY['React', 'TypeScript', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
   'https://github.com/pds98/portfolio/tree/portfolio-cv', NULL, NULL, 2),
  ('L''Atelier de la prédiction',
   'Démonstration interactive d''apprentissage automatique présentée aux portes ouvertes du Collège LaSalle (projet P6, 420-TT4) : des points verts et orange montrent comment le modèle apprend, puis comment il prédit et de quels facteurs dépend le résultat.',
   ARRAY['React', 'Machine learning', 'Visualisation de données'],
   NULL, NULL, NULL, 3),
  ('propersoIA – Assistant de productivité',
   'Surveille la concentration par webcam (cadre vert / orange / rouge), alerte en cas de distraction et enregistre un score et l''historique des sessions. Architecture MVC.',
   ARRAY['Python', 'OpenCV', 'NumPy'],
   NULL, NULL, NULL, 4),
  ('MindCare',
   'Application web de bien-être mental : services, ressources, articles et témoignages administrables, interface Bootstrap responsive.',
   ARRAY['Django', 'Python', 'Bootstrap', 'SQLite'],
   NULL, NULL, NULL, 5),
  ('Teranga – Site vitrine',
   'Site d''une entreprise de services immobiliers (peinture, entretien, réparations, TI, sécurité incendie) avec galerie avant / après.',
   ARRAY['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
   'https://github.com/pds98/teranga-site', 'https://pds98.github.io/teranga-site/', NULL, 6),
  ('GestPriere',
   'Application de gestion et de réservation de salles de prière, réalisée en équipe.',
   ARRAY['Spring Boot', 'Java', 'React Native'],
   NULL, NULL, NULL, 7),
  ('OpenClaw',
   'Bot WhatsApp intégré à l''API Claude : boucle agentique, outils et passerelle multi-machines.',
   ARRAY['Node.js', 'API Claude', 'WebSocket', 'PM2'],
   NULL, NULL, NULL, 8)
) AS p(title, description, technologies, repo_url, demo_url, image_url, sort_order)
WHERE u.slug = 'demba-sow'
  AND NOT EXISTS (SELECT 1 FROM projects x WHERE x.user_id = u.id);

INSERT INTO certifications (user_id, name, issuer, issue_date, sort_order)
SELECT u.id, c.name, c.issuer, c.issue_date::date, c.sort_order
FROM users u
CROSS JOIN (VALUES
  ('Permis d''agent de sécurité (BSP)', 'Bureau de la sécurité privée', NULL, 0),
  ('Secourisme / RCR', NULL, NULL, 1)
) AS c(name, issuer, issue_date, sort_order)
WHERE u.slug = 'demba-sow'
  AND NOT EXISTS (SELECT 1 FROM certifications x WHERE x.user_id = u.id);
