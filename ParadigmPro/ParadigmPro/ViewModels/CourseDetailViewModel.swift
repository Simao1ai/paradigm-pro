import Foundation

@MainActor
final class CourseDetailViewModel: ObservableObject {
    @Published var course: Course?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let courseService = CourseService.shared

    var weeks: [Week] {
        course?.weeks?.sorted(by: { $0.weekNumber < $1.weekNumber }) ?? []
    }

    func fetchCourseDetail(courseId: String) async {
        isLoading = true
        errorMessage = nil

        do {
            course = try await courseService.fetchCourseDetail(courseId: courseId)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
