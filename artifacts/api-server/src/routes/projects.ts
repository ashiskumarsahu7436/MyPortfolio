import { Router } from "express";
import { neon } from "@neondatabase/serverless";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth";

const router = Router();

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

// GET /api/projects — public (published only) or all if admin token provided
router.get("/projects", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const sql = getDb();
    const isAdmin = !!req.userId;
    const rows = isAdmin
      ? await sql`SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC`
      : await sql`SELECT * FROM projects WHERE published = true ORDER BY sort_order ASC, created_at ASC`;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/projects — admin only
router.post("/projects", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const b = req.body as {
      title: string; description?: string; tech_stack?: string[];
      live_url?: string; github_url?: string; thumbnail?: string;
      sort_order?: number; published?: boolean; status?: string; label?: string;
    };
    if (!b.title?.trim()) {
      res.status(400).json({ error: "Title is required." });
      return;
    }
    const rows = await sql`
      INSERT INTO projects (title, description, tech_stack, live_url, github_url, thumbnail, sort_order, published, status, label)
      VALUES (
        ${b.title.trim()},
        ${b.description ?? ""},
        ${b.tech_stack ?? []},
        ${b.live_url ?? ""},
        ${b.github_url ?? ""},
        ${b.thumbnail ?? ""},
        ${b.sort_order ?? 0},
        ${b.published ?? true},
        ${b.status ?? "In Progress"},
        ${b.label ?? ""}
      )
      RETURNING *
    `;
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/projects/reorder — admin only (must come before :id route)
router.patch("/projects/reorder", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const { orders } = req.body as { orders: { id: number; sort_order: number }[] };
    if (!Array.isArray(orders)) {
      res.status(400).json({ error: "orders must be an array." });
      return;
    }
    await Promise.all(
      orders.map(({ id, sort_order }) =>
        sql`UPDATE projects SET sort_order = ${sort_order} WHERE id = ${id}`
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/projects/:id — admin only
router.patch("/projects/:id", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const id = Number(req.params.id);
    const b = req.body as {
      title?: string; description?: string; tech_stack?: string[];
      live_url?: string; github_url?: string; thumbnail?: string;
      sort_order?: number; published?: boolean; status?: string; label?: string;
    };
    const rows = await sql`
      UPDATE projects SET
        title        = COALESCE(${b.title        ?? null}, title),
        description  = COALESCE(${b.description  ?? null}, description),
        tech_stack   = COALESCE(${b.tech_stack   ?? null}, tech_stack),
        live_url     = COALESCE(${b.live_url     ?? null}, live_url),
        github_url   = COALESCE(${b.github_url   ?? null}, github_url),
        thumbnail    = COALESCE(${b.thumbnail    ?? null}, thumbnail),
        sort_order   = COALESCE(${b.sort_order   ?? null}, sort_order),
        published    = COALESCE(${b.published    ?? null}, published),
        status       = COALESCE(${b.status       ?? null}, status),
        label        = COALESCE(${b.label        ?? null}, label),
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) {
      res.status(404).json({ error: "Project not found." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/projects/:id — admin only
router.delete("/projects/:id", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const id = Number(req.params.id);
    await sql`DELETE FROM projects WHERE id = ${id}`;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
