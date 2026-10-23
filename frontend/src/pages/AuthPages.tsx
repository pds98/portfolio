import { Alert, Box, Button, Card, CardContent, Container, Link, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link as RouterLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

/** Règles identiques au schéma Zod du backend (validation immédiate côté client). */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "8 caractères minimum";
  if (!/[A-Za-z]/.test(pw)) return "Au moins une lettre";
  if (!/\d/.test(pw)) return "Au moins un chiffre";
  return null;
}

function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Container maxWidth="xs" sx={{ py: { xs: 4, md: 10 } }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              {title}
            </Typography>
            {children}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

/** Espace privé – connexion (RF-02). */
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Courriel et mot de passe requis");
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Connexion">
      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Courriel"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
          <Typography variant="body2" align="center">
            Pas encore de compte ?{" "}
            <Link component={RouterLink} to="/register">
              Créer un compte
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

/** Espace privé – inscription (RF-01). */
export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (form.fullName.trim().length < 2) found.fullName = "Nom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = "Courriel invalide";
    const pw = passwordProblem(form.password);
    if (pw) found.password = pw;
    if (form.confirm !== form.password) found.confirm = "Les mots de passe ne correspondent pas";
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setError(null);
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.details.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      setError(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Créer un compte">
      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nom complet"
            autoComplete="name"
            value={form.fullName}
            onChange={set("fullName")}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
            autoFocus
          />
          <TextField
            label="Courriel"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            error={!!errors.password}
            helperText={errors.password ?? "8 caractères minimum, avec au moins une lettre et un chiffre"}
            required
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set("confirm")}
            error={!!errors.confirm}
            helperText={errors.confirm}
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={busy}>
            {busy ? "Création…" : "Créer mon compte"}
          </Button>
          <Typography variant="body2" align="center">
            Déjà inscrit ?{" "}
            <Link component={RouterLink} to="/login">
              Se connecter
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
