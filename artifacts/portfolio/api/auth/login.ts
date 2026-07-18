import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminExists, checkCredentials, signToken } from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!(await adminExists()))
      return res
        .status(404)
        .json({ error: "No admin account yet. Please set up first." });

    const { userId, password } = req.body as {
      userId?: string;
      password?: string;
    };

    if (!userId || !password)
      return res
        .status(400)
        .json({ error: "userId and password are required." });

    const valid = await checkCredentials(userId.trim(), password);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials." });

    return res.json({ token: signToken(userId.trim()) });
  } catch (err) {
    console.error("[auth/login]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
