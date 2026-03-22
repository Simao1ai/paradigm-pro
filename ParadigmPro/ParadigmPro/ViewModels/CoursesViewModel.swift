import Foundation

@MainActor
final class CoursesViewModel: ObservableObject {
    @Published var courses: [Course] = []
    @Published var enrolledCourseIds: Set<String> = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let courseService = CourseService.shared
    private let enrollmentService = EnrollmentService.shared

    var enrolledCourses: [Course] {
        courses.filter { enrolledCourseIds.contains($0.id) }
    }

    var availableCourses: [Course] {
        courses.filter { $0.published && !enrolledCourseIds.contains($0.id) }
    }

    func fetchCourses() async {
        isLoading = true
        errorMessage = nil

        do {
            courses = try await courseService.fetchCourses()
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func enroll(courseId: String) async {
        do {
            _ = try await enrollmentService.enroll(courseId: courseId)
            enrolledCourseIds.insert(courseId)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func unenroll(courseId: String) async {
        do {
            try await enrollmentService.unenroll(courseId: courseId)
            enrolledCourseIds.remove(courseId)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
