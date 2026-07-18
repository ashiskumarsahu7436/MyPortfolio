import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  adminExists,
  createAdmin,
  signToken,
  validateUserId,
  validatePassword,
} from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    if (await adminExists())
      return res.status(409).json({
        error:
          "Admin account already exists. Use /api/auth/reset to change credentials.",
      });

    const { userId, password } = req.body as {
      userId?: string;
      password?: string;
    };

    const userErr = validateUserId(userId);
    if (userErr) return res.status(400).json({ error: userErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });

    await createAdmin(userId!.trim(), password!);
    return res.json({ token: signToken(userId!.trim()) });
  } catch (err) {
    console.error("[auth/setup]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
