import { ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { cvQuery } from "../api";
import { ContactForm, validateContact } from "../components/common/ContactForm";
import { TimelineSection } from "../components/portfolio/TimelineSection";
import { createAppTheme } from "../theme";
import { formatPeriod } from "../utils/format";

// jsdom n'implémente pas matchMedia ni IntersectionObserver (utilisés par MUI et framer-motion)
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (globalThis as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver ??= IO;
});

const wrap = (ui: ReactNode) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={createAppTheme("light")}>{ui}</ThemeProvider>
    </MemoryRouter>,
  );

describe("<TimelineSection /> (expériences du portfolio public)", () => {
  it("affiche chaque poste, l'entreprise, la période et les réalisations", () => {
    wrap(
      <TimelineSection
        id="exp"
        title="Expérience professionnelle"
        entries={[
          {
            id: 1,
            title: "Technicien informatique",
            subtitle: "Revenu Québec",
            startDate: "2026-05-01",
            endDate: null,
            description: "Soutien technique.",
            bullets: ["Préparation de postes", "Automatisation en Python"],
          },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Expérience professionnelle" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Technicien informatique" })).toBeInTheDocument();
    expect(screen.getByText("Revenu Québec")).toBeInTheDocument();
    expect(screen.getByText(/Présent$/)).toBeInTheDocument();
    expect(screen.getByText("Préparation de postes")).toBeInTheDocument();
    expect(screen.getByText("Automatisation en Python")).toBeInTheDocument();
  });

  it("ne rend rien quand il n'y a aucune entrée", () => {
    const { container } = wrap(<TimelineSection id="x" title="Formation" entries={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("<ContactForm /> (bonus formulaire de contact)", () => {
  it("affiche les erreurs de validation sans appeler l'API", async () => {
    const onSubmit = vi.fn();
    wrap(<ContactForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /envoyer/i }));
    expect(await screen.findByText("Votre nom est requis")).toBeInTheDocument();
    expect(screen.getByText("Courriel invalide")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envoie un message valide puis affiche la confirmation", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    wrap(<ContactForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/^nom/i), "Marie Recruteuse");
    await userEvent.type(screen.getByLabelText(/^courriel/i), "marie@entreprise.ca");
    await userEvent.type(screen.getByLabelText(/^message/i), "Bonjour, votre profil nous intéresse.");
    await userEvent.click(screen.getByRole("button", { name: /envoyer/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: "marie@entreprise.ca" })),
    );
    expect(await screen.findByText(/message envoyé/i)).toBeInTheDocument();
  });

  it("affiche l'erreur renvoyée par le serveur (ex. limite de débit 429)", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Trop de requêtes, réessayez plus tard"));
    wrap(<ContactForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/^nom/i), "Marie");
    await userEvent.type(screen.getByLabelText(/^courriel/i), "marie@entreprise.ca");
    await userEvent.type(screen.getByLabelText(/^message/i), "Un message assez long.");
    await userEvent.click(screen.getByRole("button", { name: /envoyer/i }));
    expect(await screen.findByText("Trop de requêtes, réessayez plus tard")).toBeInTheDocument();
  });
});

describe("utilitaires", () => {
  it("valide le formulaire de contact", () => {
    expect(validateContact({ name: "Al", email: "a@b.ca", subject: "", message: "Message valide !" })).toEqual({});
  });

  it("formate une période en français", () => {
    expect(formatPeriod("2022-11-01", "2024-11-30")).toMatch(/2022 – .*2024/);
  });

  it("sérialise les choix du CV dans la query string attendue par l'API", () => {
    const q = new URLSearchParams(
      cvQuery({ template: "modern", lang: "en", sections: ["experiences", "skills"], hidden: { experiences: [3, 5] } }),
    );
    expect(q.get("template")).toBe("modern");
    expect(q.get("lang")).toBe("en");
    expect(q.get("sections")).toBe("experiences,skills");
    expect(q.get("hide")).toBe("experiences:3,experiences:5");
  });
});
