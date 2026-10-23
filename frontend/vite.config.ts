/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Module virtuel de l'animation 3D (voir src/types/intro.d.ts)
    alias: { "@intro": fileURLToPath(new URL("./src/intro/IntroAnimation.tsx", import.meta.url)) },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: { usePolling: true }, // nécessaire pour le rechargement à chaud dans Docker
  },
  build: {
    // Le paquet Three.js (~950 ko) n'est chargé que pour l'animation d'intro
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Bibliothèques lourdes dans des fichiers séparés (mis en cache par le navigateur)
        manualChunks: {
          mui: ["@mui/material", "@mui/lab", "@emotion/react", "@emotion/styled"],
          three: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
