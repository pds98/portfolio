import React from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { ContactCard } from '../common/ContactCard';
import { ContactForm } from '../common/ContactForm';
import { QRCodeDialog } from '../common/QRCodeDialog';

// Données de contact
const contactInfo: IContactInfo = {
    email: 'votre.email@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    timezone: 'Europe/Paris (UTC+1)',
    availability: 'Disponible' as const,
    social: {
        linkedin: 'https://linkedin.com/in/votre-profil',
        github: 'https://github.com/votre-username',
        twitter: 'https://twitter.com/votre-username'
    }
};

// Données pour le QR Code
const qrCodeInfo = {
    name: 'Votre Nom',
    email: contactInfo.email,
    phone: contactInfo.phone,
    linkedin: contactInfo.social.linkedin
};

interface IContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    attachment?: File | null;
}

interface IContactInfo {
    email: string;
    phone: string;
    location: string;
    timezone: string;
    availability: 'Disponible' | 'Occupé' | 'En réunion';
    social: {
        linkedin: string;
        github: string;
        twitter: string;
    };
}

export const ContactSection: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [qrDialogOpen, setQrDialogOpen] = React.useState(false);

    const handleSubmit = async (formData: IContactFormData) => {
        // Simuler l'envoi du formulaire
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // En production, envoyez les données à votre backend
        console.log('Form submitted:', formData);
    };

    return (
        <Box
            component="section"
            sx={{
                py: 8,
                backgroundColor: 'background.default',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Container maxWidth="lg">
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
                        sx={{ mb: 6 }}
                    >
                        Me Contacter
                    </Typography>
                </motion.div>

                <Stack 
                    direction={isMobile ? 'column-reverse' : 'row'}
                    spacing={4}
                    sx={{ mb: 4 }}
                >
                    <Box sx={{ flex: 1 }}>
                        <ContactForm onSubmit={handleSubmit} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <ContactCard 
                            info={contactInfo}
                            onShowQRCode={() => setQrDialogOpen(true)}
                        />
                    </Box>
                </Stack>

                <QRCodeDialog
                    open={qrDialogOpen}
                    onClose={() => setQrDialogOpen(false)}
                    contactInfo={qrCodeInfo}
                />
            </Container>
        </Box>
    );
};
