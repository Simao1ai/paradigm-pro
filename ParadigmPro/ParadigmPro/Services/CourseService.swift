import Foundation

final class CourseService {
    static let shared = CourseService()
    private let api = APIClient.shared

    private init() {}

    func fetchCourses() async throws -> [Course] {
        try await api.get("/courses")
    }

    func fetchCourseDetail(courseId: String) async throws -> Course {
        try await api.get("/courses/\(courseId)")
    }
}
