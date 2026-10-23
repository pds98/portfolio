import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { closeBrowser } from "../../src/cv/pdf.js";
import { pool } from "../../src/db.js";
import { connectRedis, redis } from "../../src/redis.js";

/**
 * Tests d'intégration : vraie base PostgreSQL + vrai Redis (ceux de docker compose).
 * Lancement : INTEGRATION=1 npm test   (ou `npm run test:integration` dans le conteneur)
 * La génération PDF est testée seulement si Chromium est disponible (WITH_PDF=1).
 */
const enabled = process.env.INTEGRATION === "1";
const withPdf = process.env.WITH_PDF === "1";

describe.skipIf(!enabled)("API (intégration PostgreSQL + Redis)", () => {
  const app = createApp();
  const stamp = Date.now();
  const email = `test.${stamp}@example.com`;
  const password = "Integration2026";
  const agent = request.agent(app); // conserve le cookie de session entre les requêtes
  let slug = "";

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'test.%@example.com'");
    await closeBrowser();
    await pool.end();
    await redis.quit();
  });

  it("refuse l'accès au tableau de bord sans session (401)", async () => {
    await request(app).get("/api/profile").expect(401);
    await request(app).get("/api/cv/preview").expect(401);
  });

  it("inscrit un utilisateur et ouvre une session httpOnly (RF-01, RF-02)", async () => {
    const res = await agent
      .post("/api/auth/register")
      .send({ email, password, fullName: "Test Intégration" })
      .expect(201);
    expect(res.body.user.email).toBe(email);
    slug = res.body.user.slug;
    expect(slug).toMatch(/^test-integration/);
    expect(String(res.headers["set-cookie"])).toMatch(/sid=.+HttpOnly/i);
  });

  it("refuse un second compte avec le même courriel (409)", async () => {
    await request(app).post("/api/auth/register").send({ email, password, fullName: "Doublon" }).expect(409);
  });

  it("refuse un mauvais mot de passe sans révéler si le compte existe", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password: "Mauvais123" }).expect(401);
    expect(res.body.error).toBe("Courriel ou mot de passe incorrect");
  });

  it("valide les données reçues (400 + détail des champs)", async () => {
    const res = await agent.post("/api/experiences").send({ position: "", company: "X" }).expect(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it("CRUD des expériences et réordonnancement (§4.2)", async () => {
    const a = await agent
      .post("/api/experiences")
      .send({ position: "Dev A", company: "Acme", startDate: "2022-01-01", achievements: ["Réalisation 1"] })
      .expect(201);
    const b = await agent
      .post("/api/experiences")
      .send({ position: "Dev B", company: "Globex", startDate: "2023-01-01", endDate: "2024-01-01" })
      .expect(201);
    expect(b.body.sortOrder).toBeGreaterThan(a.body.sortOrder);

    await agent
      .put(`/api/experiences/${a.body.id}`)
      .send({ position: "Dev A+", company: "Acme", startDate: "2022-01-01", achievements: [] })
      .expect(200);
    await agent
      .put("/api/experiences/reorder")
      .send({ ids: [b.body.id, a.body.id] })
      .expect(204);

    const list = await agent.get("/api/experiences").expect(200);
    expect(list.body.map((e: { position: string }) => e.position)).toEqual(["Dev B", "Dev A+"]);

    await agent.delete(`/api/experiences/${b.body.id}`).expect(204);
    await agent.get(`/api/experiences/${b.body.id}`).expect(404);
  });

  it("isole les données entre utilisateurs", async () => {
    const other = request.agent(app);
    await other
      .post("/api/auth/register")
      .send({ email: `test.other.${stamp}@example.com`, password, fullName: "Autre Personne" })
      .expect(201);
    const mine = await agent.get("/api/experiences").expect(200);
    await other.get(`/api/experiences/${mine.body[0].id}`).expect(404);
    await other.delete(`/api/experiences/${mine.body[0].id}`).expect(404);
    await other
      .put("/api/experiences/reorder")
      .send({ ids: [mine.body[0].id] })
      .expect(400);
  });

  it("un portfolio privé est introuvable publiquement (RF-11)", async () => {
    await request(app).get(`/api/public/${slug}`).expect(404);
  });

  it("met en cache le portfolio public et l'invalide à chaque modification (RF-13)", async () => {
    await agent.put("/api/profile/settings").send({ slug, isPublic: true, allowCvDownload: false }).expect(200);

    const first = await request(app).get(`/api/public/${slug}`).expect(200);
    expect(first.headers["x-cache"]).toBe("MISS");
    const second = await request(app).get(`/api/public/${slug}`).expect(200);
    expect(second.headers["x-cache"]).toBe("HIT");

    await agent.post("/api/skills").send({ name: "SQL", category: "langage", level: 4 }).expect(201);
    const third = await request(app).get(`/api/public/${slug}`).expect(200);
    expect(third.headers["x-cache"]).toBe("MISS");
    expect(third.body.skills.map((s: { name: string }) => s.name)).toContain("SQL");
  });

  it("refuse le téléchargement public du CV si l'étudiant ne l'autorise pas", async () => {
    await request(app).get(`/api/public/${slug}/cv`).expect(403);
  });

  it("renvoie l'aperçu HTML du CV selon le gabarit et les sections (RF-22, RF-23)", async () => {
    const res = await agent.get("/api/cv/preview?template=modern&sections=experiences").expect(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain("Test Intégration");
    expect(res.text).toContain("Dev A+");
    expect(res.text).not.toContain(">SQL<"); // section compétences non cochée
  });

  it("exporte le CV en JSON Resume (bonus RF-27)", async () => {
    const res = await agent.get("/api/cv/json").expect(200);
    expect(res.headers["content-disposition"]).toContain("CV_Test_Integration.json");
    expect(res.body.basics.name).toBe("Test Intégration");
  });

  it.skipIf(!withPdf)(
    "génère le PDF, puis le sert depuis le cache Redis (RF-20, RF-25, RF-26)",
    async () => {
      const first = await agent.get("/api/cv/download?template=classic").buffer(true).expect(200);
      expect(first.headers["content-type"]).toBe("application/pdf");
      expect(first.headers["content-disposition"]).toBe('attachment; filename="CV_Test_Integration.pdf"');
      expect(first.headers["x-cache"]).toBe("MISS");
      expect(Number(first.headers["x-cv-pages"])).toBeLessThanOrEqual(2);

      const second = await agent.get("/api/cv/download?template=classic").expect(200);
      expect(second.headers["x-cache"]).toBe("HIT");

      // Toute modification change data_version -> nouveau PDF
      await agent.post("/api/skills").send({ name: "Docker", category: "outil", level: 3 }).expect(201);
      const third = await agent.get("/api/cv/download?template=classic").expect(200);
      expect(third.headers["x-cache"]).toBe("MISS");
    },
    60_000,
  );

  it("change le mot de passe (RF-03)", async () => {
    await agent.put("/api/auth/password").send({ currentPassword: "faux", newPassword: "Nouveau2026" }).expect(400);
    await agent.put("/api/auth/password").send({ currentPassword: password, newPassword: "Nouveau2026" }).expect(204);
    await request(app).post("/api/auth/login").send({ email, password: "Nouveau2026" }).expect(200);
  });

  it("la déconnexion supprime la session dans Redis (RF-02)", async () => {
    const temp = request.agent(app);
    await temp.post("/api/auth/login").send({ email, password: "Nouveau2026" }).expect(200);
    await temp.get("/api/auth/me").expect(200);
    await temp.post("/api/auth/logout").expect(204);
    await temp.get("/api/auth/me").expect(401);
  });

  it("supprime le compte et toutes ses données (RF-04)", async () => {
    const { rows } = await pool.query<{ id: number }>("SELECT id FROM users WHERE email = $1", [email]);
    const id = rows[0]!.id;
    await agent.delete("/api/auth/account").send({ password: "Nouveau2026" }).expect(204);
    await agent.get("/api/auth/me").expect(401);
    const left = await pool.query("SELECT 1 FROM experiences WHERE user_id = $1", [id]);
    expect(left.rowCount).toBe(0);
    await request(app).get(`/api/public/${slug}`).expect(404);
  });
});
