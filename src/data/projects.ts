import { Project } from '../core/models/Project';

export const projects: Project[] = [
    new Project({
        id: 1,
        title: "Portfolio Personnel",
        shortDescription: "Portfolio moderne développé avec React et Material-UI",
        longDescription: `Un portfolio personnel moderne et interactif développé avec React et Material-UI. 
        Présente mes compétences, expériences et projets de manière élégante et responsive.
        
        Caractéristiques principales :
        - Design moderne et épuré
        - Animations fluides avec Framer Motion
        - Sections interactives
        - Galerie de projets filtrables
        - Mode sombre/clair
        - Formulaire de contact fonctionnel`,
        technologies: ["React", "TypeScript", "Material-UI", "Framer Motion"],
        githubUrl: "https://github.com/username/portfolio",
        demoUrl: "https://portfolio.username.com",
        image: "/images/projects/portfolio.jpg",
        gallery: [
            {
                url: "/images/projects/portfolio/home.jpg",
                caption: "Page d'accueil avec animation"
            },
            {
                url: "/images/projects/portfolio/about.jpg",
                caption: "Section À propos avec compteurs animés"
            },
            {
                url: "/images/projects/portfolio/projects.jpg",
                caption: "Galerie de projets avec filtres"
            }
        ]
    }),
    new Project({
        id: 2,
        title: "E-commerce Dashboard",
        shortDescription: "Dashboard administrateur pour une plateforme e-commerce",
        longDescription: `Dashboard administrateur complet pour gérer une plateforme e-commerce. 
        Interface utilisateur intuitive avec des graphiques en temps réel et des analyses détaillées.
        
        Fonctionnalités :
        - Tableau de bord en temps réel
        - Gestion des produits et catégories
        - Suivi des commandes
        - Analyses des ventes
        - Gestion des utilisateurs
        - Rapports personnalisables`,
        technologies: ["Angular", "NgRx", "Chart.js", "Node.js", "MongoDB"],
        githubUrl: "https://github.com/username/ecommerce-dashboard",
        demoUrl: "https://dashboard.demo.com",
        image: "/images/projects/dashboard.jpg",
        gallery: [
            {
                url: "/images/projects/dashboard/overview.jpg",
                caption: "Vue d'ensemble du tableau de bord"
            },
            {
                url: "/images/projects/dashboard/analytics.jpg",
                caption: "Page d'analyses avec graphiques"
            },
            {
                url: "/images/projects/dashboard/products.jpg",
                caption: "Gestion des produits"
            }
        ]
    }),
    new Project({
        id: 3,
        title: "Application Mobile Fitness",
        shortDescription: "Application de suivi fitness et bien-être",
        longDescription: `Application mobile complète pour le suivi d'activités physiques et de bien-être. 
        Développée avec React Native pour iOS et Android.
        
        Fonctionnalités principales :
        - Suivi des entraînements
        - Plans d'exercices personnalisés
        - Suivi de la nutrition
        - Statistiques et progrès
        - Synchronisation cloud
        - Mode hors ligne`,
        technologies: ["React Native", "Redux", "Firebase", "Node.js", "MongoDB"],
        githubUrl: "https://github.com/username/fitness-app",
        demoUrl: "https://fitness.demo.com",
        image: "/images/projects/fitness.jpg",
        gallery: [
            {
                url: "/images/projects/fitness/home.jpg",
                caption: "Écran d'accueil personnalisé"
            },
            {
                url: "/images/projects/fitness/workout.jpg",
                caption: "Suivi d'entraînement en direct"
            },
            {
                url: "/images/projects/fitness/stats.jpg",
                caption: "Statistiques et progrès"
            }
        ]
    })
];
