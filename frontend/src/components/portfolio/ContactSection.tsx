import { Box, Container, Stack } from "@mui/material";
import { useState } from "react";
import { publicApi } from "../../api";
import type { Profile } from "../../types/portfolio";
import { ContactCard } from "../common/ContactCard";
import { ContactForm } from "../common/ContactForm";
import { QRCodeDialog } from "../common/QRCodeDialog";
import { SectionTitle } from "./SectionTitle";

/** Section contact : formulaire réel (API) + coordonnées + QR code. */
export function ContactSection({ slug, profile }: { slug: string; profile: Profile }) {
  const [qrOpen, setQrOpen] = useState(false);
  return (
    <Box component="section" id="contact" aria-labelledby="contact-title" sx={{ py: 10, scrollMarginTop: 64 }}>
      <Container maxWidth="lg">
        <SectionTitle id="contact-title" title="Me contacter" />
        <Stack direction={{ xs: "column-reverse", md: "row" }} spacing={4}>
          <Box sx={{ flex: 1 }}>
            <ContactForm onSubmit={async (data) => void (await publicApi.contact(slug, data))} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <ContactCard profile={profile} onShowQRCode={() => setQrOpen(true)} />
          </Box>
        </Stack>
        <QRCodeDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          contact={{
            name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            url: profile.linkedinUrl ?? profile.websiteUrl,
          }}
        />
      </Container>
    </Box>
  );
}
