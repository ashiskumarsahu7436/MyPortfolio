import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  const token = auth.slice(7);
  const secret = process.env["SESSION_SECRET"];
  if (!secret) {
    res.status(500).json({ error: "SERVER_SECRET not configured." });
    return;
  }
  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token invalid or expired." });
  }
}

/** Optional auth — attaches userId if token is valid, doesn't block if missing */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (auth?.startsWith("Bearer ")) {
    const secret = process.env["SESSION_SECRET"];
    if (secret) {
      try {
        const payload = jwt.verify(auth.slice(7), secret) as { userId: string };
        req.userId = payload.userId;
      } catch {
        // invalid token — treat as unauthenticated
      }
    }
  }
  next();
}
