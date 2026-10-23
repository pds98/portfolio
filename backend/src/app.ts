import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import {
  certificationsRouter,
  educationRouter,
  experiencesRouter,
  projectsRouter,
  skillsRouter,
} from "./routes/crud.js";
import { cvRouter } from "./routes/cv.js";
import { healthRouter } from "./routes/health.js";
import { profileRouter } from "./routes/profile.js";
import { publicRouter } from "./routes/public.js";
import { statsRouter } from "./routes/stats.js";

/**
 * Construction de l'application Express, séparée du démarrage (index.ts)
 * pour pouvoir l'importer dans les tests d'intégration (supertest).
 */
export function createApp() {
  const app = express();

  // Derrière le proxy Docker / un hébergeur : req.ip = vraie IP du client (rate limiting)
  app.set("trust proxy", 1);

  app.use(helmet()); // en-têtes de sécurité (CSP, X-Frame-Options, HSTS…)
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true, // autorise l'envoi du cookie de session depuis le frontend
      exposedHeaders: ["Content-Disposition", "X-Cache", "X-CV-Pages"],
    }),
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/experiences", experiencesRouter);
  app.use("/api/education", educationRouter);
  app.use("/api/skills", skillsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/certifications", certificationsRouter);
  app.use("/api/cv", cvRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/public", publicRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Route introuvable" });
  });
  app.use(errorHandler);

  return app;
}
