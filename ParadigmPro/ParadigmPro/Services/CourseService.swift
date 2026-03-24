import Foundation

final class LessonService {
    static let shared = LessonService()
    private let api = APIClient.shared

    private init() {}

    // MARK: - Lessons

    func fetchLessons() async throws -> [Lesson] {
        try await api.get("/lessons")
    }

    func fetchLesson(slug: String) async throws -> Lesson {
        try await api.get("/lessons/\(slug)")
    }

    // MARK: - Dashboard & Profile

    func fetchDashboard() async throws -> DashboardData {
        try await api.get("/dashboard")
    }

    func fetchProfile() async throws -> Profile {
        try await api.get("/profile")
    }

    // MARK: - Check-Ins

    func fetchTodayCheckIn() async throws -> CheckIn? {
        // Server returns null if no check-in today; we wrap in optional decode
        do {
            let checkIn: CheckIn = try await api.get("/check-in/today")
            return checkIn
        } catch APIError.decodingError {
            return nil // Server returned null
        }
    }

    func submitCheckIn(mood: Int, wins: String, struggles: String, tomorrowPlan: String) async throws -> CheckIn {
        try await api.post("/check-in", body: [
            "mood": mood,
            "wins": wins,
            "struggles": struggles,
            "tomorrowPlan": tomorrowPlan
        ])
    }

    func fetchCheckInHistory() async throws -> [CheckIn] {
        try await api.get("/check-in/history")
    }

    // MARK: - Goals

    func fetchGoals() async throws -> [LongTermGoal] {
        try await api.get("/long-term-goals")
    }

    func createGoal(title: String, description: String?, targetDate: String?) async throws -> LongTermGoal {
        var body: [String: Any] = ["title": title]
        if let desc = description { body["description"] = desc }
        if let date = targetDate { body["targetDate"] = date }
        return try await api.post("/long-term-goals", body: body)
    }

    func updateGoal(id: String, updates: [String: Any]) async throws -> LongTermGoal {
        try await api.put("/long-term-goals/\(id)", body: updates)
    }

    func deleteGoal(id: String) async throws -> SuccessResponse {
        try await api.delete("/long-term-goals/\(id)")
    }

    // MARK: - Action Items

    func fetchActionItems(includeCompleted: Bool = false) async throws -> [ActionItem] {
        let path = includeCompleted ? "/action-items?includeCompleted=true" : "/action-items"
        return try await api.get(path)
    }

    func updateActionItem(id: String, updates: [String: Any]) async throws -> ActionItem {
        try await api.put("/action-items/\(id)", body: updates)
    }

    func deleteActionItem(id: String) async throws -> SuccessResponse {
        try await api.delete("/action-items/\(id)")
    }

    // MARK: - Notes

    func fetchNotes() async throws -> [LessonNote] {
        try await api.get("/notes")
    }

    func saveNote(lessonSlug: String, content: String) async throws -> LessonNote {
        try await api.post("/notes", body: ["lessonSlug": lessonSlug, "content": content])
    }

    // MARK: - Badges

    func fetchBadges() async throws -> BadgesResponse {
        try await api.get("/badges")
    }

    // MARK: - Notifications

    func fetchNotifications() async throws -> [AppNotification] {
        try await api.get("/notifications")
    }

    func markNotificationRead(id: String) async throws -> SuccessResponse {
        try await api.put("/notifications/\(id)/read")
    }

    // MARK: - Roadmap

    func fetchRoadmap() async throws -> [RoadmapDay] {
        try await api.get("/roadmap")
    }

    func updateRoadmapDay(dayNumber: Int, completed: Bool, reflection: String?) async throws -> SuccessResponse {
        var body: [String: Any] = ["completed": completed]
        if let r = reflection { body["reflection"] = r }
        return try await api.post("/roadmap/\(dayNumber)", body: body)
    }

    // MARK: - Community

    func fetchLeaderboard() async throws -> [LeaderboardEntry] {
        try await api.get("/community/leaderboard")
    }
}
