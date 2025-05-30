import React from 'react';
import { Box, Container, Typography, Card, Divider } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { motion } from 'framer-motion';

interface Experience {
    company: string;
    role: string;
    period: string;
    tasks: string[];
    technologies: string[];
    logo?: string;
    companyUrl?: string;
    color?: string;
}

const experiences: Experience[] = [
    {
        company: 'RISC Group',
        role: "Analyste et Technicien",
        period: "Déc. 2024 – Jan. 2025",
        tasks: [
            "Analyse de données, automatisation des rapports",
            "Création de dashboards et KPI (Excel, Power BI)",
            "Support technique & assistance utilisateur",
            "Relation client et résolution de problèmes"
        ],
        technologies: ['Power BI', 'Excel', 'SQL', 'Python', 'VBA'],
        logo: '/images/companies/risc.png',
        companyUrl: 'https://www.risc.fr',
        color: '#2196f3'
    },
    {
        company: "Philip Morris International",
        role: "Analyste de Données",
        period: "Nov. 2022 – Nov. 2024",
        tasks: [
            "Automatisation de reporting business",
            "Support sur applications internes",
            "Réalisation de rapports et dashboards (Excel, Power BI)",
            "Participation à l'amélioration des outils décisionnels"
        ],
        technologies: ['Power BI', 'Excel', 'Python', 'SQL', 'Tableau'],
        logo: '/images/companies/pmi.png',
        companyUrl: 'https://www.pmi.com',
        color: '#e91e63'
    },
    {
        company: "Digital Ubuntu",
        role: "Technicien Informatique",
        period: "Janv. 2018 – Nov. 2024",
        tasks: [
            "Support informatique (logiciel et matériel)",
            "Développement et débogage d'outils internes",
            "Assistance et formation des utilisateurs",
            "Analyse et documentation technique"
        ],
        technologies: ['Linux', 'Windows', 'Python', 'Shell', 'Networking'],
        logo: '/images/companies/ubuntu.png',
        companyUrl: 'https://www.digitalubuntu.com',
        color: '#4caf50'
    },
    {
        company: "Bank Cofina",
        role: "Développeur Web",
        period: "Janv. 2021 – Nov. 2023",
        tasks: [
            "Création de prototypes UI/UX",
            "Développement web & IA",
            "Intégration d'API et test logiciel",
            "Optimisation des applications web"
        ],
        technologies: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
        logo: '/images/companies/cofina.png',
        companyUrl: 'https://www.cofinasenegal.com',
        color: '#ff9800'
    },
    {
        company: "Senar Sen Délices",
        role: "Digital Marketer & Community Manager",
        period: "Janv. 2019 – Janv. 2021",
        tasks: [
            "Gestion des réseaux sociaux et contenu visuel",
            "Création de calendriers éditoriaux",
            "Suivi des réclamations et amélioration de la visibilité digitale",
            "Réalisation d'affiches et vidéos marketing"
        ],
        technologies: ['Photoshop', 'Illustrator', 'Premiere Pro', 'Social Media', 'Analytics'],
        logo: '/images/companies/senarsen.png',
        companyUrl: 'https://www.senarsendelices.com',
        color: '#9c27b0'
    }
];

export const ExperienceSection: React.FC = () => {
    return (
        <Box 
            component="section" 
            sx={{ 
                py: 12,
                minHeight: '100vh',
                bgcolor: '#FFFFFF'
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h2"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            fontWeight: 700,
                            color: '#1a365d',
                            mb: 2
                        }}
                    >
                        Expérience Professionnelle
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: '#4a5568',
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        Parcours professionnel et projets significatifs
                    </Typography>
                </Box>

                <Timeline position="alternate">
                    {experiences.map((exp, index) => (
                        <TimelineItem key={index}>
                            <TimelineSeparator>
                                <TimelineDot 
                                    sx={{ 
                                        bgcolor: '#3182ce',
                                        boxShadow: '0 0 0 4px rgba(49, 130, 206, 0.2)',
                                        width: { xs: 12, md: 16 },
                                        height: { xs: 12, md: 16 }
                                    }}
                                />
                                <TimelineConnector sx={{ bgcolor: '#3182ce', width: 2 }} />
                            </TimelineSeparator>
                            <TimelineContent>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                >
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            bgcolor: '#ffffff',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                            {exp.logo && (
                                                <Box
                                                    component="img"
                                                    src={exp.logo}
                                                    alt={exp.company}
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 1,
                                                        objectFit: 'contain',
                                                        border: '1px solid #e2e8f0',
                                                        p: 0.5
                                                    }}
                                                />
                                            )}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography 
                                                    variant="h6"
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#2d3748',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {exp.company}
                                                </Typography>
                                                <Typography 
                                                    variant="subtitle1"
                                                    sx={{ 
                                                        color: '#3182ce',
                                                        fontWeight: 500,
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {exp.role}
                                                </Typography>
                                                <Typography 
                                                    variant="body2"
                                                    sx={{ 
                                                        color: '#718096',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {exp.period}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Box component="ul" sx={{ 
                                            pl: 2,
                                            m: 0,
                                            listStyleType: 'none'
                                        }}>
                                            {exp.tasks.map((task: string, i: number) => (
                                                <Box 
                                                    component="li" 
                                                    key={i}
                                                    sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        mb: 1.5,
                                                        '&:before': {
                                                            content: '"•"',
                                                            color: '#3182ce',
                                                            fontWeight: 'bold',
                                                            mr: 2,
                                                            mt: '2px'
                                                        }
                                                    }}
                                                >
                                                    <Typography 
                                                        variant="body2"
                                                        sx={{ 
                                                            color: '#4a5568',
                                                            lineHeight: 1.6
                                                        }}
                                                    >
                                                        {task}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Card>
                                </motion.div>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </Container>
        </Box>
    );
};
