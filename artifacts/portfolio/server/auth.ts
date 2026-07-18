import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "./neon.js";

const SALT_ROUNDS = 12;

// ── JWT ──────────────────────────────────────────────────────────────────────

export function getJwtSecret(): string {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET env var is not set.");
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "24h" });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, getJwtSecret()) as { userId: string };
}

// ── Database helpers ──────────────────────────────────────────────────────────

interface AdminRow {
  user_id: string;
  password_hash: string;
}

export async function adminExists(): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM admin_credentials`;
  return (rows[0] as { count: number }).count > 0;
}

export async function getAdmin(): Promise<AdminRow | null> {
  const sql = getDb();
  const rows =
    await sql`SELECT user_id, password_hash FROM admin_credentials LIMIT 1`;
  return rows.length > 0 ? (rows[0] as AdminRow) : null;
}

export async function createAdmin(
  userId: string,
  password: string
): Promise<void> {
  const sql = getDb();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await sql`
    INSERT INTO admin_credentials (user_id, password_hash)
    VALUES (${userId}, ${passwordHash})
  `;
}

export async function updateAdmin(
  newUserId: string,
  newPassword: string
): Promise<void> {
  const sql = getDb();
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await sql`
    UPDATE admin_credentials
    SET user_id = ${newUserId},
        password_hash = ${passwordHash},
        updated_at = NOW()
  `;
}

export async function checkCredentials(
  userId: string,
  password: string
): Promise<boolean> {
  const admin = await getAdmin();
  if (!admin) return false;
  const userMatch = userId === admin.user_id;
  const passMatch = await bcrypt.compare(password, admin.password_hash);
  return userMatch && passMatch;
}

// ── Input validation ──────────────────────────────────────────────────────────

export function validateUserId(v: unknown): string | null {
  if (typeof v !== "string" || v.trim().length < 3)
    return "User ID must be at least 3 characters.";
  return null;
}

export function validatePassword(v: unknown): string | null {
  if (typeof v !== "string" || v.length < 8)
    return "Password must be at least 8 characters.";
  return null;
}
