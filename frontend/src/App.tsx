import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { Suspense, lazy, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { LinkButton } from "./components/LinkButton";

// Découpage du code : le tableau de bord et le portfolio public sont chargés à la demande
const PublicPortfolioPage = lazy(() => import("./pages/PublicPortfolioPage"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const OverviewPanel = lazy(() => import("./pages/dashboard/OverviewPanel"));
const ProfilePanel = lazy(() => import("./pages/dashboard/ProfilePanel"));
const CvPanel = lazy(() => import("./pages/dashboard/CvPanel"));
const AccountPanel = lazy(() => import("./pages/dashboard/AccountPanel"));
const ContentPanels = lazy(() => import("./pages/dashboard/ContentPanels"));

const Loader = () => (
  <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
    <CircularProgress aria-label="Chargement" />
  </Box>
);

/** Garde de route : l'espace privé exige une session, sinon redirection vers /login. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <Container sx={{ py: 12, textAlign: "center" }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Page introuvable
      </Typography>
      <LinkButton to="/" variant="contained">
        Retour à l'accueil
      </LinkButton>
    </Container>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ---------- espace public ---------- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/p/:slug" element={<PublicPortfolioPage />} />

        {/* ---------- espace privé (authentification requise) ---------- */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<OverviewPanel />} />
          <Route path="profile" element={<ProfilePanel />} />
          <Route path=":resource" element={<ContentPanels />} />
          <Route path="cv" element={<CvPanel />} />
          <Route path="account" element={<AccountPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
