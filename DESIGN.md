# Paradigm Pro — 12-Week Course System Design

## Overview

A course delivery platform for a consulting firm that supports **video lessons** and **downloadable course materials** organized into a structured 12-week program.

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Course** | A 12-week program with a title, description, thumbnail, and enrollment settings |
| **Week** | A container for one week's content (1–12), with a theme/title |
| **Lesson** | An individual learning unit within a week — either a video or a reading/resource |
| **Material** | Downloadable files (PDFs, slides, templates, worksheets) attached to a lesson or week |
| **Enrollment** | A user's registration in a course, tracking progress |
| **Progress** | Per-lesson completion tracking (video watched, material downloaded/acknowledged) |

---

## Recommended Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14+ (App Router) | SSR, great DX, easy API routes |
| **Styling** | Tailwind CSS | Rapid, consistent UI |
| **Database** | PostgreSQL | Relational data fits course→week→lesson hierarchy |
| **ORM** | Prisma | Type-safe queries, easy migrations |
| **Auth** | NextAuth.js (Auth.js) | Flexible auth with email/OAuth |
| **Video Hosting** | Mux or Cloudflare Stream | Adaptive streaming, signed URLs for access control |
| **File Storage** | AWS S3 / Cloudflare R2 | Course material PDFs, slides, templates |
| **Deployment** | Vercel or AWS | Seamless Next.js deployment |

---

## Database Schema (Prisma)

```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  role        Role         @default(STUDENT)
  enrollments Enrollment[]
  progress    Progress[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum Role {
  ADMIN       // Firm administrators — manage courses
  INSTRUCTOR  // Consultants who create/teach courses
  STUDENT     // Enrolled learners
}

model Course {
  id          String       @id @default(cuid())
  title       String
  slug        String       @unique
  description String
  thumbnail   String?      // URL to cover image
  published   Boolean      @default(false)
  weeks       Week[]
  enrollments Enrollment[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Week {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  weekNumber  Int      // 1–12
  title       String   // e.g. "Week 3: Stakeholder Analysis"
  description String?
  lessons     Lesson[]
  materials   Material[] // Week-level materials (e.g. weekly summary PDF)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([courseId, weekNumber])
}

model Lesson {
  id          String     @id @default(cuid())
  weekId      String
  week        Week       @relation(fields: [weekId], references: [id], onDelete: Cascade)
  title       String
  type        LessonType
  sortOrder   Int        // Controls display order within a week
  // Video fields
  videoUrl    String?    // Mux playback ID or stream URL
  videoDuration Int?     // Duration in seconds
  // Text/reading fields
  content     String?    // Rich text / markdown for reading lessons
  materials   Material[]
  progress    Progress[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum LessonType {
  VIDEO
  READING
  ASSIGNMENT
}

model Material {
  id        String   @id @default(cuid())
  title     String   // e.g. "Stakeholder Matrix Template"
  fileUrl   String   // S3/R2 signed URL or path
  fileType  String   // "pdf", "pptx", "xlsx", "docx"
  fileSize  Int      // Bytes
  // A material can belong to a lesson, a week, or both
  lessonId  String?
  lesson    Lesson?  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  weekId    String?
  week      Week?    @relation(fields: [weekId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Enrollment {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId   String
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  enrolledAt DateTime @default(now())
  completedAt DateTime?

  @@unique([userId, courseId])
}

model Progress {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  completed   Boolean  @default(false)
  // For videos: track how far they watched (percentage 0–100)
  videoProgress Int    @default(0)
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, lessonId])
}
```

---

## Suggested Project Structure

```
paradigm-pro/
├── prisma/
│   └── schema.prisma          # Database schema above
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Sidebar + nav for logged-in users
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx           # Course catalog / My courses
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx       # Course overview + week list
│   │   │   │       └── week/
│   │   │   │           └── [weekNumber]/
│   │   │   │               ├── page.tsx       # Week view — lesson list
│   │   │   │               └── lesson/
│   │   │   │                   └── [lessonId]/
│   │   │   │                       └── page.tsx  # Video player + materials
│   │   │   └── admin/
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx       # Manage courses
│   │   │       │   ├── new/page.tsx   # Create course
│   │   │       │   └── [slug]/
│   │   │       │       └── edit/page.tsx  # Edit course, weeks, lessons
│   │   │       └── users/page.tsx     # User management
│   │   ├── api/
│   │   │   ├── courses/              # CRUD endpoints
│   │   │   ├── enrollments/          # Enroll / unenroll
│   │   │   ├── progress/             # Track lesson completion
│   │   │   ├── upload/               # File upload (materials, videos)
│   │   │   └── webhooks/
│   │   │       └── mux/              # Video processing callbacks
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing / marketing page
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives
│   │   ├── course/            # CourseCard, WeekAccordion, LessonRow
│   │   ├── video/             # VideoPlayer (Mux/Stream wrapper)
│   │   └── progress/          # ProgressBar, CompletionBadge
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── auth.ts            # NextAuth config
│       ├── storage.ts         # S3/R2 upload helpers
│       └── video.ts           # Mux/Stream API helpers
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Key Features for a Consulting Firm

### 1. Structured 12-Week Pacing
- Each week unlocks on a schedule (or all at once — configurable)
- Weekly overview page summarizes that week's videos + materials
- Progress bar shows how far a student is through the 12 weeks

### 2. Video Delivery
- Use **Mux** or **Cloudflare Stream** for adaptive bitrate streaming
- Signed/tokenized URLs so only enrolled users can watch
- Track watch progress (resume where you left off)
- Support for video chapters / timestamps

### 3. Course Materials
- Downloadable PDFs, slide decks, templates, worksheets
- Attach materials at the **week level** (e.g. "Week 5 Summary PDF") or **lesson level**
- File types: PDF, PPTX, XLSX, DOCX
- Stored in S3/R2 with signed download URLs

### 4. Progress Tracking
- Per-lesson completion (auto-mark video as complete at 90% watched)
- Weekly progress summary
- Overall course completion percentage
- Certificate generation on completion (optional)

### 5. Admin / Instructor Dashboard
- Create and edit courses, weeks, and lessons
- Upload videos and materials
- View enrollment stats and student progress
- Reorder lessons via drag-and-drop

### 6. Access Control
- Role-based: Admin, Instructor, Student
- Only enrolled students can access course content
- Optional: time-gated week releases (drip content)

---

## Example 12-Week Course Structure

```
Course: "Strategic Consulting Fundamentals"

Week 1: Introduction & Frameworks
  ├── Lesson 1: Welcome Video (VIDEO, 8 min)
  ├── Lesson 2: The Consulting Mindset (VIDEO, 22 min)
  ├── Lesson 3: Key Frameworks Overview (READING)
  └── Materials: Course Syllabus (PDF), Framework Cheat Sheet (PDF)

Week 2: Problem Definition
  ├── Lesson 1: Defining the Problem Statement (VIDEO, 18 min)
  ├── Lesson 2: Issue Trees & Hypothesis Trees (VIDEO, 25 min)
  ├── Lesson 3: Practice Exercise (ASSIGNMENT)
  └── Materials: Issue Tree Template (PPTX), Problem Definition Worksheet (PDF)

Week 3–11: [Similar structure per week]

Week 12: Capstone & Wrap-Up
  ├── Lesson 1: Capstone Project Overview (VIDEO, 10 min)
  ├── Lesson 2: Presenting to Stakeholders (VIDEO, 30 min)
  ├── Lesson 3: Course Summary & Next Steps (READING)
  └── Materials: Capstone Brief (PDF), Final Checklist (PDF)
```

---

## Implementation Phases

### Phase 1 — Foundation (Weeks 1–2 of development)
- Project setup (Next.js, Prisma, Tailwind, Auth)
- Database schema + migrations
- User auth (login, register, roles)
- Basic course CRUD (admin)

### Phase 2 — Content Delivery (Weeks 3–4)
- Video upload + playback integration (Mux/Cloudflare Stream)
- Material upload + download (S3/R2)
- Course viewer: week list → lesson list → video player
- Progress tracking

### Phase 3 — Polish & Launch (Weeks 5–6)
- Admin dashboard (enrollment stats, progress reports)
- Week-based drip/scheduling
- Mobile-responsive design
- Certificate generation (optional)
- Deployment + DNS + monitoring

---

## Consulting-Firm-Specific Recommendations

1. **White-label ready** — Use your firm's branding, not a generic LMS look
2. **Client-facing option** — Consider offering courses to clients as a value-add
3. **Internal training** — Use the same platform for onboarding new consultants
4. **Analytics** — Track which videos/materials get the most engagement to improve content
5. **Cohort model** — Consider cohort-based enrollment (all students start Week 1 together) vs. self-paced
6. **Discussion / Q&A** — Optional: add a simple comment thread per lesson for student questions
