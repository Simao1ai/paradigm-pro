import { storage } from "../storage.js";
import { sendEmail } from "./client.js";

export async function sendAccountabilityEmails() {
  console.log("[Accountability] Sending accountability emails…");

  try {
    const userIds = await storage.getUsersWithoutTodayCheckIn();

    for (const userId of userIds) {
      try {
        const profile = await storage.getProfile(userId);
        if (!profile || profile.emailOptOut) continue;
        const userEmail = await storage.getUserEmail(userId);
        if (!userEmail?.email) continue;

        const activeGoals = await storage.getLongTermGoals(userId, "active");
        if (activeGoals.length === 0) continue;

        const firstName = profile.fullName?.split(" ")[0] || "Friend";
        const goalTitle = activeGoals[0].title;

        const html = `
          <div style="font-family:'Georgia',serif;max-width:520px;margin:0 auto;background:#0B1628;color:#e2e8f0;padding:32px;border-radius:12px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="font-size:22px;color:#C9A84C;margin:0;">⚡ Daily Check-In Reminder</h1>
            </div>
            <p style="font-size:15px;line-height:1.7;">Hi ${firstName},</p>
            <p style="font-size:15px;line-height:1.7;">
              You haven't checked in today — and your goal <strong style="color:#C9A84C;">"${goalTitle}"</strong> deserves your attention.
            </p>
            <p style="font-size:15px;line-height:1.7;">
              Take 2 minutes right now to reflect on your day. Your AI coach is waiting to give you personalized insights.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${process.env.APP_URL || "https://paradigmpro.replit.app"}/check-in"
                 style="background:#C9A84C;color:#0B1628;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:15px;">
                Do Today's Check-In →
              </a>
            </div>
            <p style="font-size:13px;color:#64748b;text-align:center;margin-top:24px;">
              <a href="${process.env.APP_URL || "https://paradigmpro.replit.app"}/email/unsubscribe?email=${encodeURIComponent(userEmail.email)}" style="color:#64748b;">Unsubscribe</a>
            </p>
          </div>
        `;

        await sendEmail({
          to: userEmail.email,
          subject: `${firstName}, don't break your streak today 🔥`,
          html,
        });

        console.log(`[Accountability] Sent to ${userId}`);
      } catch (err) {
        console.error(`[Accountability] Error for ${userId}:`, err);
      }
    }
  } catch (err) {
    console.error("[Accountability] Fatal error:", err);
  }
}
