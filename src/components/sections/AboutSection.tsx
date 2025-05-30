import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, LinearProgress, Button } from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import BrushIcon from '@mui/icons-material/Brush';

interface Skill {
    name: string;
    level: number;
    icon: React.ReactNode;
}

interface Counter {
    label: string;
    endValue: number;
    suffix: string;
}

export const AboutSection: React.FC = () => {
    const [counters, setCounters] = useState<Counter[]>([
        { label: "Années d'expérience", endValue: 5, suffix: "+" },
        { label: "Projets réalisés", endValue: 30, suffix: "+" },
        { label: "Clients satisfaits", endValue: 25, suffix: "+" }
    ]);

    const skills: { [key: string]: Skill[] } = {
        'Développement': [
            { name: 'JavaScript/TypeScript', level: 85, icon: <CodeIcon /> },
            { name: 'React/Angular', level: 80, icon: <CodeIcon /> },
            { name: 'Python', level: 75, icon: <CodeIcon /> },
            { name: 'Java', level: 70, icon: <CodeIcon /> }
        ],
        'Data & Analytics': [
            { name: 'Power BI', level: 90, icon: <DataObjectIcon /> },
            { name: 'Excel avancé', level: 95, icon: <DataObjectIcon /> },
            { name: 'SQL', level: 85, icon: <DataObjectIcon /> },
            { name: 'Tableau', level: 80, icon: <DataObjectIcon /> }
        ],
        'Design': [
            { name: 'Figma', level: 85, icon: <BrushIcon /> },
            { name: 'Adobe XD', level: 80, icon: <BrushIcon /> },
            { name: 'Photoshop', level: 75, icon: <BrushIcon /> },
            { name: 'Illustrator', level: 70, icon: <BrushIcon /> }
        ]
    };

    const [counts, setCounts] = useState<number[]>(counters.map(() => 0));

    useEffect(() => {
        const duration = 2000; // 2 secondes pour l'animation
        const steps = 50; // nombre d'étapes pour l'animation
        const stepDuration = duration / steps;

        counters.forEach((counter, index) => {
            const stepValue = counter.endValue / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                if (currentStep === steps) {
                    clearInterval(timer);
                    return;
                }

                setCounts(prevCounts => {
                    const newCounts = [...prevCounts];
                    newCounts[index] = Math.round(stepValue * currentStep);
                    return newCounts;
                });

                currentStep++;
            }, stepDuration);
        });
    }, []);

    return (
        <Box component="section" sx={{ py: 8, bgcolor: 'background.default' }}>
            <Container>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Typography
                                variant="h2"
                                gutterBottom
                                className="text-gradient"
                                sx={{ 
                                    mb: 4, 
                                    fontWeight: 800,
                                    fontSize: { xs: '2rem', md: '2.5rem' },
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                À propos de moi
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ 
                                fontWeight: 700, 
                                fontSize: '1.0rem',
                                color: '#000000',
                                textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                                letterSpacing: '0.3px',
                                lineHeight: 1.8
                            }}>
                                Programmeur-analyste en formation et analyste de données expérimenté, je me distingue par un profil polyvalent alliant compétences techniques, sens de l’analyse et créativité visuelle.
                                Avec plusieurs années d’expérience en développement web, automatisation de données, support informatique et achats techniques, j’ai acquis une vision globale des systèmes numériques, des flux de données et des enjeux métiers. À cela s’ajoute une solide maîtrise des outils de business intelligence (Excel, Power BI, Tableau) ainsi que des langages de programmation comme Python, JavaScript, Java.
                            </Typography>
                            
                            <Typography variant="body1" paragraph sx={{ 
                                fontWeight: 700, 
                                fontSize: '1.0rem',
                                color: '#000000',
                                textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                                letterSpacing: '0.3px',
                                lineHeight: 1.8,
                                mb: 4
                            }}>
                               Créatif dans l’âme, je possède également une sensibilité en design UI/UX et multimédia, avec une bonne maîtrise de logiciels comme Photoshop, Illustrator, Premiere Pro et Adobe XD. Cette double compétence me permet de concevoir des solutions à la fois fonctionnelles, efficaces et esthétiques.
                               Autonome, rigoureux et passionné par l’innovation, je cherche à évoluer dans des projets où je peux allier analyse, développement, design et impact utilisateur.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    backgroundColor: '#6C63FF',
                                    '&:hover': {
                                        backgroundColor: '#5952cc'
                                    },
                                    mb: 4
                                }}
                                onClick={() => window.open('/cv.pdf', '_blank')}
                            >
                                Télécharger mon CV
                            </Button>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                                {counters.map((counter, index) => (
                                    <Paper
                                        key={counter.label}
                                        elevation={3}
                                        sx={{
                                            p: 2,
                                            flex: 1,
                                            minWidth: '150px',
                                            textAlign: 'center',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ color: '#6C63FF', fontWeight: 'bold' }}>
                                            {counts[index]}{counter.suffix}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            {counter.label}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </motion.div>
                    </Box>
                    <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Paper elevation={3} sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
                                <Typography variant="h5" gutterBottom color="primary">
                                    Compétences Techniques
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                                        <Typography variant="h6" gutterBottom sx={{ 
                                            fontWeight: 700,
                                            color: '#000000',
                                            fontSize: '1.3rem',
                                            mb: 2
                                        }}>
                                            Développement
                                        </Typography>
                                        <ul style={{ 
                                            paddingLeft: '20px',
                                            listStyleType: 'none',
                                            marginBottom: '20px'
                                        }}>
                                            {[
                                                'Python',
                                                'JavaScript',
                                                'Java',
                                                'React/TypeScript',
                                                'HTML/CSS'
                                            ].map((skill) => (
                                                <li key={skill} style={{
                                                    marginBottom: '12px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    color: '#000000',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <span style={{ color: '#6C63FF' }}>▸</span> {skill}
                                                </li>
                                            ))}                                            
                                        </ul>
                                    </Box>

                                    <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                                        <Typography variant="h6" gutterBottom sx={{ 
                                            fontWeight: 700,
                                            color: '#000000',
                                            fontSize: '1.3rem',
                                            mb: 2
                                        }}>
                                            Analyse de données
                                        </Typography>
                                        <ul style={{ 
                                            paddingLeft: '20px',
                                            listStyleType: 'none',
                                            marginBottom: '20px'
                                        }}>
                                            {[
                                                'Power BI',
                                                'Excel avancé',
                                                'Data Visualisation',
                                                'Tableau',
                                                'Analyse statistique'
                                            ].map((skill) => (
                                                <li key={skill} style={{
                                                    marginBottom: '12px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    color: '#000000',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <span style={{ color: '#6C63FF' }}>▸</span> {skill}
                                                </li>
                                            ))}                                            
                                        </ul>
                                    </Box>

                                    {Object.entries(skills).map(([category, skillList]) => (
                                        <Box key={category} sx={{ flex: '1 1 300px', minWidth: 0, mb: 4 }}>
                                            <Typography variant="h6" gutterBottom sx={{ 
                                                fontWeight: 700,
                                                color: '#000000',
                                                fontSize: '1.3rem',
                                                mb: 2
                                            }}>
                                                {category}
                                            </Typography>
                                            {skillList.map((skill) => (
                                                <Box key={skill.name} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Box sx={{ mr: 1, color: '#6C63FF' }}>{skill.icon}</Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {skill.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ ml: 'auto', color: '#666' }}>
                                                            {skill.level}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={skill.level}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: '#e0e0e0',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: '#6C63FF',
                                                                borderRadius: 3
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </motion.div>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};
