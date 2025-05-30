import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    IconButton, 
    Tooltip, 
    Chip,
    useTheme,
    Snackbar,
    Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ContactInfo {
    email: string;
    phone: string;
    location: string;
    timezone: string;
    availability: "Disponible" | "Occupé" | "En réunion";
    social: {
        linkedin: string;
        github: string;
        twitter: string;
    };
}

interface ContactCardProps {
    info: ContactInfo;
    onShowQRCode: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ info, onShowQRCode }) => {
    const theme = useTheme();
    const [snackbar, setSnackbar] = React.useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setSnackbar({
                open: true,
                message: `${label} copié dans le presse-papiers`,
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Erreur lors de la copie',
                severity: 'error'
            });
        }
    };

    const getAvailabilityColor = () => {
        switch (info.availability) {
            case "Disponible":
                return theme.palette.success.main;
            case "Occupé":
                return theme.palette.warning.main;
            case "En réunion":
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    component={motion.div}
                    whileHover={{ 
                        scale: 1.02,
                        rotateY: 5,
                        rotateX: 5
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                                Mes Coordonnées
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                    label={info.availability}
                                    size="small"
                                    sx={{
                                        backgroundColor: `${getAvailabilityColor()}22`,
                                        color: getAvailabilityColor(),
                                        fontWeight: 500
                                    }}
                                />
                                <Tooltip title="Voir le QR Code">
                                    <IconButton onClick={onShowQRCode} size="small">
                                        <QrCodeIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon color="primary" />
                                <Typography variant="body1" sx={{ flex: 1 }}>
                                    {info.email}
                                </Typography>
                                <Tooltip title="Copier l'email">
                                    <IconButton 
                                        size="small"
                                        onClick={() => handleCopy(info.email, 'Email')}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon color="primary" />
                                <Typography variant="body1" sx={{ flex: 1 }}>
                                    {info.phone}
                                </Typography>
                                <Tooltip title="Copier le numéro">
                                    <IconButton 
                                        size="small"
                                        onClick={() => handleCopy(info.phone, 'Numéro')}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="primary" />
                                <Typography variant="body1" sx={{ flex: 1 }}>
                                    {info.location}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon color="primary" />
                                <Typography variant="body1">
                                    {info.timezone}
                                </Typography>
                            </Box>

                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1, 
                                justifyContent: 'center',
                                mt: 2
                            }}>
                                <Tooltip title="LinkedIn">
                                    <IconButton 
                                        component="a" 
                                        href={info.social.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <LinkedInIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="GitHub">
                                    <IconButton 
                                        component="a" 
                                        href={info.social.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <GitHubIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Twitter">
                                    <IconButton 
                                        component="a" 
                                        href={info.social.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <TwitterIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};
