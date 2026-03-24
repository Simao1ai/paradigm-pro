import Foundation

@MainActor
final class LessonViewModel: ObservableObject {
    @Published var lesson: Lesson
    @Published var progress: LessonProgress?
    @Published var isCompleted = false
    @Published var errorMessage: String?

    // Notes
    @Published var noteContent = ""
    @Published var isSavingNote = false
    @Published var noteSaved = false

    private let progressService = ProgressService.shared
    private let lessonService = LessonService.shared

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

    func loadNote() async {
        do {
            let notes = try await lessonService.fetchNotes()
            if let note = notes.first(where: { $0.lessonSlug == lesson.slug || $0.lessonId == lesson.id }) {
                noteContent = note.content
            }
        } catch {
            #if DEBUG
            print("Failed to load note: \(error)")
            #endif
        }
    }

    func saveNote() async {
        isSavingNote = true
        noteSaved = false

        do {
            _ = try await lessonService.saveNote(lessonSlug: lesson.slug, content: noteContent)
            noteSaved = true
            // Auto-hide success after 3 seconds
            Task {
                try? await Task.sleep(nanoseconds: 3_000_000_000)
                noteSaved = false
            }
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isSavingNote = false
    }

    func saveAudioProgress(seconds: Int) async {
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
