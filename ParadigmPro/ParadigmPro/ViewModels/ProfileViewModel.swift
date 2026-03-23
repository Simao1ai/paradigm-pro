import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var profile: Profile?
    @Published var isLoading = false

    private let lessonService = LessonService.shared

    func fetchProfile() async {
        isLoading = true
        do {
            profile = try await lessonService.fetchProfile()
        } catch {
            #if DEBUG
            print("Profile fetch failed: \(error)")
            #endif
        }
        isLoading = false
    }
}
