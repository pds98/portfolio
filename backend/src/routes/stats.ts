import { Router } from "express";
import { pool } from "../db.js";
import { currentUserId, requireAuth } from "../middleware/auth.js";
import { getVisitCount } from "../services/visits.js";
import { asyncHandler } from "../utils/http.js";

/** GET /api/stats – nombre de visites et derniers messages reçus (tableau de bord). */
export const statsRouter = Router();
statsRouter.use(requireAuth);

statsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = currentUserId(req);
    const [visits, messages] = await Promise.all([
      getVisitCount(userId),
      pool.query(
        `SELECT id, name, email, subject, message, created_at AS "createdAt"
           FROM contact_messages WHERE user_id = $1
          ORDER BY created_at DESC LIMIT 20`,
        [userId],
      ),
    ]);
    res.json({ visits, messages: messages.rows });
  }),
);
