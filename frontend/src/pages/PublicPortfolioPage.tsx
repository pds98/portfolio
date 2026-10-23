import EditIcon from "@mui/icons-material/Edit";
import { Alert, Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import { Suspense, lazy, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicApi } from "../api";
import { ApiError } from "../api/client";
import { IntroBoundary } from "../components/IntroBoundary";
import { TopBar } from "../components/TopBar";
import { AboutSection } from "../components/portfolio/AboutSection";
import { CertificationsSection } from "../components/portfolio/CertificationsSection";
import { ContactSection } from "../components/portfolio/ContactSection";
import { HeroSection } from "../components/portfolio/HeroSection";
import { ProjectsSection } from "../components/portfolio/ProjectsSection";
import { TimelineSection } from "../components/portfolio/TimelineSection";
import { useAuth } from "../context/AuthContext";
import type { PortfolioData } from "../types/portfolio";
import { LinkButton } from "../components/LinkButton";

// Animation 3D (Three.js) chargée à la demande : le reste de la page n'attend pas ce code lourd
const IntroAnimation = lazy(() => import("@intro"));

/**
 * L'intro ne se joue qu'une fois par session, et jamais si l'utilisateur réduit les animations.
 * Fonction PURE (lecture seule) : React peut l'appeler deux fois en mode strict ;
 * le marqueur « déjà vue » est écrit dans un useEffect, voir plus bas.
 */
function shouldPlayIntro(slug: string): boolean {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    return !sessionStorage.getItem(`intro:${slug}`);
  } catch {
    return false;
  }
}

/**
 * Espace PUBLIC (visiteur / employeur) : /p/:slug – RF-10.
 * Aucune connexion requise ; données servies par GET /api/public/:slug (cache Redis).
 */
export default function PublicPortfolioPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intro, setIntro] = useState(() => shouldPlayIntro(slug));
  const [cvError, setCvError] = useState<string | null>(null);

  useEffect(() => {
    if (!intro) return;
    try {
      sessionStorage.setItem(`intro:${slug}`, "1");
    } catch {
      /* navigation privée : l'intro se rejouera, sans gravité */
    }
  }, [intro, slug]);

  useEffect(() => {
    setData(null);
    setError(null);
    publicApi
      .portfolio(slug)
      .then((d) => {
        setData(d);
        document.title = `${d.profile.fullName} – Portfolio`;
      })
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError && err.status === 404
            ? "Ce portfolio n'existe pas ou est privé."
            : String((err as Error).message),
        ),
      );
  }, [slug]);

  const isOwner = user?.slug === slug;
  const actions = isOwner ? (
    <LinkButton to="/dashboard" startIcon={<EditIcon />} variant="contained" size="small">
      Modifier mon portfolio
    </LinkButton>
  ) : null;

  if (error) {
    return (
      <>
        <TopBar actions={actions} />
        <Container sx={{ py: 12, textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Portfolio introuvable
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {error}
          </Typography>
          <LinkButton to="/" variant="contained">
            Retour à l'accueil
          </LinkButton>
        </Container>
      </>
    );
  }

  if (!data) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress aria-label="Chargement du portfolio" />
      </Box>
    );
  }

  const downloadCv = data.settings.allowCvDownload
    ? () => {
        setCvError(null);
        publicApi.downloadCv(slug).catch((e: Error) => setCvError(e.message));
      }
    : undefined;

  return (
    <>
      {intro && (
        <IntroBoundary onError={() => setIntro(false)}>
          <Suspense fallback={null}>
            <IntroAnimation onComplete={() => setIntro(false)} />
          </Suspense>
          {/* Hors du Suspense : le bouton est visible pendant le chargement de Three.js */}
          <Button
            onClick={() => setIntro(false)}
            variant="outlined"
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 10000,
              color: "#0f0",
              borderColor: "#0f0",
              bgcolor: "rgba(0,0,0,.6)",
            }}
          >
            Passer l'intro
          </Button>
        </IntroBoundary>
      )}
      <TopBar title={data.profile.fullName} actions={actions} />
      <main>
        <HeroSection profile={data.profile} onDownloadCv={downloadCv} />
        {cvError && (
          <Alert severity="error" onClose={() => setCvError(null)} sx={{ borderRadius: 0 }}>
            {cvError}
          </Alert>
        )}
        <AboutSection data={data} />
        <TimelineSection
          id="experience-title"
          title="Expérience professionnelle"
          subtitle="Parcours professionnel et réalisations"
          entries={data.experiences.map((e) => ({
            id: e.id,
            title: e.position,
            subtitle: e.company,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description,
            bullets: e.achievements,
          }))}
        />
        <ProjectsSection projects={data.projects} />
        <TimelineSection
          id="education-title"
          title="Formation"
          entries={data.education.map((e) => ({
            id: e.id,
            title: e.degree,
            subtitle: e.school,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description,
          }))}
        />
        <CertificationsSection certifications={data.certifications} />
        <ContactSection slug={slug} profile={data.profile} />
      </main>
      <Box
        component="footer"
        sx={{ py: 4, textAlign: "center", color: "text.secondary", borderTop: 1, borderColor: "divider" }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} {data.profile.fullName}
        </Typography>
      </Box>
    </>
  );
}
