import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import { Alert, Box, Card, CardContent, Chip, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { statsApi, type ContactMessage } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { LinkButton } from "../../components/LinkButton";

/** Accueil du tableau de bord : statut public/privé, lien, visites et messages reçus. */
export default function OverviewPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ visits: number; messages: ContactMessage[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsApi
      .get()
      .then(setStats)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (!user) return null;
  const publicUrl = `${window.location.origin}/p/${user.slug}`;

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        Bonjour {user.fullName.split(" ")[0]} 👋
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Complétez votre contenu, puis générez votre CV et partagez votre portfolio.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, mb: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Visibilité
            </Typography>
            <Chip
              icon={user.isPublic ? <PublicIcon /> : <LockIcon />}
              label={user.isPublic ? "Public" : "Privé"}
              color={user.isPublic ? "success" : "default"}
            />
            <Typography variant="body2" sx={{ mt: 2, wordBreak: "break-all" }}>
              {user.isPublic ? publicUrl : "Seul vous pouvez voir votre portfolio."}
            </Typography>
            <LinkButton to="/dashboard/profile" size="small" sx={{ mt: 1 }}>
              Modifier
            </LinkButton>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Visites du portfolio
            </Typography>
            <Typography variant="h3" fontWeight={700}>
              {stats?.visits ?? "…"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Compteur Redis, persisté chaque minute dans PostgreSQL
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Mon CV
            </Typography>
            <Typography sx={{ mb: 2 }}>2 modèles, aperçu en direct, PDF en FR ou EN.</Typography>
            <LinkButton to="/dashboard/cv" variant="contained">
              Générer mon CV
            </LinkButton>
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h2">
            Messages reçus
          </Typography>
          {stats && stats.messages.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aucun message pour l'instant. Les visiteurs peuvent vous écrire depuis votre portfolio.
            </Typography>
          )}
          <List>
            {stats?.messages.map((m, i) => (
              <Box key={m.id}>
                {i > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start" disableGutters>
                  <ListItemText
                    primary={`${m.subject ?? "(sans sujet)"} — ${m.name}`}
                    secondary={
                      <>
                        <Box component="a" href={`mailto:${m.email}`} sx={{ color: "primary.main" }}>
                          {m.email}
                        </Box>
                        {" · "}
                        {new Date(m.createdAt).toLocaleString("fr-CA")}
                        <Box component="span" sx={{ display: "block", mt: 0.5, whiteSpace: "pre-wrap" }}>
                          {m.message}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
