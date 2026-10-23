import { createTheme, type PaletteMode } from "@mui/material";

/**
 * Thème MUI unique (fusion des deux thèmes du portfolio d'origine :
 * main.tsx + MainLayout.tsx), décliné en mode clair et sombre (bonus).
 * Couleurs reprises du portfolio : bleu #2196f3, violet #6C63FF, dégradé #1a237e -> #0d47a1.
 */
export function createAppTheme(mode: PaletteMode) {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: dark ? "#90caf9" : "#1565c0",
        light: "#64b5f6",
        dark: "#0d47a1",
        contrastText: dark ? "#0b1929" : "#fff",
      },
      secondary: { main: "#6C63FF", contrastText: "#fff" },
      background: dark ? { default: "#0b1220", paper: "#121a2b" } : { default: "#f7f9fc", paper: "#ffffff" },
      text: dark ? { primary: "#e6edf7", secondary: "#a9b6c8" } : { primary: "#1a1a1a", secondary: "#4a5568" },
    },
    typography: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, lineHeight: 1.15 },
      h2: { fontWeight: 700, lineHeight: 1.25 },
      h3: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 500 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: { styleOverrides: { html: { scrollBehavior: "smooth" } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 8, paddingInline: "1.25rem" } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiTextField: { defaultProps: { fullWidth: true, size: "small" } },
    },
  });
}
