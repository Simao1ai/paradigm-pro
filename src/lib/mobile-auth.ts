import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

interface MobileTokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Extract user from Bearer token (mobile auth).
 * Returns null if no Bearer token or invalid token.
 * Use alongside getServerSession for routes that support both web and mobile.
 */
export function getMobileUser(req: NextRequest | Request): MobileTokenPayload | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MobileTokenPayload;
    if (!decoded.id || !decoded.email) return null;
    return decoded;
  } catch {
    return null;
  }
}
