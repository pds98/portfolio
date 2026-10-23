import { Component, type ReactNode } from "react";

/**
 * Barrière d'erreur autour de l'animation 3D : si WebGL est indisponible ou si
 * Three.js plante, on termine l'intro au lieu de laisser une page blanche.
 * (Les barrières d'erreur React s'écrivent encore sous forme de classe.)
 */
interface Props {
  onError: () => void;
  children: ReactNode;
}

export class IntroBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Animation d'intro désactivée :", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
