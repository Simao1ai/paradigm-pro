import Foundation

final class ProgressService {
    static let shared = ProgressService()
    private let api = APIClient.shared

    private init() {}

    func fetchProgress() async throws -> [LessonProgress] {
        try await api.get("/progress")
    }

    func updateProgress(lessonId: String, status: String) async throws -> LessonProgress {
        try await api.post("/progress", body: ["lessonId": lessonId, "status": status])
    }

    func updateProgressBySlug(lessonSlug: String, status: String) async throws -> LessonProgress {
        try await api.post("/progress", body: ["lessonSlug": lessonSlug, "status": status])
    }
}
