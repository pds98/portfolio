import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

/** Titre de section animé, commun à toutes les sections du portfolio public. */
export function SectionTitle({ title, subtitle, id }: { title: string; subtitle?: string; id?: string }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      sx={{ textAlign: "center", mb: 6 }}
    >
      <Typography id={id} variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, color: "primary.main", mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
