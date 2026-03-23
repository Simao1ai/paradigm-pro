import Foundation

@MainActor
final class CoursesViewModel: ObservableObject {
    @Published var lessons: [Lesson] = []
    @Published var dashboard: DashboardData?
    @Published var completedLessonNumbers: Set<Int> = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let lessonService = LessonService.shared

    func fetchData() async {
        isLoading = true
        errorMessage = nil

        do {
            async let lessonsTask = lessonService.fetchLessons()
            async let dashboardTask = lessonService.fetchDashboard()

            let (fetchedLessons, fetchedDashboard) = try await (lessonsTask, dashboardTask)
            lessons = fetchedLessons.sorted(by: { $0.lessonNumber < $1.lessonNumber })
            dashboard = fetchedDashboard
            completedLessonNumbers = Set(fetchedDashboard.completedLessonNumbers)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func isLessonCompleted(_ lesson: Lesson) -> Bool {
        completedLessonNumbers.contains(lesson.lessonNumber)
    }
}
