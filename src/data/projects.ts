import { Project } from '../core/models/Project';

/**
 * Source unique des projets affichés dans la section « Mes Projets ».
 *
 * Règles d'affichage (voir ProjectsSection.tsx) :
 *  - githubUrl / demoUrl vides  → le bouton correspondant n'est pas affiché ;
 *  - image vide                 → la carte affiche un en-tête dégradé avec les
 *                                 initiales du projet (pas d'image cassée).
 *
 * Pour ajouter une capture : déposer le fichier dans public/images/projects/
 * puis renseigner son chemin dans le champ `image`.
 */
export const projects: Project[] = [
    new Project({
        id: 1,
        title: "Smart Tax Collect – Recouvrement fiscal",
        shortDescription: "Plateforme municipale de recouvrement des taxes sur les activités économiques informelles, destinée aux mairies.",
        longDescription: `Digitalisation de la collecte des taxes auprès des vendeurs ambulants, tabliers et commerçants.
        Trois composants reliés par une API REST :
        - Interface web de la mairie : tableau de bord des recettes, taux de conformité, carte interactive des commerçants, export CSV, gestion des agents et de la grille tarifaire ;
        - Application mobile des agents collecteurs : scan du badge QR avec alerte fraude, encaissement espèces / Mobile Money avec reçu QR, enregistrement géolocalisé ;
        - Mode hors ligne complet avec synchronisation idempotente (aucun doublon possible).`,
        technologies: ["Node.js", "Express", "JWT", "Flutter", "Dart", "SQLite", "Chart.js", "Leaflet", "Fly.io"],
        githubUrl: "",
        demoUrl: "https://smart-tax-collect.fly.dev",
        image: ""
    }),
    new Project({
        id: 2,
        title: "Gorée Island – Billetterie numérique",
        shortDescription: "Billetterie en ligne pour la chaloupe et le site de l'île de Gorée : paiement carte ou Wave, QR code scanné à l'embarquement.",
        longDescription: `Application permettant d'acheter en ligne ses billets pour l'île de Gorée (Sénégal) au lieu de faire la file sur place.
        - Deux parcours distincts : chaloupe (tarif unique) et entrée du site (tarifs national / international) ;
        - Vérification d'identité des visiteurs nationaux et contrôle anti-doublon ;
        - QR code distinct par billet, scanné sur place, avec détection de fraude (double scan) ;
        - Dépôts séparés : API (goree-island-backend) et application visiteur (goree-island-mobile).`,
        technologies: ["FastAPI", "Python", "PostgreSQL", "React Native", "Expo", "Docker"],
        githubUrl: "https://github.com/pds98/goree-island-backend",
        demoUrl: "",
        image: ""
    }),
    new Project({
        id: 3,
        title: "Portfolio professionnel + générateur de CV",
        shortDescription: "Application full-stack : portfolio public, espace privé d'édition et génération de CV PDF.",
        longDescription: `Le portfolio public est consultable sans connexion par les employeurs ; l'espace privé permet de saisir le contenu
        (expériences, formations, compétences, projets) et de générer un CV PDF selon plusieurs gabarits.
        - API Express en TypeScript, sessions et cache du portfolio public dans Redis ;
        - Base PostgreSQL ;
        - Déploiement Docker multi-étapes avec healthchecks et intégration continue.`,
        technologies: ["React", "TypeScript", "Express", "PostgreSQL", "Redis", "Docker"],
        githubUrl: "https://github.com/pds98/portfolio/tree/portfolio-cv",
        demoUrl: "",
        image: "/images/projects/portfolio.jpg"
    }),
    new Project({
        id: 4,
        title: "L'Atelier de la prédiction",
        shortDescription: "Démonstration interactive qui montre comment une intelligence artificielle apprend, puis prédit.",
        longDescription: `Application pédagogique d'apprentissage automatique présentée au public lors des portes ouvertes
        du Collège LaSalle (projet P6, cours 420-TT4 Tendances technologiques).
        - Visualisation de l'apprentissage du modèle : les points verts et orange montrent, étape par étape, comment il classe les données ;
        - Affichage des prédictions et de leurs résultats ;
        - Mise en évidence des facteurs dont dépend la prédiction, pour rendre l'IA compréhensible par tous.`,
        technologies: ["React", "Machine learning", "Visualisation de données"],
        githubUrl: "",
        demoUrl: "",
        image: ""
    }),
    new Project({
        id: 5,
        title: "propersoIA – Assistant de productivité",
        shortDescription: "Surveille la concentration par webcam et alerte l'utilisateur dès qu'il se déconcentre.",
        longDescription: `Assistant de productivité intelligent basé sur la vision par ordinateur.
        - Détection du visage en temps réel via la webcam ;
        - Statut de concentration affiché par un cadre vert / orange / rouge et alertes en cas de distraction ;
        - Score de productivité et historique des sessions sauvegardés en JSON ;
        - Architecture MVC (modèles, vues, contrôleurs).`,
        technologies: ["Python", "OpenCV", "NumPy", "MVC"],
        githubUrl: "",
        demoUrl: "",
        image: ""
    }),
    new Project({
        id: 6,
        title: "MindCare",
        shortDescription: "Application web de bien-être mental : services, ressources, articles et témoignages.",
        longDescription: `Site Django structuré autour d'une application principale et d'un système d'héritage de gabarits.
        - Modèles Article et Témoignage administrables depuis l'interface d'administration Django ;
        - Pages Accueil, Services, Ressources et Contact ;
        - Interface Bootstrap 5 responsive.`,
        technologies: ["Django", "Python", "Bootstrap", "SQLite"],
        githubUrl: "",
        demoUrl: "",
        image: ""
    }),
    new Project({
        id: 7,
        title: "Teranga – Site vitrine",
        shortDescription: "Site d'une entreprise de services immobiliers : peinture, entretien, réparations, TI et sécurité incendie.",
        longDescription: `Site vitrine conçu et déployé pour Teranga, entreprise de services aux gestionnaires d'immeubles,
        avec galerie de réalisations avant / après. Hébergé sur GitHub Pages.`,
        technologies: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
        githubUrl: "https://github.com/pds98/teranga-site",
        demoUrl: "https://pds98.github.io/teranga-site/",
        image: ""
    }),
    new Project({
        id: 8,
        title: "GestPriere",
        shortDescription: "Application de gestion et de réservation de salles de prière, réalisée en équipe.",
        longDescription: `Application mobile connectée à une API REST.
        - Backend Spring Boot (entités JPA, sérialisation JSON) ;
        - Application mobile React Native ;
        - Travail d'équipe sous Git.`,
        technologies: ["Spring Boot", "Java", "React Native"],
        githubUrl: "",
        demoUrl: "",
        image: ""
    }),
    new Project({
        id: 9,
        title: "OpenClaw",
        shortDescription: "Bot WhatsApp branché sur l'API Claude, avec boucle agentique et appels d'outils.",
        longDescription: `Assistant conversationnel sur WhatsApp propulsé par un modèle de langage.
        - Boucle agentique et architecture d'appels d'outils ;
        - Passerelle multi-machines (Windows et macOS) via WebSocket ;
        - Supervision des processus avec PM2.`,
        technologies: ["Node.js", "API Claude", "WebSocket", "PM2"],
        githubUrl: "",
        demoUrl: "",
        image: ""
    })
];
