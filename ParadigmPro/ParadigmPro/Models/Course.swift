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
    let upcomingSession: UpcomingSession?
    let checkInToday: Bool
    let checkInStreak: Int?
    let coachInsight: String?
    let activeGoals: [DashboardGoal]?
    let pendingActionItems: [DashboardActionItem]?
}

struct UpcomingSession: Codable {
    let scheduledAt: String
    let zoomMeetingUrl: String?
}

struct DashboardGoal: Codable, Identifiable {
    let id: String
    let title: String
    let status: String?
    let targetDate: String?
}

struct DashboardActionItem: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let dueDate: String?
    let completed: Bool?
}

struct Affirmation: Codable {
    let content: String
    let author: String?
}

struct NextLesson: Codable, Hashable {
    let number: Int
    let title: String
    let slug: String
    let subtitle: String?
    let estimatedMinutes: Int?
}

// MARK: - Daily Check-In

struct CheckIn: Codable, Identifiable {
    let id: String
    let userId: String?
    let checkInDate: String?
    let mood: Int
    let wins: String
    let struggles: String
    let tomorrowPlan: String
    let aiInsight: String?
    let createdAt: String?
    let streak: Int?
}

// MARK: - Long-Term Goals

struct LongTermGoal: Codable, Identifiable {
    let id: String
    let userId: String?
    let title: String
    let description: String?
    let targetDate: String?
    let status: String?
    let aiRefined: Bool?
    let originalText: String?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Action Items

struct ActionItem: Codable, Identifiable {
    let id: String
    let userId: String?
    let lessonId: String?
    let goalId: String?
    let title: String
    let description: String?
    let dueDate: String?
    let completed: Bool?
    let completedAt: String?
    let createdAt: String?
}

// MARK: - Notes

struct LessonNote: Codable, Identifiable {
    let id: String
    let userId: String?
    let lessonId: String?
    let lessonSlug: String?
    let content: String
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Badges

struct BadgesResponse: Codable {
    let definitions: [BadgeDefinition]
    let earned: [UserBadge]
}

// MARK: - Notifications

struct AppNotification: Codable, Identifiable {
    let id: String
    let userId: String?
    let type: String?
    let title: String
    let message: String?
    let link: String?
    let read: Bool?
    let createdAt: String?
}

// MARK: - Roadmap

struct RoadmapDay: Codable, Identifiable {
    var id: Int { day }
    let day: Int
    let title: String
    let description: String?
    let completed: Bool
    let reflection: String?
}

// MARK: - Community

struct LeaderboardEntry: Codable, Identifiable {
    let id: String
    let fullName: String?
    let avatarUrl: String?
    let points: Int?
    let level: Int?
    let rank: Int?
}

// MARK: - Generic success

struct SuccessResponse: Codable {
    let success: Bool?
    let message: String?
}
