import ArticleIcon from "@mui/icons-material/Article";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PublicIcon from "@mui/icons-material/Public";
import { Box, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { api } from "../api/client";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { LinkButton } from "../components/LinkButton";

type Health = { status: string; postgres?: string; redis?: string };

const FEATURES = [
  {
    icon: <DashboardIcon />,
    title: "Tableau de bord privé",
    text: "Gérez profil, expériences, formations, compétences et projets.",
  },
  {
    icon: <PublicIcon />,
    title: "Portfolio public",
    text: "Une page responsive à partager aux employeurs, à une URL lisible.",
  },
  {
    icon: <ArticleIcon />,
    title: "CV en PDF",
    text: "Deux modèles, choix des sections, aperçu, en français ou en anglais.",
  },
];

/** Bandeau d'accueil (sous-composant : garde chaque expression JSX simple pour TypeScript). */
function HomeHero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <Box
      sx={{
        color: "common.white",
        background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
        py: { xs: 8, md: 14 },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "3.5rem" }, mb: 2 }}>
          Votre portfolio professionnel et votre CV, au même endroit
        </Typography>
        <Typography sx={{ fontSize: "1.15rem", opacity: 0.9, mb: 4 }}>
          Saisissez votre parcours une seule fois : il alimente votre page publique et génère un CV PDF soigné.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <LinkButton
            to={loggedIn ? "/dashboard" : "/register"}
            variant="contained"
            size="large"
            sx={{ bgcolor: "#6C63FF", "&:hover": { bgcolor: "#5952cc" } }}
          >
            {loggedIn ? "Ouvrir mon tableau de bord" : "Commencer gratuitement"}
          </LinkButton>
          <LinkButton to="/p/demba-sow" variant="outlined" color="inherit" size="large">
            Voir un exemple
          </LinkButton>
        </Stack>
      </Container>
    </Box>
  );
}

function HomeFeatures({ health }: { health: Health | null }) {
  return (
    <Container sx={{ py: 8 }}>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {FEATURES.map((f) => (
          <Card key={f.title} variant="outlined">
            <CardContent>
              <Box sx={{ color: "primary.main", mb: 1 }} aria-hidden>
                {f.icon}
              </Box>
              <Typography variant="h6" component="h2">
                {f.title}
              </Typography>
              <Typography color="text.secondary">{f.text}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 6 }} aria-label="État des services">
        <Chip
          size="small"
          label={`API : ${health?.status ?? "…"}`}
          color={health?.status === "ok" ? "success" : "default"}
        />
        <Chip size="small" label={`PostgreSQL : ${health?.postgres ?? "?"}`} variant="outlined" />
        <Chip size="small" label={`Redis : ${health?.redis ?? "?"}`} variant="outlined" />
      </Stack>
    </Container>
  );
}

/** Page d'accueil : présentation, accès connexion / inscription, état des services. */
export default function HomePage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    api<Health>("/api/health")
      .then(setHealth)
      .catch(() => setHealth({ status: "error" }));
  }, []);

  return (
    <>
      <TopBar
        actions={
          user ? (
            <LinkButton to="/dashboard" variant="contained">
              Mon tableau de bord
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/login">Connexion</LinkButton>
              <LinkButton to="/register" variant="contained">
                Créer mon portfolio
              </LinkButton>
            </>
          )
        }
      />
      <HomeHero loggedIn={!!user} />
      <HomeFeatures health={health} />
    </>
  );
}
