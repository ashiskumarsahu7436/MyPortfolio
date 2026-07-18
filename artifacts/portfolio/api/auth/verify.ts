import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ valid: false, error: "No token provided." });

  try {
    const payload = verifyToken(authHeader.slice(7));
    return res.json({ valid: true, userId: payload.userId });
  } catch {
    return res.status(401).json({ valid: false, error: "Token invalid or expired." });
  }
}
