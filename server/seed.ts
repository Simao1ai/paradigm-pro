import { db } from "./db.js";
import { lessons, badgeDefinitions } from "../shared/schema.js";
import { sql } from "drizzle-orm";

const LESSON_DATA = [
  {
    id: "ae16cc2a-7afe-4098-bb9a-3875b80b30ce",
    lessonNumber: 1,
    slug: "a-worthy-ideal",
    title: "A Worthy Ideal",
    subtitle: "Define what you truly want",
    description: "Discover how to identify a goal worthy of your greatest effort — one that excites and challenges you simultaneously.",
    keyPrinciple: "You must have a clearly defined, deeply desired goal to activate your subconscious mind.",
    estimatedMinutes: 45,
    hasAudio: false,
    isPublished: true,
  },
  {
    id: "52dab89c-08c1-4c4d-b6ee-4cef082b353e",
    lessonNumber: 2,
    slug: "the-knowing-doing-gap",
    title: "The Knowing/Doing Gap",
    subtitle: "Bridge the gap between knowledge and action",
    description: "Understand why knowing what to do is never enough — and how to bridge the gap between knowledge and consistent action.",
    keyPrinciple: "The gap between knowing and doing is where most people live. Paradigms keep you stuck.",
    estimatedMinutes: 50,
    hasAudio: false,
    isPublished: true,
  },
  {
    id: "49d2e202-728d-454b-8398-4ccefb910716",
    lessonNumber: 3,
    slug: "your-infinite-mind",
    title: "Your Infinite Mind",
    subtitle: "Tap into unlimited potential",
    description: "Explore the limitless power of your mind and how accessing higher levels of consciousness transforms your results.",
    keyPrinciple: "The mind has no limits. You are connected to an infinite source of intelligence and creativity.",
    estimatedMinutes: 40,
    hasAudio: false,
    isPublished: true,
  },
  {
    id: "a4a47e4e-a335-4e70-8219-9d5e0ea4ae9e",
    lessonNumber: 4,
    slug: "the-secret-genie",
    title: "The Secret Genie",
    subtitle: "Your subconscious is always granting wishes",
    description: "Uncover how your subconscious mind acts as a genie — fulfilling the orders you give it through habitual thoughts and paradigms.",
    keyPrinciple: "Your subconscious mind does not know the difference between what is real and what is vividly imagined.",
    estimatedMinutes: 60,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "f681b366-641d-4fa4-8fd8-5cb3fb1a0256",
    lessonNumber: 5,
    slug: "thinking-into-results",
    title: "Thinking Into Results",
    subtitle: "Thoughts become things",
    description: "Learn the fundamental law that connects your thinking directly to the physical results you experience in life.",
    keyPrinciple: "Every result in your life was first a thought. You are always thinking into results.",
    estimatedMinutes: 55,
    hasAudio: false,
    isPublished: true,
  },
  {
    id: "62521ff5-6ffc-4c33-ab23-f3894275c7d8",
    lessonNumber: 6,
    slug: "environment-is-our-looking-glass",
    title: "Environment Is But Our Looking Glass",
    subtitle: "Your world reflects your inner state",
    description: "Your external environment reflects your internal world and the paradigms you hold about yourself and life.",
    keyPrinciple: "Your environment is a mirror of your consciousness.",
    estimatedMinutes: 50,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "4e4d54ac-4d75-4b83-b362-02d1071afcc5",
    lessonNumber: 7,
    slug: "trample-the-terror-barrier",
    title: "Trample the Terror Barrier",
    subtitle: "Break through fear into freedom",
    description: "Face the invisible terror barrier that stops most people from ever achieving their true potential and learn to move through it.",
    keyPrinciple: "Every new goal requires crossing a terror barrier. Courage is not the absence of fear — it is action despite fear.",
    estimatedMinutes: 55,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "fdf47b05-be6e-4989-a710-2d1c154ebd40",
    lessonNumber: 8,
    slug: "the-power-of-praxis",
    title: "The Power of Praxis",
    subtitle: "Walk your talk",
    description: "Understand praxis — the complete integration of theory and practice — and why it is the only way to achieve lasting transformation.",
    keyPrinciple: "Praxis is when knowledge and action become one. You don't do what you know; you do what you are.",
    estimatedMinutes: 50,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "75850b45-e94b-4aa9-9cc7-5340908cbfb5",
    lessonNumber: 9,
    slug: "the-magic-word",
    title: "The Magic Word",
    subtitle: "The one word that changes everything",
    description: "Discover the single most powerful word in the English language — and how applying it consistently can transform your entire life.",
    keyPrinciple: "One word has the power to transform your entire life. Attitude is everything.",
    estimatedMinutes: 45,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "03505c68-2419-4b64-bebc-0c4f170c51df",
    lessonNumber: 10,
    slug: "the-most-valuable-person",
    title: "The Most Valuable Person",
    subtitle: "Become indispensable in your field",
    description: "Learn what separates the most valuable people in any field and how to develop the qualities that make you indispensable.",
    keyPrinciple: "The most valuable person adds the most value to others. Your rewards in life are in direct proportion to your service.",
    estimatedMinutes: 50,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "cb67d799-1217-4373-a916-e54305b66b50",
    lessonNumber: 11,
    slug: "leaving-everyone-impression-of-increase",
    title: "Leaving Everyone with the Impression of Increase",
    subtitle: "Give more than you take",
    description: "Embrace the spirit of opulence and learn how leaving everyone better than you found them creates an upward spiral of abundance.",
    keyPrinciple: "Always leave people with the impression of increase. The law of increase is always working in your favor when you serve others.",
    estimatedMinutes: 50,
    hasAudio: true,
    isPublished: true,
  },
  {
    id: "90092510-c7c5-44c7-8d68-c1f20fd84c9d",
    lessonNumber: 12,
    slug: "magnifying-the-mind",
    title: "Magnifying the Mind",
    subtitle: "Expand your capacity for greatness",
    description: "Continually expand your mind, your vision, and your results — because a mind once stretched never returns to its original dimensions.",
    keyPrinciple: "The mind, once expanded, never returns to its original dimensions. Growth is your natural state.",
    estimatedMinutes: 60,
    hasAudio: true,
    isPublished: true,
  },
];

const BADGE_DATA = [
  { id: "854b845c-3cd2-4ed8-b75e-b3f6d988cce4", slug: "first-lesson", name: "First Steps", description: "Complete your first lesson", icon: "star", badgeType: "lesson", sortOrder: 1 },
  { id: "adddcce9-a2b0-46ae-be6e-bec1c1105aed", slug: "three-lessons", name: "Building Momentum", description: "Complete 3 lessons", icon: "zap", badgeType: "lesson", sortOrder: 2 },
  { id: "db3bb2d5-db32-49b4-9512-cca62a07d682", slug: "six-lessons", name: "Halfway There", description: "Complete 6 lessons", icon: "target", badgeType: "lesson", sortOrder: 3 },
  { id: "da862a87-79a6-4b69-a93f-00252d6d2a96", slug: "all-lessons", name: "Program Graduate", description: "Complete all 12 lessons", icon: "award", badgeType: "program", sortOrder: 4 },
  { id: "c84b4f1b-3681-4b02-9df8-bdc280415c42", slug: "first-journal", name: "Reflective Mind", description: "Write your first journal entry", icon: "book-open", badgeType: "engagement", sortOrder: 5 },
  { id: "0b50cb5f-12a5-4fe9-8e23-35cbce044827", slug: "first-goal", name: "Goal Setter", description: "Set your first weekly goal", icon: "target", badgeType: "engagement", sortOrder: 6 },
  { id: "ab0d8726-f190-4d62-8914-0a5021a02002", slug: "three-day-streak", name: "Consistent", description: "3-day activity streak", icon: "flame", badgeType: "streak", sortOrder: 7 },
  { id: "5616d972-d98b-4ff3-ab3a-88ace53a15a5", slug: "seven-day-streak", name: "Dedicated", description: "7-day activity streak", icon: "flame", badgeType: "streak", sortOrder: 8 },
  { id: "08f5549c-1e10-4549-97a5-23b4f8ab70fb", slug: "roadmap-complete", name: "Roadmap Champion", description: "Complete the 9-day roadmap", icon: "map", badgeType: "roadmap", sortOrder: 9 },
  { id: "bb28220a-228d-4579-becb-b68d84f7e357", slug: "social-butterfly", name: "Social Butterfly", description: "Post 10 discussions", icon: "🦋", badgeType: "engagement", sortOrder: 20 },
  { id: "4c335a12-62f8-4294-945c-e94ff9ea3d64", slug: "helping-hand", name: "Helping Hand", description: "Reply to 25 discussions", icon: "🤝", badgeType: "engagement", sortOrder: 21 },
  { id: "6168df2d-e12a-4614-b5a9-ad67b4476387", slug: "streak-master", name: "Streak Master", description: "30-day activity streak", icon: "⚡", badgeType: "streak", sortOrder: 22 },
  { id: "a9dbd631-d459-4c11-a6b5-4f357619d4fb", slug: "quiz-whiz", name: "Quiz Whiz", description: "Score 100% on 5 quizzes", icon: "🎯", badgeType: "engagement", sortOrder: 23 },
  { id: "33a22031-90b0-4fc5-8e7d-da6932b8d523", slug: "goal-getter", name: "Goal Getter", description: "Complete 10 action items", icon: "✅", badgeType: "engagement", sortOrder: 24 },
  { id: "c0b225f6-481e-4ebc-8f47-7be195d0f4c5", slug: "early-bird", name: "Early Bird", description: "Check in before 8am 7 days", icon: "🌅", badgeType: "streak", sortOrder: 25 },
  { id: "6c402e00-3947-4723-8ab3-b0c86573e243", slug: "paradigm-shifter", name: "Paradigm Shifter", description: "Reach Level 10", icon: "🧠", badgeType: "program", sortOrder: 26 },
  { id: "71aae44d-34e4-4917-a483-78a046c09a7a", slug: "week-warrior", name: "Week Warrior", description: "Complete all lessons in a week", icon: "⚔️", badgeType: "lesson", sortOrder: 27 },
  { id: "de9688bc-8f60-470d-8a7e-699489355693", slug: "course-champion", name: "Course Champion", description: "Complete the entire course", icon: "🏆", badgeType: "program", sortOrder: 28 },
];

export async function seedDatabase() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(lessons);
    if (count > 0) return;

    console.log("[Seed] Seeding lessons and badges...");

    await db.insert(lessons).values(LESSON_DATA).onConflictDoNothing();
    await db.insert(badgeDefinitions).values(BADGE_DATA).onConflictDoNothing();

    console.log("[Seed] Done — 12 lessons, 18 badges inserted.");
  } catch (err) {
    console.error("[Seed] Error:", err);
  }
}
