import React from 'react';
import { Box, Container, Typography, Card } from '@mui/material';
import { motion } from 'framer-motion';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

interface Certification {
    name: string;
    issuer?: string;
    year?: string;
}

// Organisme et année facultatifs : ils s'affichent seulement s'ils sont renseignés.
const certifications: Certification[] = [
    { name: 'Certification Power BI' },
    { name: 'Certification en intelligence artificielle' },
    { name: 'Certification en relation clientèle' },
    { name: "Permis d'agent de sécurité (BSP)", issuer: 'Bureau de la sécurité privée' },
    { name: 'Secourisme / RCR' }
];

export const CertificationsSection: React.FC = () => {
    return (
        <Box
            component="section"
            id="certifications"
            sx={{
                py: 12,
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
                        Certifications
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: '#4a5568',
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        Formations certifiantes et attestations
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3
                    }}
                >
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)'
                                    }
                                }}
                            >
                                <WorkspacePremiumIcon sx={{ color: '#3182ce', fontSize: 32 }} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', fontSize: '1.05rem' }}>
                                        {cert.name}
                                    </Typography>
                                    {(cert.issuer || cert.year) && (
                                        <Typography variant="body2" sx={{ color: '#4a5568', mt: 0.5 }}>
                                            {[cert.issuer, cert.year].filter(Boolean).join(' · ')}
                                        </Typography>
                                    )}
                                </Box>
                            </Card>
                        </motion.div>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};
