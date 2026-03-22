import Foundation

struct LessonProgress: Codable, Identifiable {
    let id: String
    let userId: String
    let lessonId: String
    let completed: Bool
    let videoProgress: Int
    let completedAt: String?
    let createdAt: String?
    let updatedAt: String?
}
