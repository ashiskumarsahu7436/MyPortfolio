import { Router } from "express";
import { neon } from "@neondatabase/serverless";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth";

const router = Router();

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

// GET /api/certifications — public (published only) or all if admin token provided
router.get("/certifications", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const sql = getDb();
    const isAdmin = !!req.userId;
    const rows = isAdmin
      ? await sql`SELECT * FROM certifications ORDER BY sort_order ASC, created_at ASC`
      : await sql`SELECT * FROM certifications WHERE published = true ORDER BY sort_order ASC, created_at ASC`;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/certifications — admin only
router.post("/certifications", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const b = req.body as {
      title: string; issuer?: string; issue_date?: string | null;
      expiry_date?: string | null; credential_url?: string;
      badge_url?: string; sort_order?: number; published?: boolean;
    };
    if (!b.title?.trim()) {
      res.status(400).json({ error: "Title is required." });
      return;
    }
    const rows = await sql`
      INSERT INTO certifications
        (title, issuer, issue_date, expiry_date, credential_url, badge_url, sort_order, published)
      VALUES (
        ${b.title.trim()},
        ${b.issuer ?? ""},
        ${b.issue_date || null},
        ${b.expiry_date || null},
        ${b.credential_url ?? ""},
        ${b.badge_url ?? ""},
        ${b.sort_order ?? 0},
        ${b.published ?? true}
      )
      RETURNING *
    `;
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/certifications/reorder — admin only (must come before :id route)
router.patch("/certifications/reorder", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const { orders } = req.body as { orders: { id: number; sort_order: number }[] };
    if (!Array.isArray(orders)) {
      res.status(400).json({ error: "orders must be an array." });
      return;
    }
    await Promise.all(
      orders.map(({ id, sort_order }) =>
        sql`UPDATE certifications SET sort_order = ${sort_order} WHERE id = ${id}`
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/certifications/:id — admin only
router.patch("/certifications/:id", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const id = Number(req.params.id);
    const b = req.body as {
      title?: string; issuer?: string; issue_date?: string | null;
      expiry_date?: string | null; credential_url?: string;
      badge_url?: string; sort_order?: number; published?: boolean;
    };
    const rows = await sql`
      UPDATE certifications SET
        title          = COALESCE(${b.title          ?? null}, title),
        issuer         = COALESCE(${b.issuer         ?? null}, issuer),
        issue_date     = CASE WHEN ${Object.prototype.hasOwnProperty.call(b, "issue_date")} THEN ${b.issue_date || null}::date ELSE issue_date END,
        expiry_date    = CASE WHEN ${Object.prototype.hasOwnProperty.call(b, "expiry_date")} THEN ${b.expiry_date || null}::date ELSE expiry_date END,
        credential_url = COALESCE(${b.credential_url ?? null}, credential_url),
        badge_url      = COALESCE(${b.badge_url      ?? null}, badge_url),
        sort_order     = COALESCE(${b.sort_order     ?? null}, sort_order),
        published      = COALESCE(${b.published      ?? null}, published),
        updated_at     = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) {
      res.status(404).json({ error: "Certification not found." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/certifications/:id — admin only
router.delete("/certifications/:id", requireAuth, async (req, res) => {
  try {
    const sql = getDb();
    const id = Number(req.params.id);
    await sql`DELETE FROM certifications WHERE id = ${id}`;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
