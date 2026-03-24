import Foundation

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var dashboard: DashboardData?
    @Published var lessons: [Lesson] = []
    @Published var todayCheckIn: CheckIn?
    @Published var notifications: [AppNotification] = []
    @Published var unreadCount = 0
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let service = LessonService.shared

    func fetchData() async {
        isLoading = true
        errorMessage = nil

        do {
            async let dashTask = service.fetchDashboard()
            async let lessonsTask = service.fetchLessons()
            async let checkInTask = service.fetchTodayCheckIn()
            async let notifTask = service.fetchNotifications()

            let (dash, fetchedLessons, checkIn, notifs) = try await (dashTask, lessonsTask, checkInTask, notifTask)
            dashboard = dash
            lessons = fetchedLessons.sorted { $0.lessonNumber < $1.lessonNumber }
            todayCheckIn = checkIn
            notifications = notifs
            unreadCount = notifs.filter { $0.read != true }.count
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
