import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  InputAdornment,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState, type FormEvent } from "react";
import { profileApi } from "../../api";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { PortfolioSettings, Profile } from "../../types/portfolio";

const FIELDS: { name: keyof Profile; label: string; type?: string; multiline?: boolean; half?: boolean }[] = [
  { name: "fullName", label: "Nom complet *", half: true },
  { name: "headline", label: "Titre professionnel", half: true },
  { name: "bio", label: "Biographie", multiline: true },
  { name: "email", label: "Courriel de contact (public)", type: "email", half: true },
  { name: "phone", label: "Téléphone", type: "tel", half: true },
  { name: "city", label: "Ville", half: true },
  { name: "photoUrl", label: "Photo (URL)", type: "url", half: true },
  { name: "linkedinUrl", label: "LinkedIn", type: "url", half: true },
  { name: "githubUrl", label: "GitHub", type: "url", half: true },
  { name: "websiteUrl", label: "Site personnel", type: "url", half: true },
];

/** Profil (§4.2) + paramètres de publication : slug (RF-12), public/privé (RF-11), CV téléchargeable. */
export default function ProfilePanel() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    profileApi
      .get()
      .then((r) => {
        setProfile(r.profile);
        setSettings(r.settings);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const handleError = (e: unknown) => {
    if (e instanceof ApiError && e.details.length)
      setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
    setError(e instanceof Error ? e.message : "Erreur");
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setErrors({});
    setError(null);
    try {
      await profileApi.update(profile);
      await refresh();
      setSaved("Profil enregistré");
    } catch (err) {
      handleError(err);
    }
  };

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setErrors({});
    setError(null);
    try {
      const r = await profileApi.updateSettings(settings);
      setSettings(r.settings);
      await refresh();
      setSaved("Paramètres enregistrés");
    } catch (err) {
      handleError(err);
    }
  };

  if (!profile || !settings) return error ? <Alert severity="error">{error}</Alert> : null;

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 3 }}>
        Profil
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent component="form" onSubmit={saveSettings}>
          <Typography variant="h6" component="h2" gutterBottom>
            Publication
          </Typography>
          <TextField
            label="Adresse de mon portfolio"
            value={settings.slug}
            onChange={(e) => setSettings({ ...settings, slug: e.target.value.toLowerCase() })}
            error={!!errors.slug}
            helperText={errors.slug ?? "Lettres minuscules, chiffres et tirets"}
            InputProps={{ startAdornment: <InputAdornment position="start">{window.location.host}/p/</InputAdornment> }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.isPublic}
                onChange={(e) => setSettings({ ...settings, isPublic: e.target.checked })}
              />
            }
            label="Portfolio public (visible par les visiteurs)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowCvDownload}
                onChange={(e) => setSettings({ ...settings, allowCvDownload: e.target.checked })}
              />
            }
            label="Autoriser les visiteurs à télécharger mon CV"
          />
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained">
              Enregistrer la publication
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent component="form" onSubmit={saveProfile}>
          <Typography variant="h6" component="h2" gutterBottom>
            Informations personnelles
          </Typography>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            {FIELDS.map((f) => (
              <Box key={f.name} sx={{ gridColumn: { sm: f.half ? "auto" : "1 / -1" } }}>
                <TextField
                  label={f.label}
                  type={f.type ?? "text"}
                  multiline={f.multiline}
                  minRows={f.multiline ? 5 : undefined}
                  value={profile[f.name] ?? ""}
                  onChange={(e) => setProfile({ ...profile, [f.name]: e.target.value })}
                  error={!!errors[f.name]}
                  helperText={
                    errors[f.name] ?? (f.name === "bio" ? "Laissez une ligne vide entre deux paragraphes" : undefined)
                  }
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained">
              Enregistrer le profil
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={saved !== null} autoHideDuration={2500} onClose={() => setSaved(null)}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(null)}>
          {saved}
        </Alert>
      </Snackbar>
    </Box>
  );
}
