import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Card, Container, Link, Typography } from "@mui/material";
import type { Certification } from "../../types/portfolio";
import { formatMonth } from "../../utils/format";
import { SectionTitle } from "./SectionTitle";

export function CertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (certifications.length === 0) return null;
  return (
    <Box component="section" aria-labelledby="certif-title" sx={{ py: 8, bgcolor: "background.paper" }}>
      <Container maxWidth="md">
        <SectionTitle id="certif-title" title="Certifications" />
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          {certifications.map((c) => (
            <Card key={c.id} variant="outlined" sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "flex-start" }}>
              <VerifiedIcon color="primary" aria-hidden />
              <Box>
                <Typography fontWeight={600}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {[c.issuer, c.issueDate && formatMonth(c.issueDate)].filter(Boolean).join(" · ")}
                </Typography>
                {c.credentialUrl && (
                  <Link href={c.credentialUrl} target="_blank" rel="noopener noreferrer" variant="body2">
                    Voir l'attestation
                  </Link>
                )}
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
