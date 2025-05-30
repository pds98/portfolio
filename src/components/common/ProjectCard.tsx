import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';

interface ProjectCardProps {
    title: string;
    description: string;
    longDescription: string;
    technologies: string[];
    imageUrl: string;
    githubUrl: string;
    demoUrl: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    title,
    description,
    technologies,
    imageUrl,
    githubUrl,
    demoUrl,
}) => (
    <Card
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
        }}
    >
        <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={title}
            sx={{
                objectFit: 'cover',
            }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="h2">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                {description}
            </Typography>
            <Box sx={{ mt: 2, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {technologies.map((tech) => (
                    <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                ))}
            </Box>
        </CardContent>
        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
            <Button
                startIcon={<GitHubIcon />}
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                fullWidth
            >
                GitHub
            </Button>
            <Button
                startIcon={<LaunchIcon />}
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                fullWidth
            >
                Demo
            </Button>
        </Box>
    </Card>
);

