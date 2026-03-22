import { storage } from "../storage.js";
import { sendEmail } from "./client.js";
import { templates } from "./templates.js";

const APP_URL = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
  : "https://paradigmpro.app";

export type TriggerEvent =
  | "signup"
  | "enrollment"
  | "inactivity"
  | "completion"
  | "churn"
  | "upsell"
  | "accountability";

// Seed default sequences if they don't exist yet
export async function seedDefaultSequences() {
  const existing = await storage.getEmailSequences();
  if (existing.length > 0) return;

  const sequences = [
    {
      name: "Welcome Sequence",
      triggerEvent: "signup",
      steps: [
        { templateName: "welcome", subject: "Welcome to Paradigm Pro — Here's Your Game Plan 🔥", delayDays: 0, order: 1 },
        { templateName: "lessonReminder", subject: "Your first lesson is waiting for you", delayDays: 2, order: 2 },
        { templateName: "accountability", subject: "How's it going? Quick check-in", delayDays: 5, order: 3 },
      ],
    },
    {
      name: "Enrollment Sequence",
      triggerEvent: "enrollment",
      steps: [
        { templateName: "welcome", subject: "You're in! Let's get started 🚀", delayDays: 0, order: 1 },
        { templateName: "lessonReminder", subject: "Day 2 — don't break your streak!", delayDays: 2, order: 2 },
        { templateName: "upsell", subject: "Want even better results? Here's how", delayDays: 7, order: 3 },
      ],
    },
    {
      name: "Inactivity Re-engagement",
      triggerEvent: "inactivity",
      steps: [
        { templateName: "lessonReminder", subject: "We haven't seen you in a while 👀", delayDays: 0, order: 1 },
        { templateName: "winBack", subject: "Special offer — come back with 20% off", delayDays: 3, order: 2 },
      ],
    },
    {
      name: "Course Completion",
      triggerEvent: "completion",
      steps: [
        { templateName: "courseComplete", subject: "🏆 You Crushed It! Course Complete", delayDays: 0, order: 1 },
        { templateName: "upsell", subject: "Ready to go deeper? 1-on-1 coaching available", delayDays: 3, order: 2 },
      ],
    },
    {
      name: "Win-Back (Churn)",
      triggerEvent: "churn",
      steps: [
        { templateName: "winBack", subject: "We miss you — exclusive offer inside", delayDays: 0, order: 1 },
        { templateName: "lessonReminder", subject: "Your progress is still waiting for you", delayDays: 5, order: 2 },
      ],
    },
  ];

  for (const seq of sequences) {
    const created = await storage.createEmailSequence(seq.name, seq.triggerEvent);
    for (const step of seq.steps) {
      await storage.addEmailStep(created.id, step.templateName, step.subject, step.delayDays, step.order);
    }
  }

  console.log("[Email] Default sequences seeded");
}

// Trigger a sequence for a user based on an event
export async function triggerEmailSequence(
  userId: string,
  event: TriggerEvent,
  metadata?: Record<string, string>,
): Promise<void> {
  try {
    const sequence = await storage.getEmailSequenceByEvent(event);
    if (!sequence) return;

    // Check if user already has this sequence running
    const existing = await storage.getUserEmailState(userId, sequence.id);
    if (existing && !existing.completed) return; // Already in sequence

    // Get user profile for email/name
    const profile = await storage.getProfile(userId);
    if (!profile || profile.emailOptOut) return;

    const userRecord = await storage.getUserEmail(userId);
    if (!userRecord?.email) return;

    // Create or reset state
    await storage.upsertUserEmailState(userId, sequence.id);

    // Send step 0 immediately if delay is 0
    const steps = await storage.getEmailSteps(sequence.id);
    const firstStep = steps.find((s) => s.order === 1);
    if (firstStep && firstStep.delayDays === 0) {
      await sendTemplateEmail(userId, userRecord.email, profile.fullName || "", firstStep, metadata);
      await storage.advanceUserEmailState(userId, sequence.id, 1);
    }
  } catch (err) {
    console.error("[Email] Trigger error:", err);
  }
}

async function sendTemplateEmail(
  userId: string,
  toEmail: string,
  userName: string,
  step: { templateName: string; subject: string },
  metadata?: Record<string, string>,
) {
  const tpl = templates[step.templateName];
  if (!tpl) {
    console.warn(`[Email] Template not found: ${step.templateName}`);
    return;
  }

  const data = {
    name: userName,
    appUrl: APP_URL,
    ...metadata,
  };

  const html = tpl.html(data);
  const result = await sendEmail({ to: toEmail, subject: step.subject, html });

  if (result.success) {
    await storage.logEmail(userId, toEmail, step.templateName, step.subject);
  }
}

// Called by cron — process all due emails in active sequences
export async function processEmailQueue(): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;

  try {
    const dueStates = await storage.getDueEmailStates();

    for (const state of dueStates) {
      try {
        const steps = await storage.getEmailSteps(state.sequenceId);
        const nextStep = steps.find((s) => s.order === state.currentStep + 1);

        if (!nextStep) {
          await storage.markEmailStateComplete(state.id);
          continue;
        }

        const profile = await storage.getProfile(state.userId);
        if (!profile || profile.emailOptOut) {
          await storage.markEmailStateComplete(state.id);
          continue;
        }

        const userRecord = await storage.getUserEmail(state.userId);
        if (!userRecord?.email) continue;

        await sendTemplateEmail(state.userId, userRecord.email, profile.fullName || "", nextStep);
        await storage.advanceUserEmailState(state.userId, state.sequenceId, state.currentStep + 1);

        const remainingSteps = steps.filter((s) => s.order > state.currentStep + 1);
        if (remainingSteps.length === 0) {
          await storage.markEmailStateComplete(state.id);
        }

        processed++;
      } catch (err) {
        console.error("[Email] Process state error:", err);
        errors++;
      }
    }
  } catch (err) {
    console.error("[Email] Queue processing error:", err);
  }

  if (processed > 0 || errors > 0) {
    console.log(`[Email] Queue: ${processed} sent, ${errors} errors`);
  }

  return { processed, errors };
}

// Check for inactive users (3+ days) and trigger inactivity sequence
export async function checkInactivity(): Promise<void> {
  try {
    const inactiveUsers = await storage.getInactiveUsers(3);
    for (const user of inactiveUsers) {
      await triggerEmailSequence(user.id, "inactivity");
    }
    if (inactiveUsers.length > 0) {
      console.log(`[Email] Inactivity: triggered for ${inactiveUsers.length} users`);
    }
  } catch (err) {
    console.error("[Email] Inactivity check error:", err);
  }
}

// Check for churned/past-due subscriptions
export async function checkChurnRisk(): Promise<void> {
  try {
    const churnedUsers = await storage.getChurnRiskUsers();
    for (const user of churnedUsers) {
      await triggerEmailSequence(user.userId, "churn");
    }
    if (churnedUsers.length > 0) {
      console.log(`[Email] Churn: triggered for ${churnedUsers.length} users`);
    }
  } catch (err) {
    console.error("[Email] Churn check error:", err);
  }
}
