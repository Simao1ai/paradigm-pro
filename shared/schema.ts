export * from "./models/auth";

import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./models/auth";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  timezone: text("timezone").default("UTC"),
  role: text("role").notNull().default("student"),
  onboardingDone: boolean("onboarding_done").default(false),
  referralCode: text("referral_code").unique(),
  referredBy: varchar("referred_by"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  emailOptOut: boolean("email_opt_out").notNull().default(false),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").unique().notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  planType: text("plan_type").notNull(),
  billingInterval: text("billing_interval"),
  status: text("status").notNull().default("trialing"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_subscriptions_user").on(table.userId),
  index("idx_subscriptions_status").on(table.status),
]);

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonNumber: integer("lesson_number").unique().notNull(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  keyPrinciple: text("key_principle"),
  estimatedMinutes: integer("estimated_minutes").default(45),
  hasAudio: boolean("has_audio").default(false),
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessonAssets = pgTable("lesson_assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  assetType: text("asset_type").notNull(),
  label: text("label").notNull(),
  storagePath: text("storage_path").notNull(),
  storageProvider: text("storage_provider").default("local"),
  fileSizeBytes: integer("file_size_bytes"),
  mimeType: text("mime_type"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_lesson_assets_lesson").on(table.lessonId),
]);

export const roadmapDays = pgTable("roadmap_days", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dayNumber: integer("day_number").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  storagePath: text("storage_path"),
  sortOrder: integer("sort_order").notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("not_started"),
  audioPositionSecs: integer("audio_position_secs").default(0),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
}, (table) => [
  uniqueIndex("lesson_progress_user_lesson").on(table.userId, table.lessonId),
  index("idx_lesson_progress_user").on(table.userId),
]);

export const lessonNotes = pgTable("lesson_notes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  content: text("content").notNull().default(""),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("lesson_notes_user_lesson").on(table.userId, table.lessonId),
]);

export const roadmapProgress = pgTable("roadmap_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  reflection: text("reflection"),
}, (table) => [
  uniqueIndex("roadmap_progress_user_day").on(table.userId, table.dayNumber),
]);

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  goalText: text("goal_text").notNull(),
  category: text("category").default("other"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_goals_user").on(table.userId, table.weekStart),
]);

export const badgeDefinitions = pgTable("badge_definitions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("star"),
  badgeType: text("badge_type").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  badgeId: uuid("badge_id").notNull().references(() => badgeDefinitions.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
  contextData: jsonb("context_data").default({}),
}, (table) => [
  uniqueIndex("user_badges_user_badge").on(table.userId, table.badgeId),
  index("idx_user_badges_user").on(table.userId),
]);

export const userStreaks = pgTable("user_streaks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique().notNull().references(() => profiles.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityAt: date("last_activity_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultantAssignments = pgTable("consultant_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").unique().notNull().references(() => profiles.id, { onDelete: "cascade" }),
  consultantId: varchar("consultant_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  calEventTypeId: text("cal_event_type_id"),
});

export const consultantSessions = pgTable("consultant_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  consultantId: varchar("consultant_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  calBookingUid: text("cal_booking_uid").unique(),
  zoomMeetingUrl: text("zoom_meeting_url"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  status: text("status").default("scheduled"),
  consultantNotes: text("consultant_notes"),
  actionPlan: text("action_plan"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sessions_student").on(table.studentId),
  index("idx_sessions_consultant").on(table.consultantId),
]);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: uuid("thread_id").notNull(),
  senderId: varchar("sender_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_messages_thread").on(table.threadId),
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_user").on(table.userId, table.isRead),
]);

export const affirmations = pgTable("affirmations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  author: text("author").default("Bob Proctor"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").default("usd"),
  status: text("status").notNull().default("succeeded"),
  planType: text("plan_type"),
  billingInterval: text("billing_interval"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_payments_user").on(table.userId),
  index("idx_payments_created").on(table.createdAt),
]);

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").unique().notNull(),
  stripePromotionCodeId: text("stripe_promotion_code_id"),
  stripeCouponId: text("stripe_coupon_id"),
  discountPercent: integer("discount_percent").notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type LessonNote = typeof lessonNotes.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Affirmation = typeof affirmations.$inferSelect;
export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  lessonTitle: text("lesson_title"),
  lessonContent: text("lesson_content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_chat_conversations_user").on(table.userId),
  index("idx_chat_conversations_lesson").on(table.lessonId),
]);

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_chat_messages_conversation").on(table.conversationId),
]);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ── AI Usage Tracking ──────────────────────────────────────────────────────
export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  usageDate: date("usage_date").notNull(),
  messageCount: integer("message_count").notNull().default(0),
}, (table) => [
  uniqueIndex("idx_ai_usage_user_date").on(table.userId, table.usageDate),
]);

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = typeof aiUsage.$inferInsert;

// ── Action Plans ───────────────────────────────────────────────────────────
export const actionPlans = pgTable("action_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  lessonTitle: text("lesson_title"),
  steps: jsonb("steps").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_action_plans_user").on(table.userId),
  index("idx_action_plans_lesson").on(table.lessonId),
]);

export type ActionPlan = typeof actionPlans.$inferSelect;
export type InsertActionPlan = typeof actionPlans.$inferInsert;

// ── Quiz Results ───────────────────────────────────────────────────────────
export const quizResults = pgTable("quiz_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  lessonTitle: text("lesson_title"),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_quiz_results_user").on(table.userId),
  index("idx_quiz_results_lesson").on(table.lessonId),
]);

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

// ── Phase 4: AI Accountability ────────────────────────────────────────────
export const longTermGoals = pgTable("long_term_goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  status: text("status").notNull().default("active"),
  aiRefined: boolean("ai_refined").notNull().default(false),
  originalText: text("original_text"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyCheckIns = pgTable("daily_check_ins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  checkInDate: date("check_in_date").notNull(),
  mood: integer("mood").notNull(),
  wins: text("wins").notNull().default(""),
  struggles: text("struggles").notNull().default(""),
  tomorrowPlan: text("tomorrow_plan").notNull().default(""),
  aiInsight: text("ai_insight"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  goalId: uuid("goal_id").references(() => longTermGoals.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyReports = pgTable("weekly_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  checkInStreak: integer("check_in_streak").notNull().default(0),
  avgMood: text("avg_mood"),
  moodTrend: text("mood_trend"),
  aiSummary: text("ai_summary").notNull().default(""),
  aiRecommendation: text("ai_recommendation").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export type LongTermGoal = typeof longTermGoals.$inferSelect;
export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;
export type ActionItem = typeof actionItems.$inferSelect;
export type WeeklyReport = typeof weeklyReports.$inferSelect;

// ── Phase 5: Community Forums & Gamification ──────────────────────────────
export const forumDiscussions = pgTable("forum_discussions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  likeCount: integer("like_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_forum_disc_lesson").on(table.lessonId),
  index("idx_forum_disc_user").on(table.userId),
]);

export const forumReplies = pgTable("forum_replies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  discussionId: uuid("discussion_id").notNull().references(() => forumDiscussions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_forum_replies_disc").on(table.discussionId),
]);

export const discussionLikes = pgTable("discussion_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  discussionId: uuid("discussion_id").notNull().references(() => forumDiscussions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("discussion_likes_unique").on(table.discussionId, table.userId),
]);

export const replyLikes = pgTable("reply_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  replyId: uuid("reply_id").notNull().references(() => forumReplies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("reply_likes_unique").on(table.replyId, table.userId),
]);

export const pointsLog = pgTable("points_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_points_log_user").on(table.userId),
  index("idx_points_log_created").on(table.createdAt),
]);

export const activityFeed = pgTable("activity_feed", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_activity_feed_created").on(table.createdAt),
  index("idx_activity_feed_user").on(table.userId),
]);

export type ForumDiscussion = typeof forumDiscussions.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;

// ── Email System ───────────────────────────────────────────────────────────
export const emailSequences = pgTable("email_sequences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  triggerEvent: text("trigger_event").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailSteps = pgTable("email_steps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: uuid("sequence_id").notNull().references(() => emailSequences.id, { onDelete: "cascade" }),
  templateName: text("template_name").notNull(),
  subject: text("subject").notNull(),
  delayDays: integer("delay_days").notNull().default(0),
  order: integer("order").notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").references(() => profiles.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  templateName: text("template_name").notNull(),
  subject: text("subject").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  opened: boolean("opened").notNull().default(false),
  clicked: boolean("clicked").notNull().default(false),
});

export const userEmailStates = pgTable("user_email_states", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  sequenceId: uuid("sequence_id").notNull().references(() => emailSequences.id, { onDelete: "cascade" }),
  currentStep: integer("current_step").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow(),
  lastSentAt: timestamp("last_sent_at"),
  completed: boolean("completed").notNull().default(false),
  paused: boolean("paused").notNull().default(false),
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type EmailStep = typeof emailSteps.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type UserEmailState = typeof userEmailStates.$inferSelect;
