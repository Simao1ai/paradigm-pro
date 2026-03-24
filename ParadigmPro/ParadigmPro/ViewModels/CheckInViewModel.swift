import Foundation

struct CalendarDay {
    let date: String
    let done: Bool
    let isToday: Bool
}

@MainActor
final class CheckInViewModel: ObservableObject {
    @Published var todayCheckIn: CheckIn?
    @Published var history: [CheckIn] = []
    @Published var step = 0 // 0=mood, 1=win, 2=challenge, 3=tomorrow
    @Published var mood: Int = 0
    @Published var wins = ""
    @Published var struggles = ""
    @Published var tomorrowPlan = ""
    @Published var isSubmitting = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let service = LessonService.shared

    var currentStreak: Int {
        todayCheckIn?.streak ?? 0
    }

    var hasCheckedInToday: Bool {
        todayCheckIn != nil
    }

    var calendarDays: [CalendarDay] {
        let today = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let todayStr = formatter.string(from: today)

        let doneDates = Set(history.compactMap { $0.checkInDate?.prefix(10).description })
        var extraDone = doneDates
        if todayCheckIn != nil {
            extraDone.insert(todayStr)
        }

        var days: [CalendarDay] = []
        for i in stride(from: 29, through: 0, by: -1) {
            guard let d = Calendar.current.date(byAdding: .day, value: -i, to: today) else { continue }
            let dateStr = formatter.string(from: d)
            days.append(CalendarDay(
                date: dateStr,
                done: extraDone.contains(dateStr),
                isToday: dateStr == todayStr
            ))
        }
        return days
    }

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
        guard !wins.trimmingCharacters(in: .whitespaces).isEmpty,
              !struggles.trimmingCharacters(in: .whitespaces).isEmpty,
              !tomorrowPlan.trimmingCharacters(in: .whitespaces).isEmpty else {
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
            // Refresh history
            history = try await service.fetchCheckInHistory()
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isSubmitting = false
    }
}
