export interface LessonMeta {
  number: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  keyPrinciple: string;
  estimatedMinutes: number;
  hasAudio: boolean;
  color: string;
}

export const LESSONS: LessonMeta[] = [
  { number: 1, title: "A Worthy Ideal", slug: "a-worthy-ideal", subtitle: "Define what you truly want", description: "Discover how to identify a goal worthy of your greatest effort — one that excites and challenges you simultaneously.", keyPrinciple: "You must have a clearly defined, deeply desired goal to activate your subconscious mind.", estimatedMinutes: 45, hasAudio: false, color: "from-blue-900 to-indigo-900" },
  { number: 2, title: "The Knowing/Doing Gap", slug: "the-knowing-doing-gap", subtitle: "Bridge the gap between knowledge and action", description: "Understand why knowing what to do is never enough — and how to bridge the gap between knowledge and consistent action.", keyPrinciple: "The gap between knowing and doing is where most people live. Paradigms keep you stuck.", estimatedMinutes: 50, hasAudio: false, color: "from-purple-900 to-blue-900" },
  { number: 3, title: "Your Infinite Mind", slug: "your-infinite-mind", subtitle: "Tap into unlimited potential", description: "Explore the limitless power of your mind and how accessing higher levels of consciousness transforms your results.", keyPrinciple: "The mind has no limits. You are connected to an infinite source of intelligence and creativity.", estimatedMinutes: 40, hasAudio: false, color: "from-teal-900 to-cyan-900" },
  { number: 4, title: "The Secret Genie", slug: "the-secret-genie", subtitle: "Your subconscious is always granting wishes", description: "Uncover how your subconscious mind acts as a genie — fulfilling the orders you give it through habitual thoughts and paradigms.", keyPrinciple: "Your subconscious mind does not know the difference between what is real and what is vividly imagined.", estimatedMinutes: 60, hasAudio: true, color: "from-amber-900 to-yellow-900" },
  { number: 5, title: "Thinking Into Results", slug: "thinking-into-results", subtitle: "Thoughts become things", description: "Learn the fundamental law that connects your thinking directly to the physical results you experience in life.", keyPrinciple: "Every result in your life was first a thought. You are always thinking into results.", estimatedMinutes: 55, hasAudio: false, color: "from-rose-900 to-pink-900" },
  { number: 6, title: "Environment Is But Our Looking Glass", slug: "environment-is-our-looking-glass", subtitle: "Your world reflects your inner state", description: "Discover how your external environment is always a perfect reflection of your internal world — and how to change both simultaneously.", keyPrinciple: "Your environment is a mirror of your consciousness. Change your thinking, change your world.", estimatedMinutes: 50, hasAudio: true, color: "from-green-900 to-emerald-900" },
  { number: 7, title: "Trample the Terror Barrier", slug: "trample-the-terror-barrier", subtitle: "Break through fear into freedom", description: "Face the invisible terror barrier that keeps people trapped in their comfort zone — and learn to move through it with courage.", keyPrinciple: "Every new goal requires crossing a terror barrier. The only way out is through.", estimatedMinutes: 55, hasAudio: true, color: "from-orange-900 to-red-900" },
  { number: 8, title: "The Power of Praxis", slug: "the-power-of-praxis", subtitle: "Walk your talk — integrate knowledge with action", description: "Understand praxis — the integration of theory and practice — and why closing the gap between what you know and what you do is the key to transformation.", keyPrinciple: "Praxis is when knowledge and action become one. That is where real power lives.", estimatedMinutes: 50, hasAudio: true, color: "from-violet-900 to-purple-900" },
  { number: 9, title: "The Magic Word", slug: "the-magic-word", subtitle: "The one word that changes everything", description: "Discover the single word that unlocks the door to growth, abundance, and transformation in every area of your life.", keyPrinciple: "One word, properly understood, has the power to transform your entire life.", estimatedMinutes: 45, hasAudio: true, color: "from-sky-900 to-blue-900" },
  { number: 10, title: "The Most Valuable Person", slug: "the-most-valuable-person", subtitle: "Become indispensable in your field", description: "Learn what separates the most valuable people in any organization or field — and how to become one.", keyPrinciple: "The most valuable person is the one who adds the most value to others.", estimatedMinutes: 50, hasAudio: true, color: "from-fuchsia-900 to-pink-900" },
  { number: 11, title: "Leaving Everyone with the Impression of Increase", slug: "leaving-everyone-impression-of-increase", subtitle: "Give more than you take — always", description: "Embrace the spirit of opulence and learn how leaving everyone better off than you found them creates a magnetic field of abundance around you.", keyPrinciple: "Always leave people with the impression of increase. This is the foundation of a life of abundance.", estimatedMinutes: 50, hasAudio: true, color: "from-lime-900 to-green-900" },
  { number: 12, title: "Magnifying the Mind", slug: "magnifying-the-mind", subtitle: "Expand your capacity for greatness", description: "In the final lesson, learn how to continually expand your mind, your vision, and your results — making this the beginning, not the end.", keyPrinciple: "The mind, once expanded, never returns to its original dimensions. Growth is permanent.", estimatedMinutes: 60, hasAudio: true, color: "from-indigo-900 to-slate-900" },
];

export const ROADMAP_DAYS = [
  { day: 1, title: "Set Your Worthy Ideal", description: "Define the life you truly want to live" },
  { day: 2, title: "Audit Your Paradigms", description: "Identify the beliefs holding you back" },
  { day: 3, title: "Design Your New Paradigm", description: "Write the beliefs that will serve your goal" },
  { day: 4, title: "Visualize Daily", description: "Begin your daily visualization practice" },
  { day: 5, title: "Speak It Into Existence", description: "Create and use your personal affirmations" },
  { day: 6, title: "Take Inspired Action", description: "Move toward your goal with courage" },
  { day: 7, title: "Reflect and Adjust", description: "Review your week and celebrate progress" },
  { day: 8, title: "Deepen Your Practice", description: "Go deeper into the lesson that resonates most" },
  { day: 9, title: "Commit to the Journey", description: "Declare your commitment to transformation" },
];
