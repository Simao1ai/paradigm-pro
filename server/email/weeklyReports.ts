import { storage } from "../storage.js";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  return new Anthropic({
    baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  });
}

function getMondayOfPrevWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 7 : day;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff - 6);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function generateWeeklyReports() {
  console.log("[WeeklyReports] Generating weekly reports…");
  const weekStart = getMondayOfPrevWeek();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const profiles = await storage.getAllProfiles();
  const client = getAnthropicClient();

  for (const profile of profiles) {
    try {
      const userId = profile.id;
      const history = await storage.getCheckInHistory(userId, 14);
      const weekHistory = history.filter((h) => h.checkInDate >= weekStartStr);

      if (weekHistory.length === 0) continue;

      const streak = await storage.getCheckInStreak(userId);
      const lessonsCompleted = await storage.getWeekLessonCount(userId, weekStart);

      const avgMoodRaw = weekHistory.length > 0
        ? weekHistory.reduce((sum, h) => sum + h.mood, 0) / weekHistory.length
        : null;
      const avgMood = avgMoodRaw ? avgMoodRaw.toFixed(2) : null;

      let moodTrend = "stable";
      if (weekHistory.length >= 4) {
        const firstHalf = weekHistory.slice(Math.floor(weekHistory.length / 2));
        const secondHalf = weekHistory.slice(0, Math.floor(weekHistory.length / 2));
        const avgFirst = firstHalf.reduce((s, h) => s + h.mood, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((s, h) => s + h.mood, 0) / secondHalf.length;
        if (avgSecond - avgFirst > 0.5) moodTrend = "improving";
        else if (avgFirst - avgSecond > 0.5) moodTrend = "declining";
      }

      const winsText = weekHistory.map((h) => `- ${h.wins}`).join("\n");
      const strugglesText = weekHistory.map((h) => `- ${h.struggles}`).join("\n");

      const prompt = `You are a life coach writing a weekly progress report for a student in Bob Proctor's "Thinking Into Results" program.

Student: ${profile.fullName || "Student"}
Week of: ${weekStartStr}
Check-ins completed: ${weekHistory.length}/7 days
Lessons completed this week: ${lessonsCompleted}
Average mood: ${avgMood ? `${parseFloat(avgMood).toFixed(1)}/5` : "N/A"}
Mood trend: ${moodTrend}

Wins this week:
${winsText || "None recorded"}

Challenges this week:
${strugglesText || "None recorded"}

Write:
1. A 3-4 sentence personalized AI summary of their week (what they accomplished, how they showed up, what patterns you notice)
2. A 2-3 sentence specific recommendation for next week based on their struggles and goals

Respond with JSON:
{
  "aiSummary": "...",
  "aiRecommendation": "..."
}`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (response.content[0] as any).text || "{}";
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : {};

      await storage.upsertWeeklyReport(userId, weekStartStr, {
        lessonsCompleted,
        checkInStreak: streak,
        avgMood: avgMood ?? undefined,
        moodTrend,
        aiSummary: parsed.aiSummary || "",
        aiRecommendation: parsed.aiRecommendation || "",
      });

      console.log(`[WeeklyReports] Generated report for ${userId}`);
    } catch (err) {
      console.error(`[WeeklyReports] Error for ${profile.id}:`, err);
    }
  }

  console.log("[WeeklyReports] Done");
}
