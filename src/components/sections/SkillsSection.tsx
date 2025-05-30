import React from 'react';
import { Box, Container, Typography, Paper, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Skill } from '../../core/models/Skill';

interface SkillsSectionProps {
    skills: Skill[];
}

export class SkillsSection extends React.Component<SkillsSectionProps> {
    private renderSkillCategory(category: string, skills: Skill[]) {
        const filteredSkills = skills.filter(skill => skill.category === category);
        
        return (
            <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                    {filteredSkills.map((skill) => (
                        <Paper
                            key={skill.id}
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            elevation={2}
                            sx={{ p: 2 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {skill.icon && (
                                    <Box
                                        component="img"
                                        src={skill.icon}
                                        alt={skill.name}
                                        sx={{ width: 24, height: 24, mr: 1 }}
                                    />
                                )}
                                <Typography variant="subtitle1">{skill.name}</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ ml: 'auto', color: 'text.secondary' }}
                                >
                                    {skill.getLevelCategory()}
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
                                        borderRadius: 4,
                                    },
                                }}
                            />
                        </Paper>
                    ))}
                </Box>
            </Box>
        );
    }

    render() {
        const { skills } = this.props;
        const categories = ['frontend', 'backend', 'tools', 'soft'];

        return (
            <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
                <Container>
                    <Typography
                        component={motion.h2}
                        variant="h2"
                        align="center"
                        gutterBottom
                        sx={{ mb: 6 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Mes Compétences
                    </Typography>
                    {categories.map(category => this.renderSkillCategory(category, skills))}
                </Container>
            </Box>
        );
    }
}
