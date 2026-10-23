import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

/**
 * Carte de visite en QR code (vCard) – repris de github.com/pds98/portfolio,
 * adapté : champs facultatifs, valeurs échappées selon la norme vCard.
 */
interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  contact: { name: string; email?: string | null; phone?: string | null; url?: string | null };
}

const vcardEscape = (v: string) => v.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export function QRCodeDialog({ open, onClose, contact }: QRCodeDialogProps) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${vcardEscape(contact.name)}`,
    contact.phone && `TEL:${vcardEscape(contact.phone)}`,
    contact.email && `EMAIL:${vcardEscape(contact.email)}`,
    contact.url && `URL:${vcardEscape(contact.url)}`,
    "END:VCARD",
  ].filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="qr-title">
      <DialogTitle id="qr-title" sx={{ pr: 6 }}>
        Scanner pour ajouter mes coordonnées
        <IconButton aria-label="Fermer" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "center", p: 2, bgcolor: "#fff", borderRadius: 2 }}>
          <QRCodeSVG value={lines.join("\n")} size={240} level="M" includeMargin />
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Scannez ce code avec votre téléphone pour enregistrer le contact.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
