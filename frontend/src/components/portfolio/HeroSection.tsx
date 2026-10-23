import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { Profile } from "../../types/portfolio";

/**
 * Bandeau d'accueil – design repris de github.com/pds98/portfolio (dégradé bleu,
 * photo en perspective), désormais alimenté par le profil enregistré en base.
 */
interface HeroSectionProps {
  profile: Profile;
  onDownloadCv?: () => void;
}

export function HeroSection({ profile, onDownloadCv }: HeroSectionProps) {
  return (
    <Box
      component="header"
      sx={{
        minHeight: { xs: "80vh", md: "100vh" },
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
        color: "white",
        py: 8,
      }}
    >
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", gap: 6, flexWrap: { xs: "wrap", md: "nowrap" } }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ flex: 1 }}
          >
            <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, mb: 2 }}>
              {profile.fullName}
            </Typography>
            {profile.headline && (
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: "1.4rem", md: "2rem" }, mb: 3, color: "#90caf9", fontWeight: 500 }}
              >
                {profile.headline}
              </Typography>
            )}
            {profile.city && (
              <Typography sx={{ mb: 4, fontSize: "1.1rem", opacity: 0.9 }}>📍 {profile.city}</Typography>
            )}
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              {profile.githubUrl && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<GitHubIcon />}
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Button>
              )}
              {profile.linkedinUrl && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LinkedInIcon />}
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </Button>
              )}
              <Button variant="outlined" color="inherit" startIcon={<EmailIcon />} href="#contact">
                Contact
              </Button>
              {onDownloadCv && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={onDownloadCv}
                  sx={{ bgcolor: "#6C63FF", "&:hover": { bgcolor: "#5952cc" } }}
                >
                  Télécharger mon CV
                </Button>
              )}
            </Stack>
          </Box>

          {profile.photoUrl && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              sx={{ flex: 1, display: { xs: "none", md: "block" }, maxWidth: 420, mx: "auto" }}
            >
              <Box
                component="img"
                src={profile.photoUrl}
                alt={`Photo de ${profile.fullName}`}
                sx={{
                  width: "100%",
                  height: "auto",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  border: "4px solid rgba(255,255,255,0.1)",
                  transform: "perspective(1000px) rotateY(-5deg)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "perspective(1000px) rotateY(0deg)" },
                }}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
