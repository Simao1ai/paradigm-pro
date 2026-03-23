import Foundation

// Matches the new flat lessons schema (not the old Course/Week hierarchy)
struct Lesson: Codable, Identifiable, Hashable {
    let id: String
    let lessonNumber: Int
    let title: String
    let slug: String
    let subtitle: String?
    let description: String?
    let keyPrinciple: String?
    let estimatedMinutes: Int?
    let hasAudio: Bool?
    let isPublished: Bool?
    let sortOrder: Int
    let createdAt: String?
    let assets: [LessonAsset]?

    static func == (lhs: Lesson, rhs: Lesson) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

struct LessonAsset: Codable, Identifiable {
    let id: String
    let lessonId: String
    let assetType: String // "pdf", "audio", "worksheet"
    let label: String
    let storagePath: String
    let fileSizeBytes: Int?
    let mimeType: String?
    let sortOrder: Int?
}

// Dashboard response from GET /api/dashboard
struct DashboardData: Codable {
    let affirmation: Affirmation?
    let lessonsCompleted: Int
    let currentStreak: Int
    let badgeCount: Int
    let progressPercent: Int
    let completedLessonNumbers: [Int]
    let nextLesson: NextLesson?
    let checkInToday: Bool
    let checkInStreak: Int?
}

struct Affirmation: Codable {
    let content: String
    let author: String?
}

struct NextLesson: Codable {
    let number: Int
    let title: String
    let slug: String
    let subtitle: String?
    let estimatedMinutes: Int?
}
