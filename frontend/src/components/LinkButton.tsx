import { Button, type ButtonProps } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Bouton MUI qui navigue avec React Router (sans recharger la page).
 * Centraliser `component={Link}` ici évite aussi l'erreur TypeScript TS2590
 * (« union type too complex ») que provoque sa répétition dans un même fichier.
 */
export function LinkButton(props: ButtonProps & { to: string }) {
  return <Button component={Link} {...props} />;
}
