import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth/index.js";
import { registerRoutes } from "./routes.js";
import { seedDefaultSequences, processEmailQueue, checkInactivity, checkChurnRisk } from "./email/service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Raw body for Stripe webhook (must be before json middleware)
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.set("trust proxy", 1);

async function start() {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerRoutes(app);

  const port = 5000;
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === "production") {
    // Vite outputs to client/dist relative to project root
    const distPath = path.resolve(process.cwd(), "client/dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      root: path.resolve(__dirname, "../client"),
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(
          url,
          (await import("fs")).readFileSync(
            path.resolve(__dirname, "../client/index.html"),
            "utf-8"
          )
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Exiting so the process manager can restart cleanly.`);
      process.exit(1);
    }
    throw err;
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    httpServer.close(() => process.exit(0));
  });

  // Seed default email sequences on startup
  seedDefaultSequences().catch((err) => console.error("[Email] Seed error:", err));

  // ── Cron Jobs ────────────────────────────────────────────────────────────
  cron.schedule("0 * * * *", async () => {
    try { await processEmailQueue(); }
    catch (err) { console.error("[Cron] Queue error:", err); }
  });

  cron.schedule("0 */6 * * *", async () => {
    try { await checkInactivity(); }
    catch (err) { console.error("[Cron] Inactivity error:", err); }
  });

  cron.schedule("0 */12 * * *", async () => {
    try { await checkChurnRisk(); }
    catch (err) { console.error("[Cron] Churn error:", err); }
  });

  cron.schedule("0 7 * * 0", async () => {
    try {
      const { generateWeeklyReports } = await import("./email/weeklyReports.js");
      await generateWeeklyReports();
    } catch (err) { console.error("[Cron] Weekly reports error:", err); }
  });

  cron.schedule("0 8 * * *", async () => {
    try {
      const { sendAccountabilityEmails } = await import("./email/accountability.js");
      await sendAccountabilityEmails();
    } catch (err) { console.error("[Cron] Accountability error:", err); }
  });

  // Every 2 hours: AI auto-reply to unanswered forum discussions
  cron.schedule("0 */2 * * *", async () => {
    try {
      const { storage } = await import("./storage.js");
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({
        apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
      });
      const discussions = await storage.getDiscussionsNeedingAiReply();
      if (discussions.length === 0) return;
      const AI_USER_ID = "ai-coach";
      const existing = await storage.getProfile(AI_USER_ID).catch(() => null);
      if (!existing) {
        await storage.createProfile({ id: AI_USER_ID, fullName: "AI Coach", avatarUrl: null, role: "consultant" });
      }
      for (const disc of discussions.slice(0, 5)) {
        try {
          const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 300,
            messages: [{
              role: "user",
              content: `You are an encouraging life-coach AI for a mindset transformation course. A student posted this question and nobody has answered yet:\n\nTitle: "${disc.title}"\nContent: "${disc.content}"\n\nWrite a warm, practical 2–3 paragraph reply. Be specific, encouraging, and cite Bob Proctor's Thinking Into Results principles where relevant. Do NOT use bullet points — write in flowing prose.`,
            }],
          });
          const content = (msg.content[0] as any).text || "";
          if (content) await storage.createReply(AI_USER_ID, disc.id, content, true);
        } catch (e) { console.error("[Cron] AI reply error for disc", disc.id, e); }
      }
      console.log(`[Cron] AI replied to ${Math.min(discussions.length, 5)} discussions`);
    } catch (err) { console.error("[Cron] AI auto-reply error:", err); }
  });

  console.log("[Cron] Email automation jobs scheduled");
}

start().catch(console.error);
