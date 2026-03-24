import Foundation

@MainActor
final class CoursesViewModel: ObservableObject {
    @Published var lessons: [LessonMeta] = ALL_LESSONS
    @Published var dashboard: DashboardData?
    @Published var completedLessonNumbers: Set<Int> = []
    @Published var progressMap: [String: String] = [:] // slug -> status
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let lessonService = LessonService.shared
    private let progressService = ProgressService.shared

    func fetchData() async {
        isLoading = true
        errorMessage = nil

        do {
            async let dashboardTask = lessonService.fetchDashboard()
            async let progressTask = progressService.fetchProgress()

            let (fetchedDashboard, fetchedProgress) = try await (dashboardTask, progressTask)
            dashboard = fetchedDashboard
            completedLessonNumbers = Set(fetchedDashboard.completedLessonNumbers)

            // Build progress map: slug -> status
            var map: [String: String] = [:]
            for p in fetchedProgress {
                if let slug = p.lessonSlug {
                    map[slug] = p.status
                }
            }
            progressMap = map
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func isLessonCompleted(_ lesson: LessonMeta) -> Bool {
        completedLessonNumbers.contains(lesson.number)
    }
}
