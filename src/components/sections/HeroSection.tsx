import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

export class HeroSection extends React.Component {
    render() {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                    color: 'white',
                }}
            >
                <Container>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            sx={{ flex: 1 }}
                        >
                            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 2 }}>
                                Pape Demba SOW
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 3, color: '#90caf9' }}
                            >
                                Développeur Full Stack
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '600px' }}>
                                Passionné par le développement web et mobile, je crée des applications modernes et performantes en utilisant les dernières technologies.
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<GitHubIcon />}
                                    href="https://github.com/DembaDiack"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<LinkedInIcon />}
                                    href="https://www.linkedin.com/in/pape-demba-sow-8a5b3b1b2/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    LinkedIn
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<EmailIcon />}
                                    href="mailto:papedembasow@gmail.com"
                                >
                                    Contact
                                </Button>
                            </Stack>
                        </Box>
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            sx={{
                                flex: 1,
                                display: { xs: 'none', md: 'block' },
                                maxWidth: '500px',
                                margin: '0 auto',
                            }}
                        >
                            <Box
                                component="img"
                                src="/images/me.PNG"
                                alt="Pape Demba SOW"
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '0px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    border: '4px solid rgba(255,255,255,0.1)',
                                    transform: 'perspective(1000px) rotateY(-5deg)',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'perspective(1000px) rotateY(0deg)'
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>
        );
    }
}
