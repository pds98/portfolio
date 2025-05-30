import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton, 
    Box,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDialogProps {
    open: boolean;
    onClose: () => void;
    contactInfo: {
        name: string;
        email: string;
        phone: string;
        linkedin: string;
    };
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ open, onClose, contactInfo }) => {
    // Créer une vCard
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${contactInfo.name}
TEL:${contactInfo.phone}
EMAIL:${contactInfo.email}
URL:${contactInfo.linkedin}
END:VCARD`;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                <Typography variant="h6" component="div">
                    Scanner pour ajouter mes coordonnées
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        p: 2
                    }}
                >
                    <QRCodeSVG
                        value={vCard}
                        size={256}
                        level="H"
                        includeMargin={true}
                    />
                </Box>
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 2 }}
                >
                    Scannez ce QR Code avec votre téléphone pour ajouter mes coordonnées à vos contacts
                </Typography>
            </DialogContent>
        </Dialog>
    );
};
