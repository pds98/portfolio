import { Box, Chip, Container, LinearProgress, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PortfolioData, SkillCategory } from "../../types/portfolio";
import { CATEGORY_LABELS, LEVEL_LABELS, yearsSince } from "../../utils/format";
import { SectionTitle } from "./SectionTitle";

/**
 * « À propos » + compétences – mise en page du portfolio d'origine.
 * Changements : les compteurs sont CALCULÉS à partir des données (plus de valeurs
 * inventées) et le niveau 1–5 de la base est affiché en barre de 20 % à 100 %.
 */
function useCountUp(target: number, durationMs = 1500): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return setValue(0);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

function Counter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const shown = useCountUp(value);
  return (
    <Paper elevation={2} sx={{ p: 2, flex: 1, minWidth: 140, textAlign: "center" }}>
      <Typography variant="h4" sx={{ color: "secondary.main", fontWeight: 700 }}>
        {shown}
        {suffix}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

const BAR_CATEGORIES: SkillCategory[] = ["langage", "framework", "outil", "langue"];

export function AboutSection({ data }: { data: PortfolioData }) {
  const { profile, skills, experiences, projects } = data;
  const years = yearsSince(experiences.map((e) => e.startDate));
  const softSkills = skills.filter((s) => s.category === "soft_skill");

  return (
    <Box component="section" aria-labelledby="about-title" sx={{ py: 10 }}>
      <Container>
        <SectionTitle id="about-title" title="À propos de moi" />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            sx={{ flex: "1 1 400px", minWidth: 0 }}
          >
            {(profile.bio ?? "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((p, i) => (
                <Typography key={i} paragraph sx={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
                  {p}
                </Typography>
              ))}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 3 }}>
              <Counter label="Années d'expérience" value={years} suffix="+" />
              <Counter label="Projets" value={projects.length} />
              <Counter label="Compétences" value={skills.length} />
            </Box>
            {softSkills.length > 0 && (
              <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {softSkills.map((s) => (
                  <Chip key={s.id} label={s.name} color="secondary" variant="outlined" />
                ))}
              </Box>
            )}
          </Box>

          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            sx={{ flex: "1 1 400px", minWidth: 0 }}
          >
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom color="primary">
                Compétences
              </Typography>
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                {BAR_CATEGORIES.map((cat) => {
                  const list = skills.filter((s) => s.category === cat);
                  if (!list.length) return null;
                  return (
                    <Box key={cat}>
                      <Typography variant="subtitle1" component="h4" fontWeight={700} sx={{ mb: 1 }}>
                        {CATEGORY_LABELS[cat]}
                      </Typography>
                      {list.map((s) => (
                        <Box key={s.id} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {s.name}
                            </Typography>
                            {s.level && (
                              <Typography variant="caption" color="text.secondary">
                                {LEVEL_LABELS[s.level]}
                              </Typography>
                            )}
                          </Box>
                          {s.level && (
                            <LinearProgress
                              variant="determinate"
                              value={s.level * 20}
                              aria-label={`${s.name} : niveau ${s.level} sur 5`}
                              color="secondary"
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
