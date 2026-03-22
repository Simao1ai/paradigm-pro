import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileUser } from "@/lib/mobile-auth";

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Get the authenticated user from either NextAuth session (web) or Bearer token (mobile).
 * Returns null if not authenticated.
 */
export async function getUser(req: Request): Promise<AuthUser | null> {
  // Try mobile Bearer token first
  const mobileUser = getMobileUser(req);
  if (mobileUser) {
    return mobileUser;
  }

  // Fall back to NextAuth session (web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: (session.user as { id: string }).id,
      email: session.user.email!,
      role: (session.user as { role: string }).role,
    };
  }

  return null;
}
