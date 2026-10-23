import DataObjectIcon from "@mui/icons-material/DataObject";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { cvApi, resourceApi, type CvChoice } from "../../api";
import { CV_SECTIONS, type CvSection, type CvTemplate } from "../../types/portfolio";

/**
 * Génération du CV (§4.4, cœur du projet).
 *  RF-21 choix du modèle · RF-22 choix des sections et des éléments ·
 *  RF-23 aperçu en direct · RF-20/25 téléchargement CV_Prenom_Nom.pdf ·
 *  RF-26 l'en-tête X-Cache indique si le PDF venait du cache Redis ·
 *  RF-27 export JSON Resume · RF-28 FR / EN.
 */
const SECTION_LABELS: Record<CvSection, string> = {
  profile: "Profil (biographie)",
  experiences: "Expériences",
  education: "Formations",
  skills: "Compétences",
  projects: "Projets",
  certifications: "Certifications",
};

const TEMPLATES: { id: CvTemplate; name: string; description: string; swatch: string }[] = [
  {
    id: "classic",
    name: "Classique",
    description: "Une colonne, sobre et dense",
    swatch: "linear-gradient(#fff 0 18%, #1a365d 18% 20%, #fff 20%)",
  },
  {
    id: "modern",
    name: "Moderne",
    description: "Deux colonnes, barre latérale bleue",
    swatch: "linear-gradient(to right, #1a237e 0 32%, #fff 32%)",
  },
];

/** Largeur d'une page A4 à 96 ppp (210 mm) + marges de l'aperçu. */
const SHEET_PX = 860;

/** Met l'aperçu à l'échelle de son conteneur (la feuille A4 reste entière, sans défilement horizontal). */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / SHEET_PX));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, scale };
}

interface Item {
  id: number;
  label: string;
}

export default function CvPanel() {
  const [choice, setChoice] = useState<CvChoice>({
    template: "modern",
    lang: "fr",
    sections: [...CV_SECTIONS],
    hidden: {},
  });
  const [items, setItems] = useState<Partial<Record<CvSection, Item[]>>>({});
  const [html, setHtml] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { ref: previewRef, scale } = useFitScale();

  // Liste des éléments de chaque section (pour pouvoir en masquer certains)
  useEffect(() => {
    Promise.all([
      resourceApi("experiences").list(),
      resourceApi("education").list(),
      resourceApi("skills").list(),
      resourceApi("projects").list(),
      resourceApi("certifications").list(),
    ])
      .then(([exp, edu, skills, projects, certs]) =>
        setItems({
          experiences: exp.map((e) => ({ id: e.id, label: `${e.position} — ${e.company}` })),
          education: edu.map((e) => ({ id: e.id, label: `${e.degree} — ${e.school}` })),
          skills: skills.map((s) => ({ id: s.id, label: s.name })),
          projects: projects.map((p) => ({ id: p.id, label: p.title })),
          certifications: certs.map((c) => ({ id: c.id, label: c.name })),
        }),
      )
      .catch((e: Error) => setError(e.message));
  }, []);

  // Aperçu : rechargé 400 ms après le dernier changement (évite une requête par clic)
  const query = useMemo(() => JSON.stringify(choice), [choice]);
  useEffect(() => {
    setLoadingPreview(true);
    const timer = setTimeout(() => {
      cvApi
        .preview(choice)
        .then((h) => {
          setHtml(h);
          setError(null);
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoadingPreview(false));
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleSection = (s: CvSection) =>
    setChoice((c) => ({
      ...c,
      sections: c.sections.includes(s)
        ? c.sections.filter((x) => x !== s)
        : CV_SECTIONS.filter((x) => x === s || c.sections.includes(x)),
    }));

  const toggleItem = (s: CvSection, id: number) =>
    setChoice((c) => {
      const current = c.hidden[s] ?? [];
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...c, hidden: { ...c.hidden, [s]: next } };
    });

  const download = async () => {
    setDownloading(true);
    setInfo(null);
    try {
      const { filename, headers } = await cvApi.download(choice);
      const cache = headers.get("X-Cache");
      const pages = headers.get("X-CV-Pages");
      setInfo(
        `${filename} téléchargé · ${pages ?? "?"} page(s) · ${cache === "HIT" ? "servi depuis le cache Redis ⚡" : "généré puis mis en cache"}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 3 }}>
        Mon CV
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "340px minmax(0, 1fr)" },
          alignItems: "start",
        }}
      >
        {/* ------------------------------------------------ options */}
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom component="h2">
              Modèle
            </Typography>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
              role="radiogroup"
              aria-label="Modèle de CV"
            >
              {TEMPLATES.map((t) => {
                const selected = choice.template === t.id;
                return (
                  <Card
                    key={t.id}
                    variant="outlined"
                    sx={{ borderColor: selected ? "primary.main" : "divider", borderWidth: selected ? 2 : 1 }}
                  >
                    <CardActionArea
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setChoice((c) => ({ ...c, template: t.id }))}
                    >
                      <Box
                        sx={{ height: 70, background: t.swatch, borderBottom: 1, borderColor: "divider" }}
                        aria-hidden
                      />
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography fontWeight={600}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom component="h2">
              Langue
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={choice.lang}
              onChange={(_, v: "fr" | "en" | null) => v && setChoice((c) => ({ ...c, lang: v }))}
              aria-label="Langue du CV"
            >
              <ToggleButton value="fr">Français</ToggleButton>
              <ToggleButton value="en">English</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom component="h2">
              Sections et éléments
            </Typography>
            {CV_SECTIONS.map((s) => {
              const enabled = choice.sections.includes(s);
              const list = s === "profile" ? [] : (items[s] ?? []);
              return (
                <Box key={s}>
                  <FormControlLabel
                    control={<Checkbox checked={enabled} onChange={() => toggleSection(s)} />}
                    label={SECTION_LABELS[s]}
                  />
                  <Collapse in={enabled && list.length > 0}>
                    <Box sx={{ pl: 4, display: "flex", flexDirection: "column" }}>
                      {list.map((it) => (
                        <FormControlLabel
                          key={it.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={!(choice.hidden[s] ?? []).includes(it.id)}
                              onChange={() => toggleItem(s, it.id)}
                            />
                          }
                          label={<Typography variant="body2">{it.label}</Typography>}
                        />
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>

          <Stack spacing={1}>
            <Button
              variant="contained"
              size="large"
              startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
              onClick={() => void download()}
              disabled={downloading}
            >
              Télécharger mon CV (PDF)
            </Button>
            <Button
              variant="outlined"
              startIcon={<DataObjectIcon />}
              onClick={() => void cvApi.downloadJson().catch((e: Error) => setError(e.message))}
            >
              Exporter en JSON Resume
            </Button>
            {info && <Alert severity="success">{info}</Alert>}
          </Stack>
        </Stack>

        {/* ------------------------------------------------ aperçu */}
        <Box sx={{ position: "relative", minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} component="h2">
              Aperçu
            </Typography>
            <Chip size="small" label="Les traits rouges marquent la fin de chaque page A4" variant="outlined" />
            {loadingPreview && <CircularProgress size={18} aria-label="Mise à jour de l'aperçu" />}
          </Stack>
          <Box
            ref={previewRef}
            sx={{
              height: { xs: "70vh", lg: "calc(100vh - 180px)" },
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "#e9ecef",
            }}
          >
            <iframe
              title="Aperçu du CV"
              srcDoc={html}
              sandbox=""
              style={{
                width: SHEET_PX,
                height: `${100 / scale}%`,
                border: 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
