# Paradigm Pro — Learning Management System

## Overview
"Paradigm Pro" is a comprehensive LMS delivering Bob Proctor's "Thinking Into Results" 12-lesson transformation program. Features two subscription tiers (Self-Guided and Consultant-Guided), progress tracking, achievement badges, journaling, goal setting, a 9-day roadmap, and consultant scheduling.

## Tech Stack
- **Frontend**: React + Vite (TypeScript)
- **Backend**: Express.js (TypeScript)
- **Database**: Replit PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect via Passport)
- **Styling**: Tailwind CSS with dark navy + gold theme (#0B1628 / #C9A84C)
- **State Management**: @tanstack/react-query
- **Routing**: wouter (client-side)
- **Payments**: Stripe (subscriptions, webhooks) — planned

## Project Structure
```
/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx           # Main app with routing
│   │   ├── pages/            # All page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LessonsPage.tsx
│   │   │   ├── LessonDetailPage.tsx
│   │   │   ├── JournalPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   ├── BadgesPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── BillingPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── ConsultantPage.tsx
│   │   ├── components/       # Reusable UI components
│   │   │   └── DashboardLayout.tsx
│   │   ├── hooks/            # Custom React hooks (useAuth)
│   │   └── index.css         # Tailwind CSS entry
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── vite.config.ts
├── server/                    # Express backend
│   ├── index.ts              # Server entry point (Vite middleware + Express)
│   ├── routes.ts             # All API route handlers
│   ├── storage.ts            # Database access layer (Drizzle queries)
│   ├── db.ts                 # Drizzle database connection
│   └── replit_integrations/  # Replit Auth integration
│       └── auth/
│           ├── replitAuth.ts # Passport OIDC strategy setup
│           └── storage.ts    # Session store
├── shared/
│   └── schema.ts             # Drizzle ORM schema (all tables)
├── drizzle.config.ts         # Drizzle configuration
├── tailwind.config.ts        # Root tailwind config (for Vite middleware mode)
├── postcss.config.js         # Root PostCSS config
└── tsconfig.json
```

## Database
- Replit PostgreSQL with Drizzle ORM
- 20+ tables: users, profiles, subscriptions, lessons, lesson_progress, lesson_notes, goals, badge_definitions, user_badges, sessions, roadmap_days, roadmap_progress, affirmations, notifications, forum_posts, forum_replies
- Server-side authorization (role-based) instead of RLS
- Key relationships: users → profiles, users → lesson_progress, users → lesson_notes, users → goals, users → user_badges

## API Routes
- `GET/POST /api/auth/*` — Replit Auth login/logout/user
- `GET /api/lessons` — List all lessons
- `GET /api/lessons/:id` — Get lesson detail
- `POST /api/lessons/:id/progress` — Update lesson progress
- `GET/POST /api/notes` — Journal entries (CRUD)
- `GET/POST /api/goals` — Weekly goals (CRUD)
- `GET /api/badges` — Badge definitions + user badges
- `GET /api/roadmap` — Roadmap days + progress
- `POST /api/roadmap/:day/complete` — Mark roadmap day complete
- `GET /api/affirmations` — Daily affirmations
- `GET /api/admin/*` — Admin endpoints (stats, students)

## Recent Changes (Mar 2026, Phase 7 complete)
- Phase 1: Stripe payments infrastructure (BillingPage, /pricing, AdminPage revenue/coupons tabs, checkout/portal/webhook routes)
- Phase 2: AI Coaching Chatbot + Action Plans + Quizzes
  - `chatConversations` + `chatMessages` tables — per-lesson conversation history
  - `actionPlans` table — saved AI-generated action plans per user/lesson
  - `quizResults` table — saved quiz scores, answers, per user/lesson
  - `aiUsage` table — daily message count tracking per user
  - Usage limits: Free=10/day, Self-Guided=100/day, Consultant=Unlimited
  - Routes: `/api/coaching/*`, `/api/ai/usage`, `/api/ai/action-plan`, `/api/ai/generate-quiz`, `/api/ai/quiz-result`
  - `CoachingChat.tsx` — floating chat, SSE streaming, usage meter, upgrade CTA
  - `ActionPlanCard.tsx` — AI action plan with checkboxes, progress bar, regenerate
  - `QuizModal.tsx` — 5-question AI quiz, scoring, explanations, history
- Phase 3: Automated Email Sequences (COMPLETE)
  - DB tables: `emailSequences`, `emailSteps`, `emailLogs`, `userEmailStates`
  - Profile columns added: `email_opt_out`, `last_active_at`
  - `server/email/client.ts` — Resend wrapper (graceful no-key fallback, logs to console)
  - `server/email/templates.ts` — 7 branded HTML templates: welcome, lessonReminder, weeklyProgress, courseComplete, winBack, upsell, accountability
  - `server/email/service.ts` — 5 default sequences seeded on startup, triggerEmailSequence(), processEmailQueue(), checkInactivity(), checkChurnRisk()
  - Auto-triggers: signup → welcome sequence; Stripe checkout → enrollment sequence; 4+ lessons → upsell; 12 lessons → completion
  - Activity tracking: `lastActiveAt` updated on every authenticated request (throttled 5min)
  - Cron jobs in `server/index.ts`: hourly queue processing, 6-hourly inactivity check, 12-hourly churn check
  - Admin UI: `EmailsTab` in AdminPage (stats, sequences list with toggle, email logs table with search)
  - Routes: `/api/admin/email/stats`, `/api/admin/email/sequences`, `/api/admin/email/logs`, `/api/admin/email/process`, `/api/email/unsubscribe`
  - RESEND_API_KEY env var needed to send real emails (system logs when key missing)
- Phase 4: AI Accountability (COMPLETE)
  - DB tables: `long_term_goals`, `daily_check_ins`, `action_items`, `weekly_reports`
  - Long-term goals CRUD: `/api/long-term-goals` (GET/POST/PUT/DELETE)
  - AI SMART goal refinement: `/api/ai/refine-goal` (Claude generates SMART formatted goal)
  - Daily check-in wizard: `/api/check-in` (4-step: mood + win + challenge + tomorrow plan)
  - Check-in AI insight: generated server-side via Claude after each check-in
  - Check-in history + streak tracking: `/api/check-in/today`, `/api/check-in/history`
  - Action items: `/api/action-items` (GET/PUT/DELETE), `/api/ai/generate-actions` (Claude generates 2-3 per lesson)
  - Weekly AI reports: `/api/reports` (generated Sunday 7am via cron)
  - `CheckInPage.tsx` — 4-step wizard, confetti, streak tracker, 30-day calendar heatmap
  - `ReportsPage.tsx` — weekly AI summaries + recommendations
  - `GoalsPage.tsx` — rewritten: LongTermGoalsSection (SMART AI refinement, archive) + WeeklyGoalsSection
  - `ActionItemsWidget.tsx` — shared widget with checkbox + confetti completion
  - `DashboardPage.tsx` — Phase 4 widgets: check-in prompt, AI coach insight, streak banner, goals mini-widget, action items
  - `DashboardLayout.tsx` — added "Daily Check-In" (Flame icon) and "Progress Reports" (BarChart3) nav items
  - Cron jobs: Sunday 7am (weekly reports via Claude), daily 8am (accountability emails)
  - `server/email/weeklyReports.ts` — generates and stores weekly AI reports
  - `server/email/accountability.ts` — sends accountability nudge to users with goals who miss check-ins
- Phase 7: Content Automation & Completion Certificates (COMPLETE)
  - DB tables: `certificates` (user_id, course_name, user_name, unique_code, download_count), `content_drafts` (user_id, type, title, content, status, metadata)
  - pdfkit + nanoid installed for PDF generation and unique codes
  - `server/pdf/certificate.ts` — PDFKit A4 landscape certificate with gradient header, gold border, elegant typography
  - Auto-issue certificate on 12/12 lesson completion (fire-and-forget, unique nanoid code)
  - Routes: GET /api/certificates, GET /api/certificates/:code/download, GET /api/verify/:code (public), POST /api/admin/certificates/issue
  - CRUD: GET/POST /api/content-drafts, PUT/DELETE /api/content-drafts/:id
  - AI Tools: POST /api/ai/generate-curriculum, generate-script, generate-worksheet, generate-social, build-course
  - `CertificatesPage.tsx` — /certificates: certificate preview cards, PDF download, LinkedIn/Twitter share
  - `VerifyPage.tsx` — /verify/:code: public branded verification page (no auth required)
  - `AiToolsPage.tsx` — /admin/ai-tools: hub page with tool cards + recent drafts
  - `CurriculumGeneratorPage.tsx` — /admin/ai-tools/curriculum: full course outline generator with collapsible week tree
  - `ScriptWriterPage.tsx` — /admin/ai-tools/scripts: video script writer with word count + editable textarea
  - `SocialPostsPage.tsx` — /admin/ai-tools/social: multi-platform post generator (LinkedIn/Twitter/Instagram/Facebook)
  - `WorksheetGeneratorPage.tsx` — /admin/ai-tools/worksheets: worksheet/checklist/workbook/assessment generator
  - `CourseBuilderPage.tsx` — /admin/ai-tools/course-builder: 4-step wizard (topic → curriculum → pricing → create)
  - DashboardLayout: added "Certificates" (GraduationCap) and "AI Tools Hub" (Zap, admin-only) nav items
  - App.tsx: 8 new routes wired
- Phase 6: Analytics & AI-Powered Insights (COMPLETE)
  - DB tables: `page_views`, `engagement_events`, `ai_insights`
  - `server/analytics.ts` — `trackEvent()` + `trackPageView()` utilities (fire-and-forget)
  - trackEvent wired into: lesson_complete, check_in, quiz_submit, discussion_post
  - Storage methods: getRevenueAnalytics, getEngagementAnalytics, getContentAnalytics, getAiInsights, createAiInsight, dismissAiInsight, getChurnRiskUsers, getMyStats
  - Admin Analytics tab in AdminPage: 4 sub-tabs (Revenue, Engagement, Content, AI Insights)
    - Revenue: MRR, ARPU, LTV, monthly revenue line chart, new vs churned bar chart
    - Engagement: DAU/WAU, DAU 30-day area chart, enrollment funnel (horizontal bars), popular lessons table
    - Content: per-lesson metrics table (views/completions/rate/quiz avg), color-coded problem lessons, quiz score bar chart
    - AI Insights: Claude-generated insight cards (info/warning/critical), dismiss button, Generate Fresh Insights button
    - Churn Prediction: expandable section, risk scoring algorithm, color-coded risk table (LOW/MEDIUM/HIGH/CRITICAL)
  - `AdminAnalyticsTab.tsx` — standalone component, recharts-powered
  - `MyStatsPage.tsx` — student personal analytics at /my-stats
    - Big stat cards: lessons done, day streak, total points, level
    - Motivational banner: top X% percentile + completion pace date
    - Weekly activity bar chart, quiz score trend area chart, mood trend line chart, recent badges
  - `vite.config.ts` — added `dedupe: ["react", "react-dom"]` to prevent recharts hook conflicts
  - recharts library installed
  - Nav: "My Stats" item (TrendingUp icon) added to DashboardLayout
  - Routes: GET /api/admin/analytics/revenue|engagement|content|insights|churn, POST /api/admin/analytics/generate-insights, POST /api/admin/analytics/insights/:id/dismiss, GET /api/my-stats
- Phase 5: Community Forums & Gamification (COMPLETE)
  - DB tables: `forum_discussions`, `forum_replies`, `discussion_likes`, `reply_likes`, `points_log`, `activity_feed`
  - Profile columns added: `points int default 0`, `level int default 1`
  - 9 new badge definitions seeded: social-butterfly, helping-hand, streak-master, quiz-whiz, goal-getter, early-bird, paradigm-shifter, week-warrior, course-champion
  - `ForumSection.tsx` — per-lesson embedded forum with discussion list, thread view, like/reply, create form
  - `CommunityPage.tsx` — /community: activity feed (auto-refreshes 30s) + leaderboard preview + quick actions
  - `LeaderboardPage.tsx` — /community/leaderboard: all-time/month/week tabs, podium top-3, bar chart ranks 4+
  - `DashboardLayout.tsx` — added "Community" nav item (Users icon)
  - `App.tsx` — added /community and /community/leaderboard routes
  - `LessonDetailPage.tsx` — ForumSection embedded above CoachingChat
  - Storage: awardPoints, getUserPoints, getLeaderboard, addActivity, getActivityFeed, updateStreak, getDiscussions, createDiscussion, getDiscussion, createReply, toggleDiscussionLike, toggleReplyLike, pinDiscussion, getDiscussionsNeedingAiReply, getUserPublicProfile, checkAndAwardBadges
  - API routes: GET/POST /api/discussions, GET/POST /api/discussions/:id/replies, POST /api/discussions/:id/like, POST /api/discussions/:id/replies/:replyId/like, POST /api/discussions/:id/pin, GET /api/community/leaderboard, GET /api/community/feed, GET /api/community/my-stats, GET /api/community/profile/:userId
  - Points integration: lesson complete +10, course complete +500, check-in +5, perfect quiz +25, forum post +10, reply +5, like received +2
  - updateStreak() called on lesson completion and check-in for streak tracking
  - Cron (every 2h): AI auto-reply to unanswered discussions via Claude
  - Points system: Level = floor(points/500) + 1; level badges in leaderboard

## User Preferences
- Dark theme with navy (#0B1628) and gold (#C9A84C) accents
- Professional, premium look and feel
- Serif headings (Playfair Display), sans-serif body (Inter)

## Environment Variables
- `DATABASE_URL` — Replit PostgreSQL (auto-provided)
- `REPL_ID` / `REPL_SLUG` / `REPL_OWNER` — Replit environment (auto-provided)
- `SESSION_SECRET` — Express session secret (auto-generated)
- `STRIPE_SECRET_KEY` — Stripe API (planned)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhooks (planned)
