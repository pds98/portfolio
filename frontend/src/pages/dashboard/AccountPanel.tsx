import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { passwordProblem } from "../AuthPages";

/** Compte : changement de mot de passe (RF-03) et suppression définitive (RF-04). */
export default function AccountPanel() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    const problem = passwordProblem(pw.next);
    if (problem) return setPwMsg({ ok: false, text: problem });
    try {
      await authApi.changePassword(pw.current, pw.next);
      setPw({ current: "", next: "" });
      setPwMsg({ ok: true, text: "Mot de passe modifié. Vos autres appareils ont été déconnectés." });
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Erreur" });
    }
  };

  const deleteAccount = async () => {
    try {
      await authApi.deleteAccount(deletePw);
      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 3 }}>
        Compte
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Connecté en tant que <b>{user?.email}</b>
      </Typography>

      <Card variant="outlined" sx={{ mb: 3, maxWidth: 520 }}>
        <CardContent component="form" onSubmit={changePassword}>
          <Typography variant="h6" component="h2" gutterBottom>
            Changer le mot de passe
          </Typography>
          <Stack spacing={2}>
            {pwMsg && <Alert severity={pwMsg.ok ? "success" : "error"}>{pwMsg.text}</Alert>}
            <TextField
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              required
            />
            <TextField
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              helperText="8 caractères minimum, avec au moins une lettre et un chiffre"
              required
            />
            <Box>
              <Button type="submit" variant="contained">
                Mettre à jour
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ maxWidth: 520, borderColor: "error.main" }}>
        <CardContent>
          <Typography variant="h6" component="h2" color="error" gutterBottom>
            Supprimer mon compte
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Votre profil, vos expériences, formations, compétences, projets et votre portfolio public seront
            définitivement supprimés.
          </Typography>
          <Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Cette action est irréversible. Saisissez votre mot de passe pour confirmer.
          </Typography>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <TextField
            label="Mot de passe"
            type="password"
            value={deletePw}
            onChange={(e) => setDeletePw(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" disabled={!deletePw} onClick={() => void deleteAccount()}>
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
