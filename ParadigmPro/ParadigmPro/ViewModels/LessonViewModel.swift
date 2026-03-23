import Foundation

@MainActor
final class LessonViewModel: ObservableObject {
    @Published var lesson: Lesson
    @Published var progress: LessonProgress?
    @Published var isCompleted = false
    @Published var errorMessage: String?

    private let progressService = ProgressService.shared

    init(lesson: Lesson) {
        self.lesson = lesson
    }

    func toggleCompletion() async {
        let newStatus = isCompleted ? "in_progress" : "completed"

        do {
            progress = try await progressService.updateProgress(
                lessonId: lesson.id,
                status: newStatus
            )
            isCompleted = !isCompleted
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveAudioProgress(seconds: Int) async {
        // Audio progress tracking uses the same progress endpoint
        do {
            progress = try await progressService.updateProgress(
                lessonId: lesson.id,
                status: "in_progress"
            )
        } catch {
            #if DEBUG
            print("Audio progress save failed: \(error)")
            #endif
        }
    }

    var resumeFromSeconds: Int {
        progress?.audioPositionSecs ?? 0
    }
}
