import Foundation

@MainActor
final class CheckInViewModel: ObservableObject {
    @Published var todayCheckIn: CheckIn?
    @Published var history: [CheckIn] = []
    @Published var mood: Int = 3
    @Published var wins = ""
    @Published var struggles = ""
    @Published var tomorrowPlan = ""
    @Published var isSubmitting = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showSuccess = false

    private let service = LessonService.shared

    func fetchData() async {
        isLoading = true
        errorMessage = nil

        do {
            async let checkInTask = service.fetchTodayCheckIn()
            async let historyTask = service.fetchCheckInHistory()

            let (checkIn, hist) = try await (checkInTask, historyTask)
            todayCheckIn = checkIn
            history = hist
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func submitCheckIn() async {
        guard !wins.isEmpty, !struggles.isEmpty, !tomorrowPlan.isEmpty else {
            errorMessage = "Please fill in all fields"
            return
        }

        isSubmitting = true
        errorMessage = nil

        do {
            let result = try await service.submitCheckIn(
                mood: mood,
                wins: wins,
                struggles: struggles,
                tomorrowPlan: tomorrowPlan
            )
            todayCheckIn = result
            showSuccess = true
            // Refresh history
            history = try await service.fetchCheckInHistory()
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isSubmitting = false
    }

    var hasCheckedInToday: Bool {
        todayCheckIn != nil
    }
}
