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
// phone / twitter facultatifs : la ligne ou l'icône n'apparaît que s'ils sont renseignés.
const contactInfo: IContactInfo = {
    email: 'papedemba2k23@outlook.fr',
    location: 'Montréal, QC, Canada',
    timezone: 'Heure de l\'Est (UTC−5)',
    availability: 'Disponible' as const,
    social: {
        linkedin: 'https://www.linkedin.com/in/pape-demba-sow-8a5b3b1b2/',
        github: 'https://github.com/pds98'
    }
};

// Données pour le QR Code
const qrCodeInfo = {
    name: 'Demba Sow',
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
    phone?: string;
    location: string;
    timezone: string;
    availability: 'Disponible' | 'Occupé' | 'En réunion';
    social: {
        linkedin: string;
        github: string;
        twitter?: string;
    };
}

export const ContactSection: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [qrDialogOpen, setQrDialogOpen] = React.useState(false);

    // Site statique (sans serveur) : le formulaire ouvre la messagerie du visiteur
    // avec le message prérempli, adressé à contactInfo.email.
    const handleSubmit = async (formData: IContactFormData) => {
        const body = `${formData.message}\n\n— ${formData.name} (${formData.email})`;
        window.location.href = `mailto:${contactInfo.email}`
            + `?subject=${encodeURIComponent(formData.subject)}`
            + `&body=${encodeURIComponent(body)}`;
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
