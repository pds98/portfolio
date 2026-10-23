import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Project } from "../../types/portfolio";
import { SectionTitle } from "./SectionTitle";

/**
 * Projets avec filtre par technologie – repris du portfolio d'origine.
 * Sans image, la carte affiche un en-tête dégradé avec les initiales du projet.
 */
export function ProjectsSection({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<string>("all");
  const technologies = useMemo(() => Array.from(new Set(projects.flatMap((p) => p.technologies))).sort(), [projects]);
  const visible = selected === "all" ? projects : projects.filter((p) => p.technologies.includes(selected));
  if (projects.length === 0) return null;

  return (
    <Box component="section" aria-labelledby="projects-title" sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <SectionTitle id="projects-title" title="Mes projets" />
        {technologies.length > 1 && (
          <Box
            role="group"
            aria-label="Filtrer par technologie"
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 4 }}
          >
            <Chip label="Tous" onClick={() => setSelected("all")} color={selected === "all" ? "primary" : "default"} />
            {technologies.map((t) => (
              <Chip key={t} label={t} onClick={() => setSelected(t)} color={selected === t ? "primary" : "default"} />
            ))}
          </Box>
        )}
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.08, 0.3) }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform .2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                {p.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={p.imageUrl}
                    alt={`Aperçu du projet ${p.title}`}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    aria-hidden
                    sx={{
                      height: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #1a237e, #6C63FF)",
                      color: "#fff",
                      fontSize: 40,
                      fontWeight: 700,
                      letterSpacing: 2,
                    }}
                  >
                    {p.title
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {p.title}
                  </Typography>
                  {p.description && (
                    <Typography variant="body2" color="text.secondary">
                      {p.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {p.technologies.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" color="primary" />
                    ))}
                  </Box>
                </CardContent>
                {(p.repoUrl || p.demoUrl) && (
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    {p.repoUrl && (
                      <Button
                        size="small"
                        startIcon={<GitHubIcon />}
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Code
                      </Button>
                    )}
                    {p.demoUrl && (
                      <Button
                        size="small"
                        startIcon={<LaunchIcon />}
                        href={p.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Démo
                      </Button>
                    )}
                  </CardActions>
                )}
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
