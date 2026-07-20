import { Router } from "express";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "../middleware/auth";

const router = Router();

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

// GET /api/profile — public
router.get("/profile", async (_req, res) => {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM profile LIMIT 1`;
    if (rows.length === 0) {
      res.status(404).json({ error: "Profile not found." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/profile — admin only (full replace — send all fields)
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const b = req.body as {
      full_name: string; tagline: string; bio: string; email: string;
      github_url: string; linkedin_url: string; photo_url: string;
      focus: string; philosophy: string; tech_stack: string[];
    };

    const rows = await sql`
      UPDATE profile SET
        full_name    = ${b.full_name    ?? ""},
        tagline      = ${b.tagline      ?? ""},
        bio          = ${b.bio          ?? ""},
        email        = ${b.email        ?? ""},
        github_url   = ${b.github_url   ?? ""},
        linkedin_url = ${b.linkedin_url ?? ""},
        photo_url    = ${b.photo_url    ?? ""},
        focus        = ${b.focus        ?? ""},
        philosophy   = ${b.philosophy   ?? ""},
        tech_stack   = ${b.tech_stack   ?? []},
        updated_at   = NOW()
      RETURNING *
    `;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
