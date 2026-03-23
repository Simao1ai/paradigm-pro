import Foundation

final class LessonService {
    static let shared = LessonService()
    private let api = APIClient.shared

    private init() {}

    func fetchLessons() async throws -> [Lesson] {
        try await api.get("/lessons")
    }

    func fetchLesson(slug: String) async throws -> Lesson {
        try await api.get("/lessons/\(slug)")
    }

    func fetchDashboard() async throws -> DashboardData {
        try await api.get("/dashboard")
    }

    func fetchProfile() async throws -> Profile {
        try await api.get("/profile")
    }
}
