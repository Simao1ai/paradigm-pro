import type { Express } from "express";
import { isAuthenticated } from "./replit_integrations/auth/index.js";
import { storage } from "./storage.js";
import { stripe, PLANS, getOrCreateStripeCustomer, createCheckoutSession, createPortalSession, type PlanKey } from "./stripe.js";
import { streamCoachingReply } from "./ai/chat.js";
import Anthropic from "@anthropic-ai/sdk";
import { triggerEmailSequence, processEmailQueue, checkInactivity, checkChurnRisk } from "./email/service.js";
import type Stripe from "stripe";

export function registerRoutes(app: Express) {
  // ── Activity Tracking Middleware ───────────────────────────────────────────
  app.use(async (req: any, _res, next) => {
    if (req.user?.claims?.sub) {
      storage.updateLastActive(req.user.claims.sub).catch(() => {});
    }
    next();
  });

  // ── Profile ──────────────────────────────────────────────────────────────
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile) {
        const user = req.user.claims;
        const newProfile = await storage.createProfile({
          id: userId,
          fullName: [user.first_name, user.last_name].filter(Boolean).join(" ") || "",
          avatarUrl: user.profile_image_url || null,
          role: "student",
        });
        // Trigger welcome email sequence for new users
        triggerEmailSequence(userId, "signup").catch(() => {});
        return res.json(newProfile);
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await storage.updateProfile(userId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [progress, streak, badges, affirmation, nextSession, allLessons, checkInToday, activeGoals, pendingItems, checkInStreak] = await Promise.all([
        storage.getLessonProgress(userId),
        storage.getUserStreak(userId),
        storage.getUserBadges(userId),
        storage.getRandomAffirmation(),
        storage.getNextSession(userId),
        storage.getAllLessons(),
        storage.getTodayCheckIn(userId),
        storage.getLongTermGoals(userId, "active"),
        storage.getActionItems(userId, false),
        storage.getCheckInStreak(userId),
      ]);

      const completedItems = progress.filter((p: any) => p.status === "completed");
      const lessonsCompleted = completedItems.length;
      const completedLessonNumbers = completedItems.map((p: any) => p.lessonNumber);
      const completedSet = new Set(completedLessonNumbers);

      const nextLessonRow = allLessons.find((l: any) => !completedSet.has(l.lessonNumber));
      const nextLesson = nextLessonRow
        ? { number: nextLessonRow.lessonNumber, title: nextLessonRow.title, slug: nextLessonRow.slug, subtitle: nextLessonRow.subtitle || "", estimatedMinutes: nextLessonRow.estimatedMinutes || 45 }
        : null;

      const upcomingSession = nextSession
        ? { scheduledAt: nextSession.scheduledAt, ...(nextSession.zoomMeetingUrl ? { zoomMeetingUrl: nextSession.zoomMeetingUrl } : {}) }
        : null;

      res.json({
        affirmation: affirmation ? { content: affirmation.content, author: affirmation.author } : null,
        lessonsCompleted,
        currentStreak: streak.currentStreak,
        badgeCount: badges.length,
        progressPercent: Math.round((lessonsCompleted / 12) * 100),
        completedLessonNumbers,
        nextLesson,
        upcomingSession,
        checkInToday: !!checkInToday,
        checkInStreak,
        coachInsight: checkInToday?.aiInsight || null,
        activeGoals: activeGoals.slice(0, 3),
        pendingActionItems: pendingItems.slice(0, 3),
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // ── Lessons ───────────────────────────────────────────────────────────────
  app.get("/api/lessons", isAuthenticated, async (_req: any, res) => {
    try {
      const allLessons = await storage.getAllLessons();
      res.json(allLessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.get("/api/lessons/:slug", isAuthenticated, async (req: any, res) => {
    try {
      const lesson = await storage.getLessonBySlug(req.params.slug);
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // ── Progress ──────────────────────────────────────────────────────────────
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getLessonProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, status } = req.body;
      const result = await storage.upsertLessonProgress(userId, lessonId, status);

      // If marking completed, award points + activity + badges
      if (status === "completed") {
        storage.getLessonProgress(userId).then(async (allProgress) => {
          const completedCount = allProgress.filter((p: any) => p.status === "completed").length;

          // Award +10 pts for lesson completion (fire-and-forget)
          storage.awardPoints(userId, 10, "Completed a lesson").catch(() => {});
          storage.updateStreak(userId).catch(() => {});
          storage.addActivity(userId, "lesson", `completed a lesson`).catch(() => {});

          if (completedCount >= 12) {
            storage.awardPoints(userId, 500, "Completed the full course").catch(() => {});
            triggerEmailSequence(userId, "completion").catch(() => {});
            storage.addActivity(userId, "lesson", `completed the full Thinking Into Results program! 🎉`).catch(() => {});
          } else if (completedCount >= 4) {
            triggerEmailSequence(userId, "upsell").catch(() => {});
          }

          storage.checkAndAwardBadges(userId).catch(() => {});
        }).catch(() => {});
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // ── Notes ─────────────────────────────────────────────────────────────────
  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getUserNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, content } = req.body;
      const note = await storage.upsertNote(userId, lessonId, content);
      res.json(note);
    } catch (error) {
      console.error("Error saving note:", error);
      res.status(500).json({ message: "Failed to save note" });
    }
  });

  // ── Goals ─────────────────────────────────────────────────────────────────
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalsList = await storage.getUserGoals(userId);
      res.json(goalsList);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.createGoal({ ...req.body, userId });
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.updateGoal(req.params.id, userId, req.body);
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteGoal(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // ── Badges ────────────────────────────────────────────────────────────────
  app.get("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [definitions, earned] = await Promise.all([
        storage.getBadgeDefinitions(),
        storage.getUserBadges(userId),
      ]);
      res.json({ definitions, earned });
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // ── Roadmap ───────────────────────────────────────────────────────────────
  app.get("/api/roadmap", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [days, progress] = await Promise.all([
        storage.getRoadmapDays(),
        storage.getRoadmapProgress(userId),
      ]);
      res.json({ days, progress });
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      res.status(500).json({ message: "Failed to fetch roadmap" });
    }
  });

  app.post("/api/roadmap/:dayNumber", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dayNumber = parseInt(req.params.dayNumber);
      const { completed, reflection } = req.body;
      const result = await storage.upsertRoadmapProgress(userId, dayNumber, completed, reflection);
      res.json(result);
    } catch (error) {
      console.error("Error updating roadmap:", error);
      res.status(500).json({ message: "Failed to update roadmap" });
    }
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifs = await storage.getUserNotifications(userId);
      res.json(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markNotificationRead(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification:", error);
      res.status(500).json({ message: "Failed to mark notification" });
    }
  });

  // ── Billing ───────────────────────────────────────────────────────────────
  app.get("/api/billing", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sub = await storage.getUserSubscription(userId);
      if (!sub) return res.status(404).json({ message: "No subscription found" });
      res.json(sub);
    } catch (error) {
      console.error("Error fetching billing:", error);
      res.status(500).json({ message: "Failed to fetch billing" });
    }
  });

  // ── Stripe: Checkout ──────────────────────────────────────────────────────
  app.post("/api/stripe/checkout", isAuthenticated, async (req: any, res) => {
    if (!stripe) return res.status(503).json({ message: "Payments not configured" });
    try {
      const userId = req.user.claims.sub;
      const { planKey, couponCode } = req.body as { planKey: PlanKey; couponCode?: string };

      if (!planKey || !PLANS[planKey]) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const plan = PLANS[planKey];
      if (!plan.priceId) {
        return res.status(503).json({ message: "Plan price not configured" });
      }

      const user = req.user.claims;
      const email = user.email || `${userId}@replit.user`;
      const customerId = await getOrCreateStripeCustomer(userId, email);

      let stripeCouponId: string | undefined;
      if (couponCode) {
        const coupon = await storage.getCouponByCode(couponCode);
        if (!coupon) return res.status(400).json({ message: "Invalid coupon code" });
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
          return res.status(400).json({ message: "Coupon has expired" });
        }
        stripeCouponId = coupon.stripeCouponId || undefined;
      }

      const origin = req.headers.origin || process.env.APP_URL || "";
      const session = await createCheckoutSession(
        customerId,
        plan.priceId,
        planKey,
        userId,
        stripeCouponId,
        `${origin}/billing?success=true`,
        `${origin}/billing?canceled=true`,
      );

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: error.message || "Failed to create checkout session" });
    }
  });

  // ── Stripe: Portal ────────────────────────────────────────────────────────
  app.post("/api/stripe/portal", isAuthenticated, async (req: any, res) => {
    if (!stripe) return res.status(503).json({ message: "Payments not configured" });
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile?.stripeCustomerId) {
        return res.status(404).json({ message: "No billing account found" });
      }
      const origin = req.headers.origin || process.env.APP_URL || "";
      const session = await createPortalSession(profile.stripeCustomerId, `${origin}/billing`);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe portal error:", error);
      res.status(500).json({ message: error.message || "Failed to create portal session" });
    }
  });

  // ── Stripe: Webhook ───────────────────────────────────────────────────────
  app.post("/api/stripe/webhook", async (req: any, res) => {
    if (!stripe) return res.status(503).send("Payments not configured");

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
      return res.json({ received: true });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const planKey = session.metadata?.planKey as PlanKey;

          if (userId && session.subscription && planKey) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            const plan = PLANS[planKey];
            await storage.upsertSubscription({
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0]?.price.id || "",
              planType: plan.planType,
              billingInterval: plan.billingInterval,
              status: sub.status,
              currentPeriodStart: new Date((sub as any).current_period_start * 1000),
              currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
              cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
              trialEnd: (sub as any).trial_end ? new Date((sub as any).trial_end * 1000) : undefined,
            });
          }

          if (session.payment_intent && userId) {
            await storage.createPayment({
              userId,
              stripePaymentIntentId: session.payment_intent as string,
              stripeSubscriptionId: session.subscription as string | undefined,
              amount: session.amount_total || 0,
              currency: session.currency || "usd",
              status: "succeeded",
              planType: PLANS[planKey as PlanKey]?.planType || null,
              billingInterval: PLANS[planKey as PlanKey]?.billingInterval || null,
            });
          }
          // Trigger enrollment email sequence
          if (userId) triggerEmailSequence(userId, "enrollment").catch(() => {});
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.created": {
          const sub = event.data.object as Stripe.Subscription;
          const userId = sub.metadata?.userId;
          if (!userId) break;

          const priceId = sub.items.data[0]?.price.id || "";
          const matchedPlan = Object.values(PLANS).find(p => p.priceId === priceId);

          await storage.upsertSubscription({
            userId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            planType: matchedPlan?.planType || "self_guided",
            billingInterval: matchedPlan?.billingInterval || "month",
            status: sub.status,
            currentPeriodStart: new Date((sub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
            trialEnd: (sub as any).trial_end ? new Date((sub as any).trial_end * 1000) : undefined,
          });
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const userId = sub.metadata?.userId;
          if (!userId) break;

          const priceId = sub.items.data[0]?.price.id || "";
          await storage.upsertSubscription({
            userId,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            planType: "self_guided",
            billingInterval: "month",
            status: "canceled",
            cancelAtPeriodEnd: false,
          });
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const userId = sub.metadata?.userId;
            if (userId) {
              const priceId = sub.items.data[0]?.price.id || "";
              await storage.upsertSubscription({
                userId,
                stripeCustomerId: sub.customer as string,
                stripeSubscriptionId: sub.id,
                stripePriceId: priceId,
                planType: "self_guided",
                billingInterval: "month",
                status: "past_due",
                cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
              });
            }
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          const userId = (invoice as any).subscription_details?.metadata?.userId
            || (invoice as any).metadata?.userId;
          if (userId && invoice.payment_intent) {
            await storage.createPayment({
              userId,
              stripePaymentIntentId: invoice.payment_intent as string,
              stripeSubscriptionId: invoice.subscription as string | undefined,
              amount: invoice.amount_paid || 0,
              currency: invoice.currency || "usd",
              status: "succeeded",
            });
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error("Webhook handler error:", err);
    }

    res.json({ received: true });
  });

  // ── Admin ─────────────────────────────────────────────────────────────────
  app.get("/api/admin/overview", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const overview = await storage.getAdminOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching admin overview:", error);
      res.status(500).json({ message: "Failed to fetch overview" });
    }
  });

  app.get("/api/admin/students", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/admin/revenue", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const stats = await storage.getRevenueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ message: "Failed to fetch revenue" });
    }
  });

  // ── Admin: Coupons ────────────────────────────────────────────────────────
  app.get("/api/admin/coupons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const couponList = await storage.getCoupons();
      res.json(couponList);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });

      const { code, discountPercent, maxUses, expiresAt } = req.body;
      if (!code || !discountPercent) {
        return res.status(400).json({ message: "Code and discount percent are required" });
      }

      const coupon = await storage.createCoupon({
        code,
        discountPercent: parseInt(discountPercent),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      });
      res.json(coupon);
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      if (error.code === "23505") return res.status(400).json({ message: "Coupon code already exists" });
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.patch("/api/admin/coupons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const coupon = await storage.toggleCoupon(req.params.id, req.body.active);
      res.json(coupon);
    } catch (error) {
      console.error("Error toggling coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // ── AI Usage & Helpers ─────────────────────────────────────────────────────

  function getAnthropicClient() {
    return new Anthropic({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    });
  }

  // Return AI usage for today
  app.get("/api/ai/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.checkAiUsage(userId);
      res.json(usage);
    } catch (error) {
      console.error("AI usage error:", error);
      res.status(500).json({ message: "Failed to get usage" });
    }
  });

  // ── AI Action Plan ─────────────────────────────────────────────────────────

  app.post("/api/ai/action-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, lessonTitle, lessonContent } = req.body;
      if (!lessonId || !lessonTitle) {
        return res.status(400).json({ message: "lessonId and lessonTitle required" });
      }

      const client = getAnthropicClient();
      const prompt = `You are a performance coach helping a student apply Bob Proctor's "Thinking Into Results" program.

Generate a personalized 3-5 step action plan based on this lesson. Return ONLY valid JSON — no markdown, no explanation:

{
  "steps": [
    {
      "title": "Action step title (5-8 words)",
      "description": "2-3 sentences describing exactly what to do and why it matters.",
      "deadline_suggestion": "Today | Within 24 hours | This week | Ongoing daily"
    }
  ]
}

LESSON: ${lessonTitle}
CONTENT: ${lessonContent || "No additional content provided."}`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");

      const parsed = JSON.parse(jsonMatch[0]);
      const steps = parsed.steps;
      if (!Array.isArray(steps)) throw new Error("Invalid steps format");

      const plan = await storage.saveActionPlan(userId, lessonId, lessonTitle, steps);
      res.json({ plan, steps });
    } catch (error: any) {
      console.error("Action plan error:", error);
      res.status(500).json({ message: error.message || "Failed to generate action plan" });
    }
  });

  app.get("/api/ai/action-plan/:lessonId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plan = await storage.getLatestActionPlan(userId, req.params.lessonId);
      res.json({ plan });
    } catch (error) {
      res.status(500).json({ message: "Failed to get action plan" });
    }
  });

  // ── AI Quiz Generator ──────────────────────────────────────────────────────

  app.post("/api/ai/generate-quiz", isAuthenticated, async (req: any, res) => {
    try {
      const { lessonId, lessonTitle, lessonContent } = req.body;
      if (!lessonId || !lessonTitle) {
        return res.status(400).json({ message: "lessonId and lessonTitle required" });
      }

      const client = getAnthropicClient();
      const prompt = `You are a coaching AI generating a comprehension quiz for Bob Proctor's "Thinking Into Results" program.

Generate exactly 5 multiple-choice questions that test genuine understanding and real-world application of this lesson. Return ONLY valid JSON — no markdown, no explanation:

{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "1-2 sentences explaining why this answer is correct."
    }
  ]
}

Make questions practical and thought-provoking, not trivial recall. Vary difficulty.

LESSON: ${lessonTitle}
CONTENT: ${lessonContent || "No additional content provided."}`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");

      const parsed = JSON.parse(jsonMatch[0]);
      const questions = parsed.questions;
      if (!Array.isArray(questions) || questions.length === 0) throw new Error("Invalid questions format");

      res.json({ questions });
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate quiz" });
    }
  });

  app.post("/api/ai/quiz-result", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, lessonTitle, score, totalQuestions, answers } = req.body;
      const result = await storage.saveQuizResult(userId, lessonId, lessonTitle, score, totalQuestions, answers);
      // Award points for perfect score
      if (score === totalQuestions && totalQuestions > 0) {
        storage.awardPoints(userId, 25, `Perfect quiz score on ${lessonTitle}`).catch(() => {});
        storage.addActivity(userId, "lesson", `scored 100% on the ${lessonTitle} quiz!`).catch(() => {});
        storage.checkAndAwardBadges(userId).catch(() => {});
      }
      res.json({ result });
    } catch (error) {
      res.status(500).json({ message: "Failed to save quiz result" });
    }
  });

  app.get("/api/ai/quiz-results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const results = await storage.getUserQuizResults(userId);
      res.json({ results });
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz results" });
    }
  });

  app.get("/api/ai/quiz-result/:lessonId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await storage.getLatestQuizResult(userId, req.params.lessonId);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz result" });
    }
  });

  // ── AI Coaching Chat ──────────────────────────────────────────────────────

  // GET or create a conversation for a lesson
  app.post("/api/coaching/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, lessonTitle, lessonContent } = req.body;
      if (!lessonId || !lessonTitle) {
        return res.status(400).json({ message: "lessonId and lessonTitle are required" });
      }
      const conversation = await storage.getOrCreateCoachingConversation(
        userId, lessonId, lessonTitle, lessonContent || "",
      );
      const msgs = await storage.getCoachingMessages(conversation.id);
      res.json({ conversation, messages: msgs });
    } catch (error) {
      console.error("Coaching start error:", error);
      res.status(500).json({ message: "Failed to start coaching session" });
    }
  });

  // Stream a coaching reply (SSE)
  app.post("/api/coaching/:conversationId/stream", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { conversationId } = req.params;
    const { userMessage } = req.body;

    if (!userMessage?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Check usage limit
    const usage = await storage.checkAiUsage(userId);
    if (!usage.allowed) {
      return res.status(429).json({
        message: "Daily message limit reached",
        used: usage.used,
        limit: usage.limit,
        upgradeUrl: "/billing",
      });
    }

    const conversation = await storage.getCoachingConversation(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Save user message
    await storage.addCoachingMessage(conversationId, "user", userMessage.trim());

    // Build history for context (last 20 messages)
    const allMessages = await storage.getCoachingMessages(conversationId);
    const history = allMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let assistantText = "";
    try {
      const profile = await storage.getProfile(userId);
      const userName = profile?.fullName || undefined;

      assistantText = await streamCoachingReply(
        conversation.lessonTitle || "Thinking Into Results",
        conversation.lessonContent || "",
        history,
        userName,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        },
      );

      // Save full assistant reply and increment usage
      await Promise.all([
        storage.addCoachingMessage(conversationId, "assistant", assistantText),
        storage.incrementAiUsage(userId),
      ]);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (error: any) {
      console.error("Coaching stream error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message || "Failed to get response" })}\n\n`);
    }
    res.end();
  });

  // Clear a conversation's messages
  app.delete("/api/coaching/:conversationId/clear", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCoachingConversation(req.params.conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Coaching clear error:", error);
      res.status(500).json({ message: "Failed to clear conversation" });
    }
  });

  // ── Phase 4: Long-Term Goals ─────────────────────────────────────────────
  app.get("/api/long-term-goals", isAuthenticated, async (req: any, res) => {
    try {
      const goals = await storage.getLongTermGoals(req.user.claims.sub);
      res.json(goals);
    } catch (err) { res.status(500).json({ message: "Failed to get goals" }); }
  });

  app.post("/api/long-term-goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, targetDate } = req.body;
      if (!title) return res.status(400).json({ message: "title required" });
      const goal = await storage.createLongTermGoal(userId, {
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      });
      res.json(goal);
    } catch (err) { res.status(500).json({ message: "Failed to create goal" }); }
  });

  app.put("/api/long-term-goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const goal = await storage.updateLongTermGoal(req.params.id, req.user.claims.sub, req.body);
      if (!goal) return res.status(404).json({ message: "Not found" });
      res.json(goal);
    } catch (err) { res.status(500).json({ message: "Failed to update goal" }); }
  });

  app.delete("/api/long-term-goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteLongTermGoal(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Failed to delete goal" }); }
  });

  // Weekly goals PUT/DELETE
  app.put("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.updateGoal(req.params.id, req.user.claims.sub, req.body);
      res.json(result || { success: true });
    } catch (err) { res.status(500).json({ message: "Failed to update goal" }); }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteGoal(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Failed to delete goal" }); }
  });

  // ── Phase 4: Daily Check-In ───────────────────────────────────────────────
  app.get("/api/check-in/today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkIn = await storage.getTodayCheckIn(userId);
      if (!checkIn) return res.json(null);
      const streak = await storage.getCheckInStreak(userId);
      res.json({ ...checkIn, streak });
    } catch (err) { res.status(500).json({ message: "Failed to get check-in" }); }
  });

  app.post("/api/check-in", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mood, wins, struggles, tomorrowPlan } = req.body;
      if (!mood || !wins || !struggles || !tomorrowPlan) {
        return res.status(400).json({ message: "All fields required" });
      }

      const client = getAnthropicClient();
      let aiInsight = "";
      try {
        const profile = await storage.getProfile(userId);
        const activeGoals = await storage.getLongTermGoals(userId, "active");
        const streak = await storage.getCheckInStreak(userId);

        const prompt = `You are a supportive life coach. A student just completed their daily check-in:
Mood: ${mood}/5
Win today: "${wins}"
Challenge: "${struggles}"  
Tomorrow's priority: "${tomorrowPlan}"
Current streak: ${streak + 1} days
Active goals: ${activeGoals.slice(0, 2).map((g) => g.title).join(", ") || "None set"}
Name: ${profile?.fullName || "there"}

Write a warm, personalized 2-3 sentence insight. Be specific to their actual win and challenge. End with one brief encouraging thought about their streak or goals. Be direct, genuine, not sycophantic.`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 200,
          messages: [{ role: "user", content: prompt }],
        });
        aiInsight = (response.content[0] as any).text || "";
      } catch {}

      const checkIn = await storage.createCheckIn(userId, { mood, wins, struggles, tomorrowPlan, aiInsight });
      const streak = await storage.getCheckInStreak(userId);
      // Award points + update streak + activity
      storage.awardPoints(userId, 5, "Daily check-in completed").catch(() => {});
      storage.updateStreak(userId).catch(() => {});
      storage.addActivity(userId, "checkin", `completed their daily check-in`).catch(() => {});
      storage.checkAndAwardBadges(userId).catch(() => {});
      res.json({ ...checkIn, streak });
    } catch (err) {
      console.error("Check-in error:", err);
      res.status(500).json({ message: "Failed to save check-in" });
    }
  });

  app.get("/api/check-in/history", isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getCheckInHistory(req.user.claims.sub, 30);
      res.json(history);
    } catch (err) { res.status(500).json({ message: "Failed to get history" }); }
  });

  // ── Phase 4: Action Items ─────────────────────────────────────────────────
  app.get("/api/action-items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const includeCompleted = req.query.includeCompleted === "true";
      const items = await storage.getActionItems(userId, includeCompleted);
      res.json(items);
    } catch (err) { res.status(500).json({ message: "Failed to get action items" }); }
  });

  app.put("/api/action-items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.updateActionItem(req.params.id, req.user.claims.sub, req.body);
      res.json(item);
    } catch (err) { res.status(500).json({ message: "Failed to update action item" }); }
  });

  app.delete("/api/action-items/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteActionItem(req.params.id, req.user.claims.sub);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Failed to delete action item" }); }
  });

  app.post("/api/ai/generate-actions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, lessonTitle, lessonContent } = req.body;

      const client = getAnthropicClient();
      const profile = await storage.getProfile(userId);
      const activeGoals = await storage.getLongTermGoals(userId, "active");

      const prompt = `You are a life coach. A student just completed the lesson: "${lessonTitle || "Thinking Into Results lesson"}".

${lessonContent ? `Lesson content summary: ${lessonContent.slice(0, 500)}` : ""}
${activeGoals.length > 0 ? `Student's active goals: ${activeGoals.map((g) => g.title).join(", ")}` : ""}
Student name: ${profile?.fullName || "Student"}

Generate exactly 2-3 specific, actionable, time-bound action items for this student to complete within the next 7 days based on the lesson. Each action item should:
1. Be concrete and measurable
2. Connect to their real goals if possible
3. Take 15-60 minutes to complete

Respond with JSON array only:
[
  {"title": "Action title", "description": "What exactly to do and why"},
  {"title": "Action title", "description": "What exactly to do and why"}
]`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (response.content[0] as any).text || "[]";
      const match = text.match(/\[[\s\S]*\]/);
      const parsed: { title: string; description: string }[] = match ? JSON.parse(match[0]) : [];

      const items = await storage.createActionItems(
        userId,
        parsed.map((p) => ({ title: p.title, description: p.description, lessonId })),
      );

      res.json(items);
    } catch (err) {
      console.error("Generate actions error:", err);
      res.status(500).json({ message: "Failed to generate action items" });
    }
  });

  // ── Phase 4: AI Goal Refinement ───────────────────────────────────────────
  app.post("/api/ai/refine-goal", isAuthenticated, async (req: any, res) => {
    try {
      const { goalText, description } = req.body;
      if (!goalText) return res.status(400).json({ message: "goalText required" });

      const client = getAnthropicClient();
      const profile = await storage.getProfile(req.user.claims.sub);

      const prompt = `You are a certified goal achievement coach trained in Bob Proctor's methods. 
A student wants to set this goal: "${goalText}"
${description ? `Context: "${description}"` : ""}
Name: ${profile?.fullName || "Student"}

Transform this into a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound).
Respond with JSON only:
{
  "refinedTitle": "Clear, specific SMART goal title (max 15 words)",
  "refinedDescription": "2-3 sentences expanding on what success looks like, how to measure it, and why it matters. Include a specific timeframe."
}`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (response.content[0] as any).text || "{}";
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : {};
      res.json(parsed);
    } catch (err) {
      console.error("Refine goal error:", err);
      res.status(500).json({ message: "Failed to refine goal" });
    }
  });

  // ── Phase 4: Weekly Reports ───────────────────────────────────────────────
  app.get("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const reports = await storage.getWeeklyReports(req.user.claims.sub);
      res.json(reports);
    } catch (err) { res.status(500).json({ message: "Failed to get reports" }); }
  });

  // ── Phase 5: Community Routes ─────────────────────────────────────────────
  app.get("/api/discussions", isAuthenticated, async (req: any, res) => {
    try {
      const { lessonId } = req.query;
      if (!lessonId) return res.status(400).json({ message: "lessonId required" });
      const discussions = await storage.getDiscussions(lessonId as string, req.user.claims.sub);
      res.json(discussions);
    } catch (err) { res.status(500).json({ message: "Failed to get discussions" }); }
  });

  app.post("/api/discussions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lessonId, title, content } = req.body;
      if (!lessonId || !title || !content) return res.status(400).json({ message: "lessonId, title, content required" });
      const disc = await storage.createDiscussion(userId, lessonId, title, content);
      // Award points + activity
      storage.awardPoints(userId, 10, "Posted a discussion").catch(() => {});
      storage.addActivity(userId, "discussion", `posted a question in the forum`, { discussionId: disc.id }).catch(() => {});
      storage.checkAndAwardBadges(userId).catch(() => {});
      res.json(disc);
    } catch (err) { res.status(500).json({ message: "Failed to create discussion" }); }
  });

  app.get("/api/discussions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const disc = await storage.getDiscussion(req.params.id, req.user.claims.sub);
      if (!disc) return res.status(404).json({ message: "Not found" });
      res.json(disc);
    } catch (err) { res.status(500).json({ message: "Failed to get discussion" }); }
  });

  app.post("/api/discussions/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: "content required" });
      const reply = await storage.createReply(userId, req.params.id, content);
      storage.awardPoints(userId, 5, "Replied to a discussion").catch(() => {});
      storage.addActivity(userId, "reply", `replied to a discussion`).catch(() => {});
      storage.checkAndAwardBadges(userId).catch(() => {});
      res.json(reply);
    } catch (err) { res.status(500).json({ message: "Failed to create reply" }); }
  });

  app.post("/api/discussions/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.toggleDiscussionLike(req.user.claims.sub, req.params.id);
      if (result.liked) {
        // Award +2 to discussion owner
        const disc = await storage.getDiscussion(req.params.id);
        if (disc && disc.userId !== req.user.claims.sub) {
          storage.awardPoints(disc.userId, 2, "Received a like on discussion").catch(() => {});
        }
      }
      res.json(result);
    } catch (err) { res.status(500).json({ message: "Failed to toggle like" }); }
  });

  app.post("/api/discussions/:id/replies/:replyId/like", isAuthenticated, async (req: any, res) => {
    try {
      const result = await storage.toggleReplyLike(req.user.claims.sub, req.params.replyId);
      res.json(result);
    } catch (err) { res.status(500).json({ message: "Failed to toggle reply like" }); }
  });

  app.post("/api/discussions/:id/pin", isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getProfile(req.user.claims.sub);
      if (!profile || !["admin", "consultant"].includes(profile.role)) {
        return res.status(403).json({ message: "Admin only" });
      }
      const { pinned } = req.body;
      const disc = await storage.pinDiscussion(req.params.id, !!pinned);
      res.json(disc);
    } catch (err) { res.status(500).json({ message: "Failed to pin discussion" }); }
  });

  app.get("/api/community/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const period = (req.query.period as "alltime" | "month" | "week") || "alltime";
      const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
      const entries = await storage.getLeaderboard(period, limit);
      res.json(entries);
    } catch (err) { res.status(500).json({ message: "Failed to get leaderboard" }); }
  });

  app.get("/api/community/feed", isAuthenticated, async (_req, res) => {
    try {
      const feed = await storage.getActivityFeed(50);
      res.json(feed);
    } catch (err) { res.status(500).json({ message: "Failed to get feed" }); }
  });

  app.get("/api/community/my-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pts = await storage.getUserPoints(userId);
      res.json(pts);
    } catch (err) { res.status(500).json({ message: "Failed to get stats" }); }
  });

  app.get("/api/community/profile/:userId", isAuthenticated, async (req, res) => {
    try {
      const pub = await storage.getUserPublicProfile(req.params.userId);
      if (!pub) return res.status(404).json({ message: "Not found" });
      res.json(pub);
    } catch (err) { res.status(500).json({ message: "Failed to get profile" }); }
  });

  // ── Email Admin ──────────────────────────────────────────────────────────
  app.get("/api/admin/email/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const stats = await storage.getEmailStats();
      const sequences = await storage.getEmailSequences();
      res.json({ ...stats, activeSequences: sequences.filter((s) => s.active).length });
    } catch (err) {
      console.error("Email stats error:", err);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/admin/email/sequences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const sequences = await storage.getEmailSequences();
      const withSteps = await Promise.all(
        sequences.map(async (seq) => ({
          ...seq,
          steps: await storage.getEmailSteps(seq.id),
        })),
      );
      res.json(withSteps);
    } catch (err) {
      console.error("Email sequences error:", err);
      res.status(500).json({ message: "Failed to get sequences" });
    }
  });

  app.post("/api/admin/email/sequences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const { name, triggerEvent } = req.body;
      if (!name || !triggerEvent) return res.status(400).json({ message: "name and triggerEvent required" });
      const seq = await storage.createEmailSequence(name, triggerEvent);
      res.json(seq);
    } catch (err) {
      res.status(500).json({ message: "Failed to create sequence" });
    }
  });

  app.patch("/api/admin/email/sequences/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const seq = await storage.updateEmailSequence(req.params.id, req.body);
      res.json(seq);
    } catch (err) {
      res.status(500).json({ message: "Failed to update sequence" });
    }
  });

  app.delete("/api/admin/email/sequences/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      await storage.deleteEmailSequence(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete sequence" });
    }
  });

  app.get("/api/admin/email/logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const { search, limit = "50", offset = "0" } = req.query as Record<string, string>;
      const logs = await storage.getEmailLogs({
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: "Failed to get logs" });
    }
  });

  app.post("/api/admin/email/seed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const { seedDefaultSequences } = await import("./email/service.js");
      // Force reseed by clearing existing and re-seeding
      const existing = await storage.getEmailSequences();
      if (existing.length === 0) {
        await seedDefaultSequences();
        res.json({ seeded: true });
      } else {
        res.json({ seeded: false, message: "Sequences already exist" });
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to seed sequences" });
    }
  });

  app.post("/api/admin/email/process", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "admin") return res.status(403).json({ message: "Forbidden" });
      const result = await processEmailQueue();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to process queue" });
    }
  });

  // Unsubscribe (public)
  app.get("/api/email/unsubscribe", async (req: any, res) => {
    try {
      const { userId } = req.query as { userId: string };
      if (userId) {
        await storage.updateProfile(userId, { emailOptOut: true } as any);
      }
      res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f9f9fb;">
        <h2 style="color:#1e1b4b;">You've been unsubscribed</h2>
        <p style="color:#6b7280;">You will no longer receive automated emails from Paradigm Pro.</p>
        <a href="/" style="color:#f97316;">Return to app</a>
      </body></html>`);
    } catch (err) {
      res.status(500).send("Error processing unsubscribe");
    }
  });

  // ── Consultant ────────────────────────────────────────────────────────────
  app.get("/api/consultant/students", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role !== "consultant") return res.status(403).json({ message: "Forbidden" });
      const students = await storage.getConsultantStudents(userId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching consultant students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
}
