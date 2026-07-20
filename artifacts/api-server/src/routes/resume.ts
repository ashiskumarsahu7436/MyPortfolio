import { Router } from "express";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "../middleware/auth";

const router = Router();

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

// GET /api/resume — public
router.get("/resume", async (_req, res) => {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM resume LIMIT 1`;
    if (rows.length === 0) {
      res.status(404).json({ error: "Resume not found." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/resume — admin only
router.patch("/resume", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const { file_url, last_updated } = req.body as {
      file_url?: string;
      last_updated?: string | null;
    };
    const rows = await sql`
      UPDATE resume SET
        file_url     = COALESCE(${file_url     ?? null}, file_url),
        last_updated = COALESCE(${last_updated ?? null}::date, last_updated),
        updated_at   = NOW()
      RETURNING *
    `;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
