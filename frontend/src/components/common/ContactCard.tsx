import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { Alert, Box, Button, Card, CardContent, IconButton, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";
import type { Profile } from "../../types/portfolio";

/** Carte de coordonnées (inspirée du portfolio d'origine), alimentée par le profil en base. */
interface ContactCardProps {
  profile: Profile;
  onShowQRCode: () => void;
}

export function ContactCard({ profile, onShowQRCode }: ContactCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`${label} copié dans le presse-papiers`);
    } catch {
      setCopied("Copie impossible dans ce navigateur");
    }
  };

  const rows: { icon: ReactNode; label: string; value: string; copyable?: boolean; href?: string }[] = [];
  if (profile.email)
    rows.push({
      icon: <EmailIcon />,
      label: "Courriel",
      value: profile.email,
      copyable: true,
      href: `mailto:${profile.email}`,
    });
  if (profile.phone)
    rows.push({
      icon: <PhoneIcon />,
      label: "Téléphone",
      value: profile.phone,
      copyable: true,
      href: `tel:${profile.phone}`,
    });
  if (profile.city) rows.push({ icon: <LocationOnIcon />, label: "Ville", value: profile.city });

  const socials = [
    profile.linkedinUrl && { icon: <LinkedInIcon />, label: "LinkedIn", url: profile.linkedinUrl },
    profile.githubUrl && { icon: <GitHubIcon />, label: "GitHub", url: profile.githubUrl },
    profile.websiteUrl && { icon: <LanguageIcon />, label: "Site web", url: profile.websiteUrl },
  ].filter((s): s is { icon: JSX.Element; label: string; url: string } => Boolean(s));

  return (
    <Card elevation={3} sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
          Coordonnées
        </Typography>
        <Stack spacing={2} sx={{ my: 3 }}>
          {rows.map((r) => (
            <Box key={r.label} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "primary.main", display: "flex" }} aria-hidden>
                {r.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {r.label}
                </Typography>
                <Typography sx={{ wordBreak: "break-word" }}>
                  {r.href ? (
                    <Box component="a" href={r.href} sx={{ color: "inherit" }}>
                      {r.value}
                    </Box>
                  ) : (
                    r.value
                  )}
                </Typography>
              </Box>
              {r.copyable && (
                <Tooltip title="Copier">
                  <IconButton
                    aria-label={`Copier ${r.label.toLowerCase()}`}
                    onClick={() => void copy(r.value, r.label)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Stack>

        {socials.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {socials.map((s) => (
              <Tooltip key={s.label} title={s.label}>
                <IconButton
                  component="a"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  {s.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        )}

        <Button variant="outlined" startIcon={<QrCodeIcon />} onClick={onShowQRCode}>
          Afficher ma carte en QR code
        </Button>
      </CardContent>
      <Snackbar open={copied !== null} autoHideDuration={2500} onClose={() => setCopied(null)}>
        <Alert severity="success" onClose={() => setCopied(null)} variant="filled">
          {copied}
        </Alert>
      </Snackbar>
    </Card>
  );
}
