import { db } from "./db.js";
import { eq, and, desc, asc, sql, gte, count, sum, lt } from "drizzle-orm";
import {
  profiles, lessons, lessonProgress, lessonNotes, lessonAssets,
  roadmapDays, roadmapProgress, goals, badgeDefinitions, userBadges,
  userStreaks, consultantAssignments, consultantSessions, notifications,
  affirmations, subscriptions, messages, payments, coupons,
  chatConversations, chatMessages,
  aiUsage, actionPlans, quizResults,
  emailSequences, emailSteps, emailLogs, userEmailStates,
  longTermGoals, dailyCheckIns, actionItems, weeklyReports,
  forumDiscussions, forumReplies, discussionLikes, replyLikes, pointsLog, activityFeed,
  users,
  type Profile, type InsertProfile, type InsertGoal, type InsertPayment, type InsertCoupon,
} from "@shared/schema";

class DatabaseStorage {
  async getAllProfiles() {
    return db.select().from(profiles).where(eq(profiles.emailOptOut, false));
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
    return profile;
  }

  async createProfile(data: { id: string; fullName: string; avatarUrl: string | null; role: string }): Promise<Profile> {
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const [profile] = await db.insert(profiles).values({
      id: data.id,
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
      role: data.role,
      referralCode,
    }).returning();
    return profile;
  }

  async updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db.update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, userId))
      .returning();
    return profile;
  }

  async getAllLessons() {
    return db.select().from(lessons).where(eq(lessons.isPublished, true)).orderBy(asc(lessons.sortOrder));
  }

  async getLessonBySlug(slug: string) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.slug, slug));
    if (!lesson) return null;
    const assets = await db.select().from(lessonAssets)
      .where(eq(lessonAssets.lessonId, lesson.id))
      .orderBy(asc(lessonAssets.sortOrder));
    return { ...lesson, assets };
  }

  async getLessonProgress(userId: string) {
    return db.select({
      id: lessonProgress.id,
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
      completedAt: lessonProgress.completedAt,
      lastAccessedAt: lessonProgress.lastAccessedAt,
      lessonNumber: lessons.lessonNumber,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .where(eq(lessonProgress.userId, userId));
  }

  async upsertLessonProgress(userId: string, lessonId: string, status: string) {
    const completedAt = status === "completed" ? new Date() : null;
    const [result] = await db.insert(lessonProgress).values({
      userId, lessonId, status, completedAt, lastAccessedAt: new Date(),
    }).onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { status, completedAt, lastAccessedAt: new Date() },
    }).returning();
    return result;
  }

  async getUserNotes(userId: string) {
    return db.select({
      id: lessonNotes.id,
      lessonId: lessonNotes.lessonId,
      content: lessonNotes.content,
      updatedAt: lessonNotes.updatedAt,
      lessonTitle: lessons.title,
      lessonSlug: lessons.slug,
      lessonNumber: lessons.lessonNumber,
    })
    .from(lessonNotes)
    .leftJoin(lessons, eq(lessonNotes.lessonId, lessons.id))
    .where(eq(lessonNotes.userId, userId))
    .orderBy(desc(lessonNotes.updatedAt));
  }

  async upsertNote(userId: string, lessonId: string, content: string) {
    const [note] = await db.insert(lessonNotes).values({
      userId, lessonId, content, updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: [lessonNotes.userId, lessonNotes.lessonId],
      set: { content, updatedAt: new Date() },
    }).returning();
    return note;
  }

  async getUserGoals(userId: string) {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async createGoal(data: InsertGoal) {
    const [goal] = await db.insert(goals).values(data).returning();
    return goal;
  }

  async getBadgeDefinitions() {
    return db.select().from(badgeDefinitions).orderBy(asc(badgeDefinitions.sortOrder));
  }

  async getUserBadges(userId: string) {
    return db.select({
      id: userBadges.id,
      badgeId: userBadges.badgeId,
      earnedAt: userBadges.earnedAt,
      name: badgeDefinitions.name,
      description: badgeDefinitions.description,
      icon: badgeDefinitions.icon,
      badgeType: badgeDefinitions.badgeType,
    })
    .from(userBadges)
    .innerJoin(badgeDefinitions, eq(userBadges.badgeId, badgeDefinitions.id))
    .where(eq(userBadges.userId, userId));
  }

  async getUserStreak(userId: string) {
    const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    return streak || { currentStreak: 0, longestStreak: 0 };
  }

  async updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; isNewDay: boolean }> {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));

    if (!streak) {
      const [newStreak] = await db.insert(userStreaks)
        .values({ userId, currentStreak: 1, longestStreak: 1, lastActivityAt: today })
        .returning();
      return { currentStreak: 1, longestStreak: 1, isNewDay: true };
    }

    const last = streak.lastActivityAt as string | null;
    if (last === today) return { currentStreak: streak.currentStreak || 0, longestStreak: streak.longestStreak || 0, isNewDay: false };

    const newStreak = last === yesterday ? (streak.currentStreak || 0) + 1 : 1;
    const newLongest = Math.max(newStreak, streak.longestStreak || 0);

    await db.update(userStreaks)
      .set({ currentStreak: newStreak, longestStreak: newLongest, lastActivityAt: today, updatedAt: new Date() })
      .where(eq(userStreaks.userId, userId));

    return { currentStreak: newStreak, longestStreak: newLongest, isNewDay: true };
  }

  async getRoadmapDays() {
    return db.select().from(roadmapDays).orderBy(asc(roadmapDays.sortOrder));
  }

  async getRoadmapProgress(userId: string) {
    return db.select().from(roadmapProgress).where(eq(roadmapProgress.userId, userId));
  }

  async upsertRoadmapProgress(userId: string, dayNumber: number, completed: boolean, reflection?: string) {
    const completedAt = completed ? new Date() : null;
    const [result] = await db.insert(roadmapProgress).values({
      userId, dayNumber, completed, completedAt, reflection,
    }).onConflictDoUpdate({
      target: [roadmapProgress.userId, roadmapProgress.dayNumber],
      set: { completed, completedAt, reflection },
    }).returning();
    return result;
  }

  async getRandomAffirmation() {
    const [aff] = await db.select().from(affirmations)
      .where(eq(affirmations.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return aff || null;
  }

  async getNextSession(userId: string) {
    const [session] = await db.select().from(consultantSessions)
      .where(and(
        eq(consultantSessions.studentId, userId),
        eq(consultantSessions.status, "scheduled"),
        gte(consultantSessions.scheduledAt, new Date()),
      ))
      .orderBy(asc(consultantSessions.scheduledAt))
      .limit(1);
    return session || null;
  }

  async getUserNotifications(userId: string) {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: string, userId: string) {
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async getUserSubscription(userId: string) {
    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return sub || null;
  }

  async upsertSubscription(data: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    planType: string;
    billingInterval: string;
    status: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    trialEnd?: Date;
  }) {
    const existing = await db.select().from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(subscriptions)
        .set({
          status: data.status,
          stripePriceId: data.stripePriceId,
          planType: data.planType,
          billingInterval: data.billingInterval,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
          trialEnd: data.trialEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId))
        .returning();
      return updated;
    }

    const [created] = await db.insert(subscriptions).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return created;
  }

  async createPayment(data: InsertPayment) {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async getRecentPayments(limit = 20) {
    return db.select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      planType: payments.planType,
      billingInterval: payments.billingInterval,
      createdAt: payments.createdAt,
      userFullName: profiles.fullName,
    })
    .from(payments)
    .leftJoin(profiles, eq(payments.userId, profiles.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
  }

  async getRevenueStats() {
    const [totalRow] = await db.select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "succeeded"));

    const [activeSubsRow] = await db.select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    const [trialSubsRow] = await db.select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "trialing"));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [canceledRow] = await db.select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.status, "canceled"),
        gte(subscriptions.updatedAt, thirtyDaysAgo),
      ));

    const recentPayments = await this.getRecentPayments(20);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await db.select({
      month: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM')`,
      total: sum(payments.amount),
    })
    .from(payments)
    .where(and(
      eq(payments.status, "succeeded"),
      gte(payments.createdAt, twelveMonthsAgo),
    ))
    .groupBy(sql`to_char(${payments.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${payments.createdAt}, 'YYYY-MM')`);

    return {
      totalRevenue: Number(totalRow?.total || 0),
      activeSubscriptions: activeSubsRow?.count || 0,
      trialSubscriptions: trialSubsRow?.count || 0,
      canceledLast30Days: canceledRow?.count || 0,
      recentPayments,
      monthlyRevenue,
    };
  }

  async getCoupons() {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCouponByCode(code: string) {
    const [coupon] = await db.select().from(coupons)
      .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.active, true)));
    return coupon || null;
  }

  async createCoupon(data: InsertCoupon) {
    const [coupon] = await db.insert(coupons).values({
      ...data,
      code: data.code.toUpperCase(),
    }).returning();
    return coupon;
  }

  async toggleCoupon(id: string, active: boolean) {
    const [coupon] = await db.update(coupons)
      .set({ active })
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }

  async deleteCoupon(id: string) {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async incrementCouponUses(id: string) {
    await db.update(coupons)
      .set({ currentUses: sql`${coupons.currentUses} + 1` })
      .where(eq(coupons.id, id));
  }

  async getAdminOverview() {
    const [studentCount] = await db.select({ count: count() }).from(profiles).where(eq(profiles.role, "student"));
    const [lessonCount] = await db.select({ count: count() }).from(lessons);
    const [activeSubCount] = await db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, "active"));
    const [totalRevenueRow] = await db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, "succeeded"));
    return {
      totalStudents: studentCount?.count || 0,
      totalLessons: lessonCount?.count || 0,
      activeSubscriptions: activeSubCount?.count || 0,
      totalRevenue: Number(totalRevenueRow?.total || 0),
    };
  }

  async getAllStudents() {
    return db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      role: profiles.role,
      createdAt: profiles.createdAt,
    }).from(profiles).where(eq(profiles.role, "student")).orderBy(desc(profiles.createdAt));
  }

  // ── Coaching Chat ──────────────────────────────────────────────────────────

  async getOrCreateCoachingConversation(
    userId: string,
    lessonId: string,
    lessonTitle: string,
    lessonContent: string,
  ) {
    const [existing] = await db.select()
      .from(chatConversations)
      .where(and(eq(chatConversations.userId, userId), eq(chatConversations.lessonId, lessonId)))
      .limit(1);

    if (existing) {
      if (existing.lessonContent !== lessonContent) {
        await db.update(chatConversations)
          .set({ lessonTitle, lessonContent, updatedAt: new Date() })
          .where(eq(chatConversations.id, existing.id));
      }
      return existing;
    }

    const [created] = await db.insert(chatConversations).values({
      userId, lessonId, lessonTitle, lessonContent,
    }).returning();
    return created;
  }

  async getCoachingConversation(conversationId: string, userId: string) {
    const [conv] = await db.select()
      .from(chatConversations)
      .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)));
    return conv || null;
  }

  async getCoachingMessages(conversationId: string) {
    return db.select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async addCoachingMessage(conversationId: string, role: string, content: string) {
    const [msg] = await db.insert(chatMessages)
      .values({ conversationId, role, content })
      .returning();
    await db.update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, conversationId));
    return msg;
  }

  async clearCoachingConversation(conversationId: string, userId: string) {
    const conv = await this.getCoachingConversation(conversationId, userId);
    if (!conv) throw new Error("Not found");
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, conversationId));
  }

  // ── AI Usage Limits ────────────────────────────────────────────────────────

  async getAiMessageCountToday(userId: string): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const [row] = await db.select()
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.usageDate, today)));
    return row?.messageCount ?? 0;
  }

  async incrementAiUsage(userId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    await db.execute(
      sql`INSERT INTO ai_usage (user_id, usage_date, message_count)
          VALUES (${userId}, ${today}, 1)
          ON CONFLICT (user_id, usage_date)
          DO UPDATE SET message_count = ai_usage.message_count + 1`,
    );
  }

  // ── Action Plans ───────────────────────────────────────────────────────────

  async saveActionPlan(userId: string, lessonId: string, lessonTitle: string, steps: object[]) {
    const [plan] = await db.insert(actionPlans)
      .values({ userId, lessonId, lessonTitle, steps })
      .returning();
    return plan;
  }

  async getLatestActionPlan(userId: string, lessonId: string) {
    const [plan] = await db.select()
      .from(actionPlans)
      .where(and(eq(actionPlans.userId, userId), eq(actionPlans.lessonId, lessonId)))
      .orderBy(desc(actionPlans.createdAt))
      .limit(1);
    return plan || null;
  }

  // ── Quiz Results ───────────────────────────────────────────────────────────

  async saveQuizResult(
    userId: string,
    lessonId: string,
    lessonTitle: string,
    score: number,
    totalQuestions: number,
    answers: object[],
  ) {
    const [result] = await db.insert(quizResults)
      .values({ userId, lessonId, lessonTitle, score, totalQuestions, answers })
      .returning();
    return result;
  }

  async getUserQuizResults(userId: string) {
    return db.select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.createdAt));
  }

  async getLatestQuizResult(userId: string, lessonId: string) {
    const [result] = await db.select()
      .from(quizResults)
      .where(and(eq(quizResults.userId, userId), eq(quizResults.lessonId, lessonId)))
      .orderBy(desc(quizResults.createdAt))
      .limit(1);
    return result || null;
  }

  // Returns daily limit: null = unlimited, number = limit
  async getAiDailyLimit(userId: string): Promise<number | null> {
    const [sub] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    if (!sub || sub.status === "canceled") return 10;
    if (sub.planType === "consultant_guided") return null;
    if (sub.planType === "self_guided") return 100;
    return 10;
  }

  async checkAiUsage(userId: string): Promise<{ allowed: boolean; used: number; limit: number | null; unlimited: boolean }> {
    const [used, limit] = await Promise.all([
      this.getAiMessageCountToday(userId),
      this.getAiDailyLimit(userId),
    ]);
    const unlimited = limit === null;
    const allowed = unlimited || used < limit!;
    return { allowed, used, limit, unlimited };
  }

  // ── Phase 4: AI Accountability ────────────────────────────────────────────

  // Long-term goals
  async getLongTermGoals(userId: string, status?: string) {
    const conds: any[] = [eq(longTermGoals.userId, userId)];
    if (status) conds.push(eq(longTermGoals.status, status));
    return db.select().from(longTermGoals).where(and(...conds)).orderBy(desc(longTermGoals.createdAt));
  }

  async getLongTermGoal(id: string, userId: string) {
    const [goal] = await db.select().from(longTermGoals)
      .where(and(eq(longTermGoals.id, id), eq(longTermGoals.userId, userId)));
    return goal || null;
  }

  async createLongTermGoal(userId: string, data: {
    title: string; description?: string; targetDate?: Date;
    aiRefined?: boolean; originalText?: string;
  }) {
    const [goal] = await db.insert(longTermGoals).values({ userId, ...data }).returning();
    return goal;
  }

  async updateLongTermGoal(id: string, userId: string, data: {
    title?: string; description?: string; targetDate?: Date;
    status?: string; aiRefined?: boolean;
  }) {
    const [goal] = await db.update(longTermGoals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(longTermGoals.id, id), eq(longTermGoals.userId, userId)))
      .returning();
    return goal;
  }

  async deleteLongTermGoal(id: string, userId: string) {
    await db.delete(longTermGoals).where(and(eq(longTermGoals.id, id), eq(longTermGoals.userId, userId)));
  }

  // Daily check-ins
  async getTodayCheckIn(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const [ci] = await db.select().from(dailyCheckIns)
      .where(and(eq(dailyCheckIns.userId, userId), eq(dailyCheckIns.checkInDate, today)));
    return ci || null;
  }

  async createCheckIn(userId: string, data: {
    mood: number; wins: string; struggles: string; tomorrowPlan: string; aiInsight?: string;
  }) {
    const today = new Date().toISOString().split("T")[0];
    const [ci] = await db.insert(dailyCheckIns)
      .values({ userId, checkInDate: today, ...data })
      .onConflictDoUpdate({
        target: [dailyCheckIns.userId, dailyCheckIns.checkInDate],
        set: { mood: data.mood, wins: data.wins, struggles: data.struggles, tomorrowPlan: data.tomorrowPlan, aiInsight: data.aiInsight },
      })
      .returning();
    return ci;
  }

  async getCheckInHistory(userId: string, days = 30): Promise<typeof dailyCheckIns.$inferSelect[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return db.select().from(dailyCheckIns)
      .where(and(
        eq(dailyCheckIns.userId, userId),
        sql`${dailyCheckIns.checkInDate} >= ${cutoff.toISOString().split("T")[0]}`,
      ))
      .orderBy(desc(dailyCheckIns.checkInDate));
  }

  async getCheckInStreak(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT check_in_date FROM daily_check_ins
      WHERE user_id = ${userId}
      ORDER BY check_in_date DESC
      LIMIT 60
    `);
    const dates = (result.rows as any[]).map((r) => r.check_in_date as string);
    if (dates.length === 0) return 0;
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;
    let current = new Date(today);
    for (let i = 0; i < 60; i++) {
      const dateStr = current.toISOString().split("T")[0];
      if (dates.includes(dateStr)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  async getUsersWithoutTodayCheckIn(): Promise<string[]> {
    const today = new Date().toISOString().split("T")[0];
    const result = await db.execute(sql`
      SELECT p.id FROM profiles p
      WHERE p.email_opt_out = FALSE
        AND NOT EXISTS (
          SELECT 1 FROM daily_check_ins c
          WHERE c.user_id = p.id AND c.check_in_date = ${today}
        )
        AND p.last_active_at >= NOW() - INTERVAL '30 days'
    `);
    return (result.rows as any[]).map((r) => r.id as string);
  }

  // Action items
  async getActionItems(userId: string, includeCompleted = false) {
    const conds: any[] = [eq(actionItems.userId, userId)];
    if (!includeCompleted) conds.push(eq(actionItems.completed, false));
    return db.select().from(actionItems).where(and(...conds)).orderBy(desc(actionItems.createdAt));
  }

  async createActionItems(userId: string, items: { title: string; description?: string; lessonId?: string; goalId?: string }[]) {
    if (items.length === 0) return [];
    const toInsert = items.map((item) => ({ userId, ...item }));
    return db.insert(actionItems).values(toInsert).returning();
  }

  async updateActionItem(id: string, userId: string, data: { completed?: boolean; title?: string; description?: string }) {
    const update: any = { ...data };
    if (data.completed === true) update.completedAt = new Date();
    else if (data.completed === false) update.completedAt = null;
    const [item] = await db.update(actionItems)
      .set(update)
      .where(and(eq(actionItems.id, id), eq(actionItems.userId, userId)))
      .returning();
    return item;
  }

  async deleteActionItem(id: string, userId: string) {
    await db.delete(actionItems).where(and(eq(actionItems.id, id), eq(actionItems.userId, userId)));
  }

  // Weekly reports
  async getWeeklyReports(userId: string) {
    return db.select().from(weeklyReports)
      .where(eq(weeklyReports.userId, userId))
      .orderBy(desc(weeklyReports.weekStart));
  }

  async upsertWeeklyReport(userId: string, weekStart: string, data: {
    lessonsCompleted: number; checkInStreak: number;
    avgMood?: string; moodTrend?: string;
    aiSummary: string; aiRecommendation: string;
  }) {
    const [report] = await db.insert(weeklyReports)
      .values({ userId, weekStart, ...data })
      .onConflictDoUpdate({
        target: [weeklyReports.userId, weeklyReports.weekStart],
        set: data,
      })
      .returning();
    return report;
  }

  async getWeekLessonCount(userId: string, weekStart: Date): Promise<number> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM lesson_progress
      WHERE user_id = ${userId}
        AND status = 'completed'
        AND completed_at >= ${weekStart.toISOString()}
        AND completed_at < ${weekEnd.toISOString()}
    `);
    return parseInt((result.rows[0] as any)?.count || "0");
  }

  // ── Phase 5: Community Forums & Gamification ─────────────────────────────

  // Points & Levels
  async awardPoints(userId: string, amount: number, reason: string, skipActivity = false) {
    await db.insert(pointsLog).values({ userId, amount, reason });
    const [profile] = await db.update(profiles)
      .set({
        points: sql`${profiles.points} + ${amount}`,
        level: sql`GREATEST(1, FLOOR((${profiles.points} + ${amount}) / 500)::int + 1)`,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();
    return profile;
  }

  async getUserPoints(userId: string) {
    const [profile] = await db.select({ points: profiles.points, level: profiles.level })
      .from(profiles).where(eq(profiles.id, userId));
    return profile || { points: 0, level: 1 };
  }

  async getLeaderboard(period: "alltime" | "month" | "week" = "alltime", limit = 50) {
    if (period === "alltime") {
      return db.select({
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        points: profiles.points,
        level: profiles.level,
      })
        .from(profiles)
        .orderBy(desc(profiles.points))
        .limit(limit);
    }

    const cutoff = new Date();
    if (period === "month") cutoff.setDate(1);
    else { const day = cutoff.getDay(); cutoff.setDate(cutoff.getDate() - (day === 0 ? 6 : day - 1)); }
    cutoff.setHours(0, 0, 0, 0);

    const result = await db.execute(sql`
      SELECT p.id, p.full_name AS "fullName", p.avatar_url AS "avatarUrl",
             p.level,
             COALESCE(SUM(pl.amount), 0)::int AS points
      FROM profiles p
      LEFT JOIN points_log pl ON pl.user_id = p.id AND pl.created_at >= ${cutoff.toISOString()}
      GROUP BY p.id, p.full_name, p.avatar_url, p.level
      ORDER BY points DESC
      LIMIT ${limit}
    `);
    return result.rows as any[];
  }

  // Activity Feed
  async addActivity(userId: string, activityType: string, description: string, metadata: Record<string, any> = {}) {
    await db.insert(activityFeed).values({ userId, activityType, description, metadata });
  }

  async getActivityFeed(limit = 50) {
    const result = await db.execute(sql`
      SELECT af.id, af.activity_type AS "activityType", af.description, af.metadata, af.created_at AS "createdAt",
             p.full_name AS "userName", p.avatar_url AS "avatarUrl", p.level
      FROM activity_feed af
      JOIN profiles p ON p.id = af.user_id
      ORDER BY af.created_at DESC
      LIMIT ${limit}
    `);
    return result.rows as any[];
  }

  // Forum Discussions
  async getDiscussions(lessonId: string, userId?: string) {
    const result = await db.execute(sql`
      SELECT d.id, d.title, d.content, d.pinned, d.like_count AS "likeCount", d.reply_count AS "replyCount",
             d.created_at AS "createdAt", d.updated_at AS "updatedAt",
             p.full_name AS "authorName", p.avatar_url AS "authorAvatar", p.role AS "authorRole",
             d.user_id AS "userId",
             ${userId ? sql`(SELECT COUNT(*) FROM discussion_likes dl WHERE dl.discussion_id = d.id AND dl.user_id = ${userId}) > 0` : sql`false`} AS "likedByMe"
      FROM forum_discussions d
      JOIN profiles p ON p.id = d.user_id
      WHERE d.lesson_id = ${lessonId}
      ORDER BY d.pinned DESC, d.created_at DESC
    `);
    return result.rows as any[];
  }

  async createDiscussion(userId: string, lessonId: string, title: string, content: string) {
    const [disc] = await db.insert(forumDiscussions)
      .values({ userId, lessonId, title, content })
      .returning();
    return disc;
  }

  async getDiscussion(id: string, userId?: string) {
    const result = await db.execute(sql`
      SELECT d.id, d.title, d.content, d.pinned, d.like_count AS "likeCount", d.reply_count AS "replyCount",
             d.lesson_id AS "lessonId", d.user_id AS "userId",
             d.created_at AS "createdAt",
             p.full_name AS "authorName", p.avatar_url AS "authorAvatar", p.role AS "authorRole",
             ${userId ? sql`(SELECT COUNT(*) FROM discussion_likes dl WHERE dl.discussion_id = d.id AND dl.user_id = ${userId}) > 0` : sql`false`} AS "likedByMe"
      FROM forum_discussions d
      JOIN profiles p ON p.id = d.user_id
      WHERE d.id = ${id}
      LIMIT 1
    `);
    if (result.rows.length === 0) return null;
    const disc = result.rows[0] as any;

    const repliesResult = await db.execute(sql`
      SELECT r.id, r.content, r.is_ai_generated AS "isAiGenerated", r.like_count AS "likeCount",
             r.created_at AS "createdAt", r.user_id AS "userId",
             p.full_name AS "authorName", p.avatar_url AS "authorAvatar", p.role AS "authorRole",
             ${userId ? sql`(SELECT COUNT(*) FROM reply_likes rl WHERE rl.reply_id = r.id AND rl.user_id = ${userId}) > 0` : sql`false`} AS "likedByMe"
      FROM forum_replies r
      JOIN profiles p ON p.id = r.user_id
      WHERE r.discussion_id = ${id}
      ORDER BY r.created_at ASC
    `);
    disc.replies = repliesResult.rows;
    return disc;
  }

  async createReply(userId: string, discussionId: string, content: string, isAiGenerated = false) {
    const [reply] = await db.insert(forumReplies)
      .values({ userId, discussionId, content, isAiGenerated })
      .returning();
    await db.update(forumDiscussions)
      .set({ replyCount: sql`${forumDiscussions.replyCount} + 1`, updatedAt: new Date() })
      .where(eq(forumDiscussions.id, discussionId));
    return reply;
  }

  async toggleDiscussionLike(userId: string, discussionId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db.select().from(discussionLikes)
      .where(and(eq(discussionLikes.discussionId, discussionId), eq(discussionLikes.userId, userId)));

    if (existing) {
      await db.delete(discussionLikes).where(eq(discussionLikes.id, existing.id));
      const [d] = await db.update(forumDiscussions)
        .set({ likeCount: sql`GREATEST(0, ${forumDiscussions.likeCount} - 1)` })
        .where(eq(forumDiscussions.id, discussionId))
        .returning({ likeCount: forumDiscussions.likeCount });
      return { liked: false, likeCount: d.likeCount };
    } else {
      await db.insert(discussionLikes).values({ userId, discussionId });
      const [d] = await db.update(forumDiscussions)
        .set({ likeCount: sql`${forumDiscussions.likeCount} + 1` })
        .where(eq(forumDiscussions.id, discussionId))
        .returning({ likeCount: forumDiscussions.likeCount });
      return { liked: true, likeCount: d.likeCount };
    }
  }

  async toggleReplyLike(userId: string, replyId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db.select().from(replyLikes)
      .where(and(eq(replyLikes.replyId, replyId), eq(replyLikes.userId, userId)));

    if (existing) {
      await db.delete(replyLikes).where(eq(replyLikes.id, existing.id));
      const [r] = await db.update(forumReplies)
        .set({ likeCount: sql`GREATEST(0, ${forumReplies.likeCount} - 1)` })
        .where(eq(forumReplies.id, replyId))
        .returning({ likeCount: forumReplies.likeCount });
      return { liked: false, likeCount: r.likeCount };
    } else {
      await db.insert(replyLikes).values({ userId, replyId });
      const [r] = await db.update(forumReplies)
        .set({ likeCount: sql`${forumReplies.likeCount} + 1` })
        .where(eq(forumReplies.id, replyId))
        .returning({ likeCount: forumReplies.likeCount });
      return { liked: true, likeCount: r.likeCount };
    }
  }

  async pinDiscussion(discussionId: string, pinned: boolean) {
    const [disc] = await db.update(forumDiscussions)
      .set({ pinned, updatedAt: new Date() })
      .where(eq(forumDiscussions.id, discussionId))
      .returning();
    return disc;
  }

  async getDiscussionsNeedingAiReply() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = await db.execute(sql`
      SELECT d.id, d.title, d.content
      FROM forum_discussions d
      WHERE d.reply_count = 0
        AND d.created_at < ${twoHoursAgo}
    `);
    return result.rows as { id: string; title: string; content: string }[];
  }

  async getUserPublicProfile(userId: string) {
    const [profile] = await db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      points: profiles.points,
      level: profiles.level,
      role: profiles.role,
      createdAt: profiles.createdAt,
    }).from(profiles).where(eq(profiles.id, userId));
    if (!profile) return null;

    const [streak] = await db.select({ currentStreak: userStreaks.currentStreak, longestStreak: userStreaks.longestStreak })
      .from(userStreaks).where(eq(userStreaks.userId, userId));

    const badges = await this.getUserBadges(userId);
    const progress = await this.getLessonProgress(userId);
    const completedLessons = progress.filter((p: any) => p.status === "completed").length;

    const discussions = await db.execute(sql`
      SELECT d.id, d.title, d.created_at AS "createdAt"
      FROM forum_discussions d
      WHERE d.user_id = ${userId}
      ORDER BY d.created_at DESC
      LIMIT 5
    `);

    return {
      ...profile,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      badges,
      completedLessons,
      recentDiscussions: discussions.rows,
    };
  }

  private async awardBadge(userId: string, badgeId: string) {
    await db.insert(userBadges).values({ userId, badgeId }).onConflictDoNothing();
  }

  async checkAndAwardBadges(userId: string) {
    const awarded: string[] = [];
    const badgeDefs = await this.getBadgeDefinitions();
    const existingBadges = await this.getUserBadges(userId);
    const earnedSlugs = new Set(existingBadges.map((b: any) => b.slug));

    const tryAward = async (slug: string) => {
      if (earnedSlugs.has(slug)) return;
      const def = badgeDefs.find((b: any) => b.slug === slug);
      if (!def) return;
      await this.awardBadge(userId, def.id);
      await this.addActivity(userId, "badge", `Earned the "${def.name}" badge`).catch(() => {});
      awarded.push(slug);
    };

    const [profile] = await db.select({ points: profiles.points, level: profiles.level })
      .from(profiles).where(eq(profiles.id, userId));
    const progress = await this.getLessonProgress(userId);
    const completedCount = progress.filter((p: any) => p.status === "completed").length;

    const discCountResult = await db.execute(sql`SELECT COUNT(*) as c FROM forum_discussions WHERE user_id = ${userId}`);
    const replyCountResult = await db.execute(sql`SELECT COUNT(*) as c FROM forum_replies WHERE user_id = ${userId} AND is_ai_generated = false`);
    const actionItemsResult = await db.execute(sql`SELECT COUNT(*) as c FROM action_items WHERE user_id = ${userId} AND completed = true`);
    const perfectQuizzesResult = await db.execute(sql`SELECT COUNT(*) as c FROM quiz_results WHERE user_id = ${userId} AND score = total_questions`);
    const [streak] = await db.select({ currentStreak: userStreaks.currentStreak }).from(userStreaks).where(eq(userStreaks.userId, userId));

    const discCount = parseInt((discCountResult.rows[0] as any)?.c || "0");
    const replyCount = parseInt((replyCountResult.rows[0] as any)?.c || "0");
    const actionItemsCompleted = parseInt((actionItemsResult.rows[0] as any)?.c || "0");
    const perfectQuizzes = parseInt((perfectQuizzesResult.rows[0] as any)?.c || "0");

    if (completedCount >= 1) await tryAward("first-lesson");
    if (completedCount >= 3) await tryAward("three-lessons");
    if (completedCount >= 6) await tryAward("six-lessons");
    if (completedCount >= 12) { await tryAward("all-lessons"); await tryAward("course-champion"); }
    if (discCount >= 10) await tryAward("social-butterfly");
    if (replyCount >= 25) await tryAward("helping-hand");
    if ((streak?.currentStreak || 0) >= 30) await tryAward("streak-master");
    if (perfectQuizzes >= 5) await tryAward("quiz-whiz");
    if (actionItemsCompleted >= 10) await tryAward("goal-getter");
    if ((profile?.level || 1) >= 10) await tryAward("paradigm-shifter");

    return awarded;
  }

  // ── Email System ───────────────────────────────────────────────────────────

  async getUserEmail(userId: string): Promise<{ email: string | null } | null> {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    return user || null;
  }

  async updateLastActive(userId: string): Promise<void> {
    // Only update if it's been more than 5 minutes (to reduce DB writes)
    const [profile] = await db.select({ lastActiveAt: profiles.lastActiveAt })
      .from(profiles).where(eq(profiles.id, userId));
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!profile?.lastActiveAt || profile.lastActiveAt < fiveMinAgo) {
      await db.update(profiles).set({ lastActiveAt: new Date() }).where(eq(profiles.id, userId));
    }
  }

  // ── Weekly goals CRUD ─────────────────────────────────────────────────────
  async updateGoal(id: string, userId: string, data: { isCompleted?: boolean; goalText?: string }) {
    const update: any = { ...data };
    if (data.isCompleted === true) update.completedAt = new Date();
    else if (data.isCompleted === false) update.completedAt = null;
    const [result] = await db.update(goals)
      .set(update)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return result;
  }

  async deleteGoal(id: string, userId: string) {
    await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }

  async getInactiveUsers(days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return db.select({ id: profiles.id }).from(profiles).where(
      and(
        sql`(${profiles.lastActiveAt} IS NULL AND ${profiles.createdAt} < ${cutoff})
          OR ${profiles.lastActiveAt} < ${cutoff}`,
        eq(profiles.emailOptOut, false),
      ),
    );
  }

  async getChurnRiskUsers() {
    return db.select({ userId: subscriptions.userId }).from(subscriptions)
      .where(sql`${subscriptions.status} IN ('past_due', 'canceled')`);
  }

  // Sequences
  async getEmailSequences() {
    const seqs = await db.select().from(emailSequences).orderBy(asc(emailSequences.createdAt));
    return seqs;
  }

  async getEmailSequenceByEvent(event: string) {
    const [seq] = await db.select().from(emailSequences)
      .where(and(eq(emailSequences.triggerEvent, event), eq(emailSequences.active, true)))
      .limit(1);
    return seq || null;
  }

  async createEmailSequence(name: string, triggerEvent: string) {
    const [seq] = await db.insert(emailSequences).values({ name, triggerEvent }).returning();
    return seq;
  }

  async updateEmailSequence(id: string, data: { name?: string; triggerEvent?: string; active?: boolean }) {
    const [seq] = await db.update(emailSequences).set(data).where(eq(emailSequences.id, id)).returning();
    return seq;
  }

  async deleteEmailSequence(id: string) {
    await db.delete(emailSequences).where(eq(emailSequences.id, id));
  }

  // Steps
  async getEmailSteps(sequenceId: string) {
    return db.select().from(emailSteps)
      .where(eq(emailSteps.sequenceId, sequenceId))
      .orderBy(asc(emailSteps.order));
  }

  async addEmailStep(sequenceId: string, templateName: string, subject: string, delayDays: number, order: number) {
    const [step] = await db.insert(emailSteps)
      .values({ sequenceId, templateName, subject, delayDays, order }).returning();
    return step;
  }

  async deleteEmailStep(id: string) {
    await db.delete(emailSteps).where(eq(emailSteps.id, id));
  }

  // User states
  async getUserEmailState(userId: string, sequenceId: string) {
    const [state] = await db.select().from(userEmailStates)
      .where(and(eq(userEmailStates.userId, userId), eq(userEmailStates.sequenceId, sequenceId)));
    return state || null;
  }

  async upsertUserEmailState(userId: string, sequenceId: string) {
    await db.execute(
      sql`INSERT INTO user_email_states (user_id, sequence_id, current_step, started_at)
          VALUES (${userId}, ${sequenceId}, 0, NOW())
          ON CONFLICT (user_id, sequence_id)
          DO UPDATE SET current_step = 0, started_at = NOW(), completed = FALSE, paused = FALSE, last_sent_at = NULL`,
    );
  }

  async advanceUserEmailState(userId: string, sequenceId: string, newStep: number) {
    await db.update(userEmailStates)
      .set({ currentStep: newStep, lastSentAt: new Date() })
      .where(and(eq(userEmailStates.userId, userId), eq(userEmailStates.sequenceId, sequenceId)));
  }

  async markEmailStateComplete(stateId: string) {
    await db.update(userEmailStates).set({ completed: true }).where(eq(userEmailStates.id, stateId));
  }

  async getDueEmailStates() {
    // Get states where the next step's delay has elapsed
    const result = await db.execute<{
      id: string; user_id: string; sequence_id: string;
      current_step: number; last_sent_at: Date | null;
    }>(sql`
      SELECT ues.id, ues.user_id, ues.sequence_id, ues.current_step, ues.last_sent_at
      FROM user_email_states ues
      JOIN email_sequences es ON es.id = ues.sequence_id AND es.active = TRUE
      JOIN email_steps estep ON estep.sequence_id = ues.sequence_id
        AND estep."order" = ues.current_step + 1
      WHERE ues.completed = FALSE
        AND ues.paused = FALSE
        AND (
          ues.last_sent_at IS NULL
          OR ues.last_sent_at + (estep.delay_days * INTERVAL '1 day') <= NOW()
        )
    `);
    return (result.rows as any[]).map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      sequenceId: r.sequence_id as string,
      currentStep: r.current_step as number,
      lastSentAt: r.last_sent_at as Date | null,
    }));
  }

  // Logging
  async logEmail(userId: string | null, recipientEmail: string, templateName: string, subject: string) {
    await db.insert(emailLogs).values({
      recipientId: userId || null,
      recipientEmail,
      templateName,
      subject,
    });
  }

  async getEmailLogs(opts: { limit?: number; offset?: number; search?: string } = {}) {
    const { limit = 50, offset = 0, search } = opts;
    let query = db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
    if (search) {
      query = query.where(
        sql`${emailLogs.recipientEmail} ILIKE ${'%' + search + '%'} OR ${emailLogs.subject} ILIKE ${'%' + search + '%'}`,
      ) as any;
    }
    return query.limit(limit).offset(offset);
  }

  async getEmailStats() {
    const result = await db.execute(sql`
      SELECT
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE opened = TRUE) as total_opened,
        COUNT(*) FILTER (WHERE clicked = TRUE) as total_clicked
      FROM email_logs
    `);
    const stats = (result.rows[0] as any) || {};
    const totalSent = parseInt(stats.total_sent || "0");
    const totalOpened = parseInt(stats.total_opened || "0");
    const totalClicked = parseInt(stats.total_clicked || "0");
    return {
      totalSent,
      openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
    };
  }

  async getConsultantStudents(consultantId: string) {
    return db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
    })
    .from(consultantAssignments)
    .innerJoin(profiles, eq(consultantAssignments.studentId, profiles.id))
    .where(and(
      eq(consultantAssignments.consultantId, consultantId),
      eq(consultantAssignments.isActive, true),
    ));
  }
}

export const storage = new DatabaseStorage();
