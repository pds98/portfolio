import ArticleIcon from "@mui/icons-material/Article";
import BuildIcon from "@mui/icons-material/Build";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkIcon from "@mui/icons-material/Work";
import WebIcon from "@mui/icons-material/Web";
import {
  Box,
  Button,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "../../components/TopBar";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Aperçu", icon: <DashboardIcon /> },
  { to: "/dashboard/profile", label: "Profil", icon: <PersonIcon /> },
  { to: "/dashboard/experiences", label: "Expériences", icon: <WorkIcon /> },
  { to: "/dashboard/education", label: "Formations", icon: <SchoolIcon /> },
  { to: "/dashboard/skills", label: "Compétences", icon: <BuildIcon /> },
  { to: "/dashboard/projects", label: "Projets", icon: <WebIcon /> },
  { to: "/dashboard/certifications", label: "Certifications", icon: <VerifiedIcon /> },
  { to: "/dashboard/cv", label: "Mon CV", icon: <ArticleIcon /> },
  { to: "/dashboard/account", label: "Compte", icon: <ManageAccountsIcon /> },
];

/**
 * Espace PRIVÉ : structure du tableau de bord.
 * La barre du haut offre toujours les deux « sorties » : voir le portfolio
 * public (nouvel onglet) et se déconnecter.
 * Navigation : menu latéral sur grand écran, onglets défilants sur mobile.
 */
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const current = NAV.find((n) => n.to === pathname)?.to ?? "/dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <TopBar
        actions={
          <>
            <Button
              href={`/p/${user?.slug ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              variant="outlined"
              size="small"
            >
              {desktop ? "Voir mon portfolio" : "Portfolio"}
            </Button>
            <Button onClick={() => void handleLogout()} startIcon={<LogoutIcon />} size="small" color="inherit">
              {desktop ? "Déconnexion" : ""}
            </Button>
          </>
        }
      />
      {!desktop && (
        <Paper
          square
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider", position: "sticky", top: 56, zIndex: 1 }}
        >
          <Tabs value={current} variant="scrollable" scrollButtons="auto" aria-label="Sections du tableau de bord">
            {NAV.map((n) => (
              <Tab key={n.to} value={n.to} label={n.label} component={NavLink} to={n.to} end={n.to === "/dashboard"} />
            ))}
          </Tabs>
        </Paper>
      )}
      <Container maxWidth="xl" sx={{ py: 4, display: "flex", gap: 4, alignItems: "flex-start" }}>
        {desktop && (
          <Paper
            component="nav"
            aria-label="Sections du tableau de bord"
            variant="outlined"
            sx={{ width: 240, flexShrink: 0, position: "sticky", top: 88 }}
          >
            <List>
              {NAV.map((n) => (
                <ListItemButton
                  key={n.to}
                  component={NavLink}
                  to={n.to}
                  end={n.to === "/dashboard"}
                  selected={current === n.to}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{n.icon}</ListItemIcon>
                  <ListItemText primary={n.label} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Container>
    </>
  );
}
