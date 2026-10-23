import { CssBaseline, ThemeProvider, useMediaQuery, type PaletteMode } from "@mui/material";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createAppTheme } from "../theme";

/** Bonus « thème clair / sombre » : préférence mémorisée dans le navigateur. */
interface ThemeModeValue {
  mode: PaletteMode;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeValue>({ mode: "light", toggle: () => undefined });
const STORAGE_KEY = "portfolio-theme";

function readStored(): PaletteMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null; // navigation privée : localStorage indisponible
  }
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [stored, setStored] = useState<PaletteMode | null>(readStored);
  const mode: PaletteMode = stored ?? (prefersDark ? "dark" : "light");

  const value = useMemo<ThemeModeValue>(
    () => ({
      mode,
      toggle: () => {
        const next = mode === "dark" ? "light" : "dark";
        setStored(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* préférence non persistée, sans conséquence */
        }
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);
