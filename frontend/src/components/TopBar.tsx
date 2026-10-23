import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AppBar, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useThemeMode } from "../context/ThemeModeContext";

/** Barre supérieure commune : logo/titre, actions contextuelles et bascule clair/sombre. */
export function TopBar({ title = "Portfolio Pro", actions }: { title?: string; actions?: ReactNode }) {
  const { mode, toggle } = useThemeMode();
  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: "background.paper" }}>
      <Toolbar sx={{ gap: 1 }}>
        <div style={{ marginRight: "auto", minWidth: 0 }}>
          <RouterLink to="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h6"
              component="span"
              noWrap
              sx={{ color: "primary.main", fontWeight: 700, display: "block" }}
            >
              {title}
            </Typography>
          </RouterLink>
        </div>
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
        </Stack>
        <Tooltip title={mode === "dark" ? "Thème clair" : "Thème sombre"}>
          <IconButton onClick={toggle} aria-label="Changer de thème" color="inherit">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
