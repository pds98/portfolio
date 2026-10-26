import React, { useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Chip, 
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Button
} from '@mui/material';
import { motion } from 'framer-motion';
import type { IProject } from '../../core/interfaces/IProject';

/** Initiales des deux premiers mots significatifs du titre (ex. « Smart Tax Collect » → « ST »). */
const getInitials = (title: string): string =>
    title
        .split(/[\s–-]+/)
        .filter((word) => /^[A-Za-zÀ-ÿ]/.test(word) && word.length > 2)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');

interface ProjectsSectionProps {
    projects: IProject[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
    const [selectedTech, setSelectedTech] = useState('all');

    const allTechnologies = Array.from(new Set(projects.flatMap(p => p.technologies)));

    const filteredProjects = selectedTech === 'all'
        ? projects
        : projects.filter(project => project.technologies.includes(selectedTech));

    return (
        <Box
            component="section"
            sx={{
                py: 8,
                backgroundColor: 'background.default',
                minHeight: '100vh'
            }}
        >
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{ mb: 4 }}
                    >
                        Mes Projets
                    </Typography>

                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1, 
                            justifyContent: 'center',
                            mb: 4 
                        }}
                    >
                        <Chip
                            label="Tous"
                            onClick={() => setSelectedTech('all')}
                            color={selectedTech === 'all' ? 'primary' : 'default'}
                        />
                        {allTechnologies.map((tech) => (
                            <Chip
                                key={tech}
                                label={tech}
                                onClick={() => setSelectedTech(tech)}
                                color={selectedTech === tech ? 'primary' : 'default'}
                            />
                        ))}
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                            {filteredProjects.map((project) => (
                                <Box key={project.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {project.image ? (
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={project.image}
                                                alt={`Aperçu du projet ${project.title}`}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            // Pas de capture : en-tête dégradé avec les initiales du projet
                                            <Box
                                                aria-hidden
                                                sx={{
                                                    height: 200,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'linear-gradient(135deg, #1a365d 0%, #3182ce 100%)',
                                                    color: '#fff',
                                                    fontSize: '3rem',
                                                    fontWeight: 700,
                                                    letterSpacing: 2
                                                }}
                                            >
                                                {getInitials(project.title)}
                                            </Box>
                                        )}
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                {project.title}
                                            </Typography>
                                            <Typography>
                                                {project.shortDescription}
                                            </Typography>
                                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {project.technologies.map((tech) => (
                                                    <Chip
                                                        key={tech}
                                                        label={tech}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </CardContent>
                                        <CardActions>
                                            {project.githubUrl && (
                                                <Button
                                                    size="small"
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    GitHub
                                                </Button>
                                            )}
                                            {project.demoUrl && (
                                                <Button
                                                    size="small"
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Demo
                                                </Button>
                                            )}
                                        </CardActions>
                                    </Card>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};
