import React from 'react';
import { Box, Container, Typography, Grid, Paper, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import BrushIcon from '@mui/icons-material/Brush';
import SupportIcon from '@mui/icons-material/Support';
import LanguageIcon from '@mui/icons-material/Language';

interface Skill {
    name: string;
    level: number;
}

interface SkillCategory {
    title: string;
    icon: React.ReactNode;
    skills: Skill[];
    color: string;
}

const skillCategories: SkillCategory[] = [
    {
        title: 'Développement & Programmation',
        icon: <CodeIcon fontSize="large" />,
        color: '#6C63FF',
        skills: [
            { name: 'Python', level: 85 },
            { name: 'Java', level: 80 },
            { name: 'JavaScript', level: 90 },
            { name: 'React/Angular', level: 85 },
            { name: 'Node.js', level: 80 },
            { name: 'Flutter', level: 75 }
        ]
    },
    {
        title: 'Analyse de Données',
        icon: <DataUsageIcon fontSize="large" />,
        color: '#4ECDC4',
        skills: [
            { name: 'Excel Avancé', level: 95 },
            { name: 'Power BI', level: 90 },
            { name: 'Tableau', level: 85 },
            { name: 'SQL', level: 80 }
        ]
    },
    {
        title: 'Design & Multimédia',
        icon: <BrushIcon fontSize="large" />,
        color: '#FF6B6B',
        skills: [
            { name: 'Photoshop', level: 85 },
            { name: 'Illustrator', level: 80 },
            { name: 'Premiere Pro', level: 75 },
            { name: 'Adobe XD', level: 85 }
        ]
    },
    {
        title: 'Support IT',
        icon: <SupportIcon fontSize="large" />,
        color: '#95A5A6',
        skills: [
            { name: 'Dépannage', level: 90 },
            { name: 'Assistance technique', level: 95 },
            { name: 'CRM', level: 85 },
            { name: 'Office 365', level: 90 }
        ]
    },
    {
        title: 'Langues',
        icon: <LanguageIcon fontSize="large" />,
        color: '#F39C12',
        skills: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 75 }
        ]
    }
];

export const SkillsSection: React.FC = () => {
    return (
        <Box
            component="section"
            sx={{
                py: 8,
                background: 'var(--background-light)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{
                            mb: 6,
                            fontFamily: 'var(--font-secondary)',
                            background: 'var(--gradient-fun)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 'bold'
                        }}
                    >
                        Compétences
                    </Typography>

                    <Grid container spacing={4}>
                        {skillCategories.map((category, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 'var(--border-radius)',
                                            boxShadow: 'var(--box-shadow)',
                                            background: 'white',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                transition: 'transform 0.3s ease'
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 3,
                                                color: category.color
                                            }}
                                        >
                                            {category.icon}
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    ml: 2,
                                                    fontFamily: 'var(--font-secondary)',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {category.title}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ mt: 2 }}>
                                            {category.skills.map((skill, skillIndex) => (
                                                <Box key={skillIndex} sx={{ mb: 2 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            mb: 1
                                                        }}
                                                    >
                                                        <Typography>{skill.name}</Typography>
                                                        <Typography
                                                            sx={{ color: category.color }}
                                                        >
                                                            {skill.level}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={skill.level}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: category.color
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};
