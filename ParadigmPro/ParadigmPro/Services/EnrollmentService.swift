import Foundation

struct OkResponse: Codable {
    let ok: Bool
}

final class EnrollmentService {
    static let shared = EnrollmentService()
    private let api = APIClient.shared

    private init() {}

    func enroll(courseId: String) async throws -> Enrollment {
        try await api.post("/enrollments", body: ["courseId": courseId])
    }

    func unenroll(courseId: String) async throws {
        let _: OkResponse = try await api.delete("/enrollments", body: ["courseId": courseId])
    }
}
