import Foundation
import Combine

@MainActor
final class LessonViewModel: ObservableObject {
    @Published var lesson: Lesson
    @Published var progress: LessonProgress?
    @Published var isCompleted = false
    @Published var errorMessage: String?

    private let progressService = ProgressService.shared
    private var autoSaveTimer: Timer?

    init(lesson: Lesson) {
        self.lesson = lesson
    }

    func toggleCompletion() async {
        let newCompleted = !isCompleted

        do {
            progress = try await progressService.updateProgress(
                lessonId: lesson.id,
                completed: newCompleted
            )
            isCompleted = newCompleted
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveVideoProgress(seconds: Int) async {
        do {
            progress = try await progressService.updateProgress(
                lessonId: lesson.id,
                videoProgress: seconds
            )

            // Auto-complete at 90% threshold
            if let duration = lesson.videoDuration, duration > 0 {
                let threshold = Double(duration) * Constants.videoAutoCompleteThreshold
                if Double(seconds) >= threshold && !isCompleted {
                    progress = try await progressService.updateProgress(
                        lessonId: lesson.id,
                        completed: true
                    )
                    isCompleted = true
                }
            }
        } catch {
            // Silently fail for auto-save (non-critical)
            #if DEBUG
            print("Video progress save failed: \(error)")
            #endif
        }
    }

    var resumeFromSeconds: Int {
        progress?.videoProgress ?? 0
    }
}
