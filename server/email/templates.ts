// Branded HTML email wrapper
function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Paradigm Pro</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Inter,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);padding:28px 36px;text-align:center;">
            <h1 style="margin:0;color:#f97316;font-size:22px;font-weight:800;letter-spacing:-0.5px;">PARADIGM PRO</h1>
            <p style="margin:4px 0 0;color:#a5b4fc;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Thinking Into Results</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="background:#ffffff;padding:36px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#1e1b4b;padding:20px 36px;text-align:center;">
            <p style="margin:0;color:#6366f1;font-size:11px;">
              © 2026 Paradigm Pro · <a href="{{{unsubscribe_url}}}" style="color:#6366f1;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;margin:20px 0;">${text}</a>`;
}

function h2(text: string): string {
  return `<h2 style="margin:0 0 12px;color:#1e1b4b;font-size:22px;font-weight:800;line-height:1.3;">${text}</h2>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`;
}

// ── Templates ──────────────────────────────────────────────────────────────

export interface EmailTemplate {
  subject: string;
  html: (data: Record<string, string>) => string;
}

export const templates: Record<string, EmailTemplate> = {

  welcome: {
    subject: "Welcome to Paradigm Pro — Here's Your Game Plan 🔥",
    html: (d) => base(`
      ${h2(`Welcome, ${d.name || "Future Champion"}!`)}
      ${p("You just made a decision that will change everything. Bob Proctor's <strong>Thinking Into Results</strong> program is the most powerful paradigm-shift methodology ever created — and you now have full access.")}
      ${p("Here's your game plan for the next 7 days:")}
      <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
        <li>Start with <strong>Lesson 1: The Power of Your Paradigm</strong></li>
        <li>Set your first weekly goal in your dashboard</li>
        <li>Check in with your AI Coach after each lesson</li>
        <li>Complete your first 9-day roadmap</li>
      </ul>
      ${p("The most important step? <strong>Starting today.</strong> Not tomorrow.")}
      <div style="text-align:center;">
        ${ctaButton("Start Lesson 1 Now →", `${d.appUrl}/lessons`)}
      </div>
      ${divider()}
      ${p(`Your coach is available inside every lesson — just click "Ask your Coach" anytime. Talk soon,<br/><strong>The Paradigm Pro Team</strong>`)}
    `),
  },

  lessonReminder: {
    subject: "You Left Off at {lesson} — Keep Your Momentum Going",
    html: (d) => base(`
      ${h2("Don't break your streak!")}
      ${p(`Hey ${d.name || "there"} — you're making real progress through <strong>Thinking Into Results</strong>.`)}
      ${p(`You last studied <strong>${d.lastLesson || "your lessons"}</strong>. Your next lesson is ready and waiting.`)}
      ${p("Every day you don't study is a day your old paradigm reasserts control. <strong>5 minutes right now</strong> keeps your momentum alive.")}
      <div style="text-align:center;">
        ${ctaButton("Continue Where I Left Off →", `${d.appUrl}/lessons`)}
      </div>
      ${divider()}
      ${p("Remember: Consistent study, not perfection, is what creates lasting change.")}
    `),
  },

  weeklyProgress: {
    subject: "Your Weekly Progress Report 📊",
    html: (d) => base(`
      ${h2(`Week in Review, ${d.name || "Champion"}!`)}
      <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td width="33%" style="text-align:center;padding:16px;background:#f9f5ff;border-radius:10px;margin-right:8px;">
            <div style="font-size:28px;font-weight:800;color:#7c3aed;">${d.lessonsCompleted || "0"}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Lessons Done</div>
          </td>
          <td width="4%"></td>
          <td width="33%" style="text-align:center;padding:16px;background:#fff7ed;border-radius:10px;">
            <div style="font-size:28px;font-weight:800;color:#f97316;">${d.streakDays || "0"}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Day Streak</div>
          </td>
          <td width="4%"></td>
          <td width="33%" style="text-align:center;padding:16px;background:#f0fdf4;border-radius:10px;">
            <div style="font-size:28px;font-weight:800;color:#16a34a;">${d.badgesEarned || "0"}</div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Badges Earned</div>
          </td>
        </tr>
      </table>
      ${p(`${d.lessonsCompleted && parseInt(d.lessonsCompleted) > 0 ? "You're building momentum! Every lesson is reprogramming your subconscious one thought at a time." : "This week is a fresh start. One lesson today can shift everything."}`)}
      <div style="text-align:center;">
        ${ctaButton("View My Dashboard →", `${d.appUrl}/dashboard`)}
      </div>
    `),
  },

  courseComplete: {
    subject: "🏆 You Crushed It! Thinking Into Results — COMPLETE",
    html: (d) => base(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:56px;">🏆</div>
        ${h2(`You Did It, ${d.name || "Champion"}!`)}
      </div>
      ${p("You've completed all 12 lessons of <strong>Thinking Into Results</strong> by Bob Proctor. That puts you in the top 1% of people who not only learn about personal transformation — but actually <em>do the work</em>.")}
      ${p("What happens now? The real work begins. Your new paradigm needs daily reinforcement. Keep journaling, keep setting goals, keep studying.")}
      ${p("As a celebration, your certificate of completion is waiting for you in your profile.")}
      <div style="text-align:center;">
        ${ctaButton("View My Certificate →", `${d.appUrl}/profile`)}
      </div>
      ${divider()}
      ${p("Ready to go deeper? Upgrade to <strong>Consultant-Guided</strong> and get 1-on-1 support from a certified Paradigm Pro consultant.")}
      <div style="text-align:center;">
        <a href="${d.appUrl}/billing" style="color:#f97316;font-weight:600;font-size:14px;">Explore Consultant Coaching →</a>
      </div>
    `),
  },

  winBack: {
    subject: "We Miss You — Come Back with 20% Off 💫",
    html: (d) => base(`
      ${h2(`${d.name || "Hey there"} — it's been a while.`)}
      ${p("Life gets busy. We get it. But your transformation journey is still waiting for you — and your old paradigm hasn't given up.")}
      ${p("The good news? You don't have to start over. Your progress is saved. Your notes are there. Your AI Coach remembers where you were.")}
      ${p("To welcome you back, we're offering <strong>20% off your next month</strong> — automatically applied at checkout.")}
      <div style="background:#fff7ed;border:2px solid #f97316;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <div style="font-size:13px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Return Offer</div>
        <div style="font-size:36px;font-weight:800;color:#f97316;margin:8px 0;">20% OFF</div>
        <div style="font-size:13px;color:#92400e;">Applied automatically · Limited time</div>
      </div>
      <div style="text-align:center;">
        ${ctaButton("Claim My 20% Off →", `${d.appUrl}/billing`)}
      </div>
    `),
  },

  upsell: {
    subject: "You're Making Amazing Progress — Unlock 1-on-1 Coaching",
    html: (d) => base(`
      ${h2(`${d.name || "Hey"} — you're on fire! 🔥`)}
      ${p(`You've completed <strong>${d.lessonsCompleted || "several"} lessons</strong> and your momentum is building. This is exactly when 1-on-1 support takes your transformation to the next level.`)}
      ${p("With <strong>Consultant-Guided</strong>, you get:")}
      <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:15px;line-height:2.2;">
        <li>Weekly 1-on-1 sessions with a certified consultant</li>
        <li>Personalized accountability check-ins</li>
        <li>Unlimited AI coaching messages (vs. 100/day on Self-Guided)</li>
        <li>Priority support and direct messaging</li>
      </ul>
      ${p("Most students who upgrade see a <strong>3x increase in lesson completion</strong> and much stronger results.")}
      <div style="text-align:center;">
        ${ctaButton("Upgrade to Consultant-Guided →", `${d.appUrl}/billing`)}
      </div>
    `),
  },

  accountability: {
    subject: "Did You Complete Your Action Item? ✅",
    html: (d) => base(`
      ${h2("Checking in on your action plan!")}
      ${p(`Hey ${d.name || "there"} — after your last lesson, your AI Coach generated a personalized action plan for you.`)}
      ${p(`The action item was: <strong style="color:#1e1b4b;">"${d.actionItem || "your lesson action step"}"</strong>`)}
      ${p("Have you completed it? Even partial action builds the neural pathways that make transformation stick.")}
      ${p("If you've done it — celebrate! Log your win in your journal. If not — that's okay, but now is the time.")}
      <div style="text-align:center;">
        ${ctaButton("Check My Action Plan →", `${d.appUrl}/lessons`)}
      </div>
      ${divider()}
      ${p("Your coach is ready to help you work through any blocks. Just open the lesson and click 'Ask your Coach'.")}
    `),
  },

};

export type TemplateName = keyof typeof templates;
