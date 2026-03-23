import Foundation

@MainActor
final class CourseDetailViewModel: ObservableObject {
    @Published var lesson: Lesson?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let lessonService = LessonService.shared

    func fetchLesson(slug: String) async {
        isLoading = true
        errorMessage = nil

        do {
            lesson = try await lessonService.fetchLesson(slug: slug)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
