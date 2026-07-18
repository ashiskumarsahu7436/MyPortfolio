import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  checkCredentials,
  updateAdmin,
  signToken,
  validateUserId,
  validatePassword,
} from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, password, newUserId, newPassword } = req.body as {
      userId?: string;
      password?: string;
      newUserId?: string;
      newPassword?: string;
    };

    if (!userId || !password || !newUserId || !newPassword)
      return res.status(400).json({
        error: "userId, password, newUserId, and newPassword are all required.",
      });

    // Verify current credentials first
    const valid = await checkCredentials(userId.trim(), password);
    if (!valid)
      return res.status(401).json({ error: "Current credentials are incorrect." });

    // Validate new values
    const userErr = validateUserId(newUserId);
    if (userErr) return res.status(400).json({ error: userErr });

    const passErr = validatePassword(newPassword);
    if (passErr) return res.status(400).json({ error: passErr });

    await updateAdmin(newUserId.trim(), newPassword);
    return res.json({ token: signToken(newUserId.trim()) });
  } catch (err) {
    console.error("[auth/reset]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
