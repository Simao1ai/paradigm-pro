import Foundation

final class ProgressService {
    static let shared = ProgressService()
    private let api = APIClient.shared

    private init() {}

    func updateProgress(
        lessonId: String,
        videoProgress: Int? = nil,
        completed: Bool? = nil
    ) async throws -> LessonProgress {
        var body: [String: Any] = ["lessonId": lessonId]
        if let videoProgress { body["videoProgress"] = videoProgress }
        if let completed { body["completed"] = completed }
        return try await api.post("/progress", body: body)
    }
}
