/**
 * L'animation d'intro (Three.js / react-three-fiber) est isolée dans src/intro,
 * vérifiée par son propre tsconfig.intro.json. Raison : les types de
 * @react-three/fiber ajoutent des milliers d'éléments JSX globaux, ce qui fait
 * échouer le typage des composants MUI (erreur TS2590 « union too complex »).
 * Ce module virtuel expose seulement sa signature au reste de l'application ;
 * Vite le résout vers le vrai fichier (alias dans vite.config.ts).
 */
declare module "@intro" {
  import type { FC } from "react";
  const IntroAnimation: FC<{ onComplete: () => void }>;
  export default IntroAnimation;
}
