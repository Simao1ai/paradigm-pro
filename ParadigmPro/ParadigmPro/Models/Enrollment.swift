import Foundation

struct Enrollment: Codable, Identifiable {
    let id: String
    let userId: String
    let courseId: String
    let enrolledAt: String
    let completedAt: String?
}
