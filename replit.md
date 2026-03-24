# Paradigm Pro — Learning Management System

## Overview
"Paradigm Pro" is a comprehensive Learning Management System (LMS) designed to deliver Bob Proctor's "Thinking Into Results" 12-lesson transformation program. It aims to provide a premium, engaging learning experience with features such as progress tracking, achievement badges, journaling, goal setting, and consultant scheduling. The platform supports two subscription tiers: Self-Guided and Consultant-Guided, targeting individuals seeking personal development and transformation. Key capabilities include AI-powered coaching, accountability tools, community forums, analytics for both users and administrators, and content automation for course creation.

## User Preferences
- Dark theme with navy (#0B1628) and gold (#C9A84C) accents
- Professional, premium look and feel
- Serif headings (Playfair Display), sans-serif body (Inter)
- The agent should prioritize maintaining the established UI/UX design (dark navy and gold theme, specific fonts).
- All AI-generated content (coaching, reports, content drafts) should align with the professional and premium tone of the platform.
- The agent should be aware of and respect the role-based access control for features, especially for admin-only sections and subscription tier differences.
- When implementing new features or modifying existing ones, ensure adherence to the defined technology stack and architectural patterns.

## System Architecture
The application follows a client-server architecture. The frontend is built with **React + Vite (TypeScript)**, utilizing **Tailwind CSS** for styling, **@tanstack/react-query** for state management, and **wouter** for client-side routing. The backend is an **Express.js (TypeScript)** server, integrating with **Replit PostgreSQL** via **Drizzle ORM** for data persistence. Authentication is handled through **Replit Auth (OpenID Connect via Passport)**, with an additional token-based authentication system for mobile clients.

**Core Features and Design Patterns:**
- **UI/UX**: Features a consistent dark navy and gold theme. Uses Playfair Display for headings and Inter for body text to maintain a professional, premium aesthetic.
- **Data Layer**: Drizzle ORM defines a comprehensive schema including users, subscriptions, lessons, progress, goals, badges, forums, and various AI-related data. Server-side authorization is implemented for access control.
- **API Design**: A RESTful API provides endpoints for authentication, lesson management, journaling, goal setting, badge display, roadmap progress, affirmations, and admin functionalities.
- **AI Integration**: Leverages AI (e.g., Claude) for a coaching chatbot with conversation history, action plan generation, quizzes, SMART goal refinement, daily check-in insights, and weekly reports. AI also assists with content automation, including curriculum, script, worksheet, and social media post generation.
- **Email Automation**: Implements automated email sequences using Resend for welcome, reminders, progress updates, and churn prevention, triggered by user actions and inactivity.
- **Accountability System**: Includes long-term goals with AI refinement, daily check-ins, action item tracking, and AI-generated weekly reports to promote user engagement and progress.
- **Gamification**: Incorporates points, levels, and badges to reward user activities such as lesson completion, check-ins, quiz performance, and forum participation.
- **Community Features**: Provides per-lesson embedded forums with discussions, replies, likes, and an activity feed with leaderboards to foster community interaction.
- **Analytics**: Comprehensive analytics system for both administrators (revenue, engagement, content, AI insights, churn prediction) and users (personal stats, progress, trends).
- **Content Automation**: Admin-facing AI tools for generating course curriculum, video scripts, worksheets, and social media content to streamline content creation.
- **Certificate Generation**: Automated PDF certificate generation for course completion with unique verification.
- **Mobile API**: A dedicated token-based authentication system for mobile applications, ensuring secure access to all existing API endpoints.

## External Dependencies
- **Replit PostgreSQL**: Primary database for all application data.
- **Drizzle ORM**: Object-Relational Mapper for interacting with PostgreSQL.
- **Replit Auth**: OpenID Connect-based authentication service.
- **Passport.js**: Authentication middleware for Node.js, used with Replit Auth.
- **Stripe**: (Planned) For subscription management, payments, and webhooks.
- **Resend**: For sending transactional and marketing emails.
- **AI Models (e.g., Claude)**: Integrated for various AI-powered features like coaching, content generation, and insights.
- **pdfkit**: Used for generating PDF completion certificates.
- **nanoid**: For generating unique IDs, specifically for certificate codes.
- **recharts**: JavaScript charting library for data visualization in analytics dashboards.