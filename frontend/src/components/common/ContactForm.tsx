import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";

/**
 * Formulaire de contact (repris du portfolio d'origine), désormais réellement
 * envoyé à l'API (POST /api/public/:slug/contact, limité en débit via Redis).
 * La pièce jointe a été retirée : elle n'est pas stockée côté serveur.
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type Errors = Partial<Record<keyof ContactFormData, string>>;
const EMPTY: ContactFormData = { name: "", email: "", subject: "", message: "" };

export function validateContact(data: ContactFormData): Errors {
  const errors: Errors = {};
  if (data.name.trim().length < 2) errors.name = "Votre nom est requis";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Courriel invalide";
  if (data.message.trim().length < 10) errors.message = "10 caractères minimum";
  return errors;
}

export function ContactForm({ onSubmit }: { onSubmit: (data: ContactFormData) => Promise<void> }) {
  const [data, setData] = useState<ContactFormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const update = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((d) => ({ ...d, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateContact(data);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus("sending");
    try {
      await onSubmit(data);
      setStatus("sent");
      setData(EMPTY);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Envoi impossible");
      setStatus("error");
    }
  };

  return (
    <Card elevation={3} sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
          Envoyer un message
        </Typography>
        <AnimatePresence mode="wait">
          {status === "sent" ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Message envoyé, merci !
                </Typography>
                <Button sx={{ mt: 2 }} onClick={() => setStatus("idle")}>
                  Écrire un autre message
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Stack spacing={2} sx={{ mt: 2 }}>
                {status === "error" && <Alert severity="error">{serverError}</Alert>}
                <TextField
                  label="Nom"
                  value={data.name}
                  onChange={update("name")}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
                <TextField
                  label="Courriel"
                  type="email"
                  value={data.email}
                  onChange={update("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
                <TextField label="Sujet" value={data.subject} onChange={update("subject")} />
                <TextField
                  label="Message"
                  multiline
                  minRows={4}
                  value={data.message}
                  onChange={update("message")}
                  error={!!errors.message}
                  helperText={errors.message}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={status === "sending"}
                  endIcon={status === "sending" ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                >
                  Envoyer
                </Button>
              </Stack>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
