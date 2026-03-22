import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var enrolledCoursesCount = 0
    @Published var isLoading = false

    func setUser(_ user: User?) {
        self.user = user
    }

    func updateStats(enrolledCount: Int) {
        enrolledCoursesCount = enrolledCount
    }
}
