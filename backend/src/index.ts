import { createApp } from "./app.js";
import { config } from "./config.js";
import { closeBrowser } from "./cv/pdf.js";
import { pool } from "./db.js";
import { connectRedis, redis } from "./redis.js";
import { flushVisits } from "./services/visits.js";

const VISITS_FLUSH_INTERVAL_MS = 60_000;

async function start() {
  await connectRedis();
  const app = createApp();
  const server = app.listen(config.port, () => console.log(`API démarrée sur le port ${config.port}`));

  // Persistance périodique des compteurs de visites Redis -> PostgreSQL (bonus)
  const flushTimer = setInterval(() => {
    flushVisits().catch((err) => console.error("Échec de la persistance des visites :", err));
  }, VISITS_FLUSH_INTERVAL_MS);

  // Arrêt propre (docker compose down envoie SIGTERM) : on vide les compteurs
  // et on ferme Chromium, PostgreSQL et Redis.
  const shutdown = async (signal: string) => {
    console.log(`${signal} reçu, arrêt en cours…`);
    clearInterval(flushTimer);
    server.close();
    await flushVisits().catch(() => undefined);
    await closeBrowser();
    await pool.end();
    await redis.quit();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
