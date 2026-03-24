import Foundation

enum Constants {
    // MARK: - API Configuration
    // Update this to your Replit deployment URL
    static let apiBaseURL = "https://myparadigmpro.com/api"

    // MARK: - Keychain
    static let keychainServiceName = "com.paradigmpro.ios"
    static let keychainTokenKey = "auth_token"
    static let keychainRefreshTokenKey = "refresh_token"

    // MARK: - Video
    static let videoAutoSaveInterval: TimeInterval = 5.0
    static let videoAutoCompleteThreshold: Double = 0.9
}

// MARK: - Hardcoded Lesson Data (matches web client/src/lib/constants.ts)
// The web app uses these hardcoded lessons, NOT the /api/lessons endpoint.

struct LessonMeta: Identifiable, Hashable {
    var id: Int { number }
    let number: Int
    let title: String
    let slug: String
    let subtitle: String
    let description: String
    let keyPrinciple: String
    let estimatedMinutes: Int
    let hasAudio: Bool
}

let ALL_LESSONS: [LessonMeta] = [
    LessonMeta(number: 1, title: "A Worthy Ideal", slug: "a-worthy-ideal", subtitle: "Define what you truly want", description: "Discover how to identify a goal worthy of your greatest effort \u{2014} one that excites and challenges you simultaneously.", keyPrinciple: "You must have a clearly defined, deeply desired goal to activate your subconscious mind.", estimatedMinutes: 45, hasAudio: false),
    LessonMeta(number: 2, title: "The Knowing/Doing Gap", slug: "the-knowing-doing-gap", subtitle: "Bridge the gap between knowledge and action", description: "Understand why knowing what to do is never enough \u{2014} and how to bridge the gap between knowledge and consistent action.", keyPrinciple: "The gap between knowing and doing is where most people live. Paradigms keep you stuck.", estimatedMinutes: 50, hasAudio: false),
    LessonMeta(number: 3, title: "Your Infinite Mind", slug: "your-infinite-mind", subtitle: "Tap into unlimited potential", description: "Explore the limitless power of your mind and how accessing higher levels of consciousness transforms your results.", keyPrinciple: "The mind has no limits. You are connected to an infinite source of intelligence and creativity.", estimatedMinutes: 40, hasAudio: false),
    LessonMeta(number: 4, title: "The Secret Genie", slug: "the-secret-genie", subtitle: "Your subconscious is always granting wishes", description: "Uncover how your subconscious mind acts as a genie \u{2014} fulfilling the orders you give it through habitual thoughts and paradigms.", keyPrinciple: "Your subconscious mind does not know the difference between what is real and what is vividly imagined.", estimatedMinutes: 60, hasAudio: true),
    LessonMeta(number: 5, title: "Thinking Into Results", slug: "thinking-into-results", subtitle: "Thoughts become things", description: "Learn the fundamental law that connects your thinking directly to the physical results you experience in life.", keyPrinciple: "Every result in your life was first a thought. You are always thinking into results.", estimatedMinutes: 55, hasAudio: false),
    LessonMeta(number: 6, title: "Environment Is But Our Looking Glass", slug: "environment-is-our-looking-glass", subtitle: "Your world reflects your inner state", description: "Discover how your external environment is always a perfect reflection of your internal world \u{2014} and how to change both simultaneously.", keyPrinciple: "Your environment is a mirror of your consciousness. Change your thinking, change your world.", estimatedMinutes: 50, hasAudio: true),
    LessonMeta(number: 7, title: "Trample the Terror Barrier", slug: "trample-the-terror-barrier", subtitle: "Break through fear into freedom", description: "Face the invisible terror barrier that keeps people trapped in their comfort zone \u{2014} and learn to move through it with courage.", keyPrinciple: "Every new goal requires crossing a terror barrier. The only way out is through.", estimatedMinutes: 55, hasAudio: true),
    LessonMeta(number: 8, title: "The Power of Praxis", slug: "the-power-of-praxis", subtitle: "Walk your talk \u{2014} integrate knowledge with action", description: "Understand praxis \u{2014} the integration of theory and practice \u{2014} and why closing the gap between what you know and what you do is the key to transformation.", keyPrinciple: "Praxis is when knowledge and action become one. That is where real power lives.", estimatedMinutes: 50, hasAudio: true),
    LessonMeta(number: 9, title: "The Magic Word", slug: "the-magic-word", subtitle: "The one word that changes everything", description: "Discover the single word that unlocks the door to growth, abundance, and transformation in every area of your life.", keyPrinciple: "One word, properly understood, has the power to transform your entire life.", estimatedMinutes: 45, hasAudio: true),
    LessonMeta(number: 10, title: "The Most Valuable Person", slug: "the-most-valuable-person", subtitle: "Become indispensable in your field", description: "Learn what separates the most valuable people in any organization or field \u{2014} and how to become one.", keyPrinciple: "The most valuable person is the one who adds the most value to others.", estimatedMinutes: 50, hasAudio: true),
    LessonMeta(number: 11, title: "Leaving Everyone with the Impression of Increase", slug: "leaving-everyone-impression-of-increase", subtitle: "Give more than you take \u{2014} always", description: "Embrace the spirit of opulence and learn how leaving everyone better off than you found them creates a magnetic field of abundance around you.", keyPrinciple: "Always leave people with the impression of increase. This is the foundation of a life of abundance.", estimatedMinutes: 50, hasAudio: true),
    LessonMeta(number: 12, title: "Magnifying the Mind", slug: "magnifying-the-mind", subtitle: "Expand your capacity for greatness", description: "In the final lesson, learn how to continually expand your mind, your vision, and your results \u{2014} making this the beginning, not the end.", keyPrinciple: "The mind, once expanded, never returns to its original dimensions. Growth is permanent.", estimatedMinutes: 60, hasAudio: true),
]
