import Foundation

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var dashboard: DashboardData?
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
            async let checkInTask = service.fetchTodayCheckIn()
            async let notifTask = service.fetchNotifications()

            let (dash, checkIn, notifs) = try await (dashTask, checkInTask, notifTask)
            dashboard = dash
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
