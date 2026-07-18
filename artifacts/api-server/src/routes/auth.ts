/**
 * Auth routes — local development only (Express).
 * Production uses Vercel serverless functions in artifacts/portfolio/api/auth/.
 * Both use the same DATABASE_URL + SESSION_SECRET env vars.
 */
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const router = Router();
const SALT_ROUNDS = 12;

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

function getSecret(): string {
  const s = process.env["SESSION_SECRET"];
  if (!s) throw new Error("SESSION_SECRET env var is not set.");
  return s;
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, getSecret(), { expiresIn: "24h" });
}

async function adminExists(): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM admin_credentials`;
  return (rows[0] as { count: number }).count > 0;
}

async function getAdmin(): Promise<{ user_id: string; password_hash: string } | null> {
  const sql = getDb();
  const rows = await sql`SELECT user_id, password_hash FROM admin_credentials LIMIT 1`;
  return rows.length > 0 ? (rows[0] as { user_id: string; password_hash: string }) : null;
}

// GET /api/auth/status
router.get("/auth/status", async (_req, res) => {
  try {
    res.json({ setup: await adminExists() });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/auth/setup
router.post("/auth/setup", async (req, res) => {
  try {
    if (await adminExists()) {
      res.status(409).json({ error: "Admin account already exists. Use /auth/reset to change credentials." });
      return;
    }

    const { userId, password } = req.body as { userId?: string; password?: string };
    if (!userId || userId.trim().length < 3) { res.status(400).json({ error: "User ID must be at least 3 characters." }); return; }
    if (!password || password.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters." }); return; }

    const sql = getDb();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await sql`INSERT INTO admin_credentials (user_id, password_hash) VALUES (${userId.trim()}, ${hash})`;
    res.json({ token: signToken(userId.trim()) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const admin = await getAdmin();
    if (!admin) { res.status(404).json({ error: "No admin account yet. Please set up first." }); return; }

    const { userId, password } = req.body as { userId?: string; password?: string };
    if (!userId || !password) { res.status(400).json({ error: "userId and password are required." }); return; }

    const userMatch = userId.trim() === admin.user_id;
    const passMatch = await bcrypt.compare(password, admin.password_hash);
    if (!userMatch || !passMatch) { res.status(401).json({ error: "Invalid credentials." }); return; }

    res.json({ token: signToken(admin.user_id) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/auth/reset
router.post("/auth/reset", async (req, res) => {
  try {
    const admin = await getAdmin();
    if (!admin) { res.status(404).json({ error: "No admin account yet." }); return; }

    const { userId, password, newUserId, newPassword } = req.body as {
      userId?: string; password?: string; newUserId?: string; newPassword?: string;
    };
    if (!userId || !password || !newUserId || !newPassword) {
      res.status(400).json({ error: "userId, password, newUserId, and newPassword are all required." }); return;
    }

    const userMatch = userId.trim() === admin.user_id;
    const passMatch = await bcrypt.compare(password, admin.password_hash);
    if (!userMatch || !passMatch) { res.status(401).json({ error: "Current credentials are incorrect." }); return; }

    if (newUserId.trim().length < 3) { res.status(400).json({ error: "New User ID must be at least 3 characters." }); return; }
    if (newPassword.length < 8) { res.status(400).json({ error: "New password must be at least 8 characters." }); return; }

    const sql = getDb();
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await sql`UPDATE admin_credentials SET user_id = ${newUserId.trim()}, password_hash = ${hash}, updated_at = NOW()`;
    res.json({ token: signToken(newUserId.trim()) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/auth/verify
router.get("/auth/verify", (req, res) => {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ valid: false, error: "No token provided." }); return; }
  try {
    const payload = jwt.verify(auth.slice(7), getSecret()) as { userId: string };
    res.json({ valid: true, userId: payload.userId });
  } catch {
    res.status(401).json({ valid: false, error: "Token invalid or expired." });
  }
});

export default router;
