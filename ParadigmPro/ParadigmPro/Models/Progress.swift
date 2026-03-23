import Foundation

struct LessonProgress: Codable, Identifiable {
    let id: String
    let userId: String
    let lessonId: String
    let status: String // "not_started", "in_progress", "completed"
    let audioPositionSecs: Int?
    let completedAt: String?
    let lastAccessedAt: String?

    // Joined fields from storage query
    let lessonNumber: Int?
    let lessonTitle: String?
    let lessonSlug: String?

    var isCompleted: Bool {
        status == "completed"
    }
}
