import type { Express } from "express";
import { db, pool } from "../db.js";
import { users } from "../../shared/models/auth.js";
import { profiles } from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || process.env.REPL_ID || "mobile-secret";
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

interface TokenPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
  exp: number;
}

function signToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyMobileToken(token: string): TokenPayload | null {
  return verifyToken(token);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return crypto.scryptSync(password, salt, 64).toString("hex") === hash;
}

async function ensureCredentialsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mobile_credentials (
      user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export function registerMobileAuthRoutes(app: Express) {
  ensureCredentialsTable().catch(console.error);

  app.post("/api/auth/mobile/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      const nameParts = (name || "").split(" ");
      const [user] = await db.insert(users).values({
        email,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      }).returning();

      await db.insert(profiles).values({
        id: user.id,
        fullName: name || "",
        role: "student",
      }).onConflictDoNothing();

      const ph = hashPassword(password);
      await pool.query(
        "INSERT INTO mobile_credentials (user_id, password_hash) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET password_hash = $2",
        [user.id, ph]
      );

      res.status(201).json({ id: user.id, email: user.email, name: name || "" });
    } catch (error) {
      console.error("Mobile register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/mobile/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const result = await pool.query(
        "SELECT password_hash FROM mobile_credentials WHERE user_id = $1",
        [user.id]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "No mobile password set for this account" });
      }

      if (!checkPassword(password, result.rows[0].password_hash)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

      const now = Date.now();
      const token = signToken({ sub: user.id, email: user.email || "", type: "access", exp: now + TOKEN_EXPIRY_MS });
      const refreshToken = signToken({ sub: user.id, email: user.email || "", type: "refresh", exp: now + REFRESH_EXPIRY_MS });

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: profile?.fullName || [user.firstName, user.lastName].filter(Boolean).join(" "),
          role: profile?.role || "student",
          image: user.profileImageUrl,
        },
      });
    } catch (error) {
      console.error("Mobile login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/mobile/social", async (req, res) => {
    try {
      const { provider, identityToken, email, fullName } = req.body;

      if (!provider || !identityToken) {
        return res.status(400).json({ error: "Provider and identity token are required" });
      }

      let verifiedEmail = email;

      if (provider === "apple" || provider === "google") {
        try {
          const parts = identityToken.split(".");
          if (parts.length >= 2) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
            verifiedEmail = payload.email || email;
          }
        } catch {
          // fall back to provided email
        }
      }

      if (!verifiedEmail) {
        return res.status(400).json({ error: "Could not determine email from token" });
      }

      let [user] = await db.select().from(users).where(eq(users.email, verifiedEmail)).limit(1);

      if (!user) {
        const nameParts = (fullName || "").split(" ");
        [user] = await db.insert(users).values({
          email: verifiedEmail,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
        }).returning();

        await db.insert(profiles).values({
          id: user.id,
          fullName: fullName || "",
          role: "student",
        }).onConflictDoNothing();
      }

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

      const now = Date.now();
      const token = signToken({ sub: user.id, email: user.email || "", type: "access", exp: now + TOKEN_EXPIRY_MS });
      const refreshToken = signToken({ sub: user.id, email: user.email || "", type: "refresh", exp: now + REFRESH_EXPIRY_MS });

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: profile?.fullName || [user.firstName, user.lastName].filter(Boolean).join(" "),
          role: profile?.role || "student",
          image: user.profileImageUrl,
        },
      });
    } catch (error) {
      console.error("Social auth error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/mobile/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
      }

      const payload = verifyToken(refreshToken);
      if (!payload || payload.type !== "refresh") {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const now = Date.now();
      res.json({
        token: signToken({ sub: user.id, email: user.email || "", type: "access", exp: now + TOKEN_EXPIRY_MS }),
        refreshToken: signToken({ sub: user.id, email: user.email || "", type: "refresh", exp: now + REFRESH_EXPIRY_MS }),
      });
    } catch (error) {
      console.error("Mobile refresh error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
