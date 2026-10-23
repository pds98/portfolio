import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import { Box, Card, Container, Divider, Typography, useMediaQuery, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { formatPeriod } from "../../utils/format";
import { SectionTitle } from "./SectionTitle";

/**
 * Frise chronologique (design de ExperienceSection du portfolio d'origine),
 * rendue générique pour servir aux expériences ET aux formations.
 * Sur mobile, la frise passe d'une alternance gauche/droite à une seule colonne.
 */
export interface TimelineEntry {
  id: number;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  bullets?: string[];
}

interface TimelineSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  entries: TimelineEntry[];
}

export function TimelineSection({ id, title, subtitle, entries }: TimelineSectionProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  if (entries.length === 0) return null;

  return (
    <Box component="section" aria-labelledby={id} sx={{ py: 10, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <SectionTitle id={id} title={title} subtitle={subtitle} />
        <Timeline
          position={mobile ? "right" : "alternate"}
          sx={mobile ? { p: 0, [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } } : undefined}
        >
          {entries.map((entry, index) => (
            <TimelineItem key={entry.id}>
              <TimelineSeparator>
                <TimelineDot color="primary" sx={{ boxShadow: "0 0 0 4px rgba(49,130,206,.2)" }} />
                {index < entries.length - 1 && <TimelineConnector sx={{ bgcolor: "primary.main" }} />}
              </TimelineSeparator>
              <TimelineContent sx={{ textAlign: "left" }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      mb: 2,
                      textAlign: "left", // la frise alternée aligne à droite par défaut : on garde un texte lisible
                      transition: "all .3s ease",
                      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px -10px rgba(0,0,0,.15)" },
                    }}
                  >
                    <Typography variant="h6" component="h3" fontWeight={600}>
                      {entry.title}
                    </Typography>
                    <Typography color="primary" fontWeight={500}>
                      {entry.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {formatPeriod(entry.startDate, entry.endDate)}
                    </Typography>
                    {(entry.description || entry.bullets?.length) && <Divider sx={{ my: 2 }} />}
                    {entry.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {entry.description}
                      </Typography>
                    )}
                    {entry.bullets && entry.bullets.length > 0 && (
                      <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                        {entry.bullets.map((b, i) => (
                          <Typography component="li" variant="body2" key={i} sx={{ mb: 0.75, lineHeight: 1.6 }}>
                            {b}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </Box>
  );
}
