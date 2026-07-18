import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminExists } from "../../server/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const setup = await adminExists();
    return res.json({ setup });
  } catch (err) {
    console.error("[auth/status]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
