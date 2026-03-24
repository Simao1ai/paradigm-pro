import SwiftUI

// MARK: - LessonMetaView (uses hardcoded LessonMeta data + progress API)

struct LessonMetaView: View {
    let lessonMeta: LessonMeta
    @StateObject private var viewModel: LessonMetaViewModel

    init(lessonMeta: LessonMeta) {
        self.lessonMeta = lessonMeta
        _viewModel = StateObject(wrappedValue: LessonMetaViewModel(lessonMeta: lessonMeta))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                lessonHeaderCard
                keyPrincipleCard
                markCompleteButton
                notesSection
            }
            .padding(16)
        }
        .background(Color.ppBackground)
        .navigationTitle("Lesson \(lessonMeta.number)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task {
            await viewModel.loadNote()
        }
    }

    // MARK: - Header Card

    private var lessonHeaderCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.ppIndigo.opacity(0.3))
                        .frame(width: 44, height: 44)
                    Text("\(lessonMeta.number)")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.ppIndigo)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("LESSON \(lessonMeta.number)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.ppOrange)
                        .tracking(1)
                    Text(lessonMeta.title)
                        .font(.title3.bold())
                        .foregroundColor(.ppTextPrimary)
                }
            }

            Text(lessonMeta.subtitle)
                .font(.subheadline)
                .foregroundColor(.ppTextSecondary)

            Text(lessonMeta.description)
                .font(.subheadline)
                .foregroundColor(.ppTextSecondary)
                .lineSpacing(4)

            HStack(spacing: 12) {
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.system(size: 10))
                    Text("\(lessonMeta.estimatedMinutes) min")
                }
                .font(.caption)
                .foregroundColor(.ppTextMuted)

                if lessonMeta.hasAudio {
                    HStack(spacing: 4) {
                        Image(systemName: "headphones")
                            .font(.system(size: 10))
                        Text("Audio")
                    }
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.ppPink.opacity(0.15))
                    .foregroundColor(.ppPink)
                    .cornerRadius(8)
                }
            }
        }
        .padding(20)
        .cardStyle()
    }

    // MARK: - Key Principle

    private var keyPrincipleCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: "lightbulb.fill")
                    .font(.caption)
                    .foregroundColor(.ppOrange)
                Text("KEY PRINCIPLE")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.ppOrange)
                    .tracking(1)
            }

            Text("\u{201C}\(lessonMeta.keyPrinciple)\u{201D}")
                .font(.subheadline.italic())
                .foregroundColor(.ppTextPrimary)
                .lineSpacing(3)
        }
        .padding(20)
        .cardStyle()
    }

    // MARK: - Mark Complete

    private var markCompleteButton: some View {
        Button(action: {
            Task { await viewModel.toggleCompletion() }
        }) {
            HStack(spacing: 8) {
                Image(systemName: viewModel.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.body)
                Text(viewModel.isCompleted ? "Lesson Completed" : "Mark Lesson Complete")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .buttonStyle(viewModel.isCompleted
            ? AnyButtonStyle(SecondaryButtonStyle())
            : AnyButtonStyle(PrimaryButtonStyle()))
    }

    // MARK: - Notes

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "book.fill")
                    .foregroundColor(.ppTextPrimary)
                Text("My Notes")
                    .font(.headline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)
            }

            TextField("Write your notes, insights, and reflections for this lesson...", text: $viewModel.noteContent, axis: .vertical)
                .lineLimit(5...10)
                .darkInputStyle()

            HStack {
                Spacer()
                Button {
                    Task { await viewModel.saveNote() }
                } label: {
                    HStack(spacing: 6) {
                        if viewModel.isSavingNote {
                            ProgressView().tint(.white)
                        } else {
                            Image(systemName: "square.and.arrow.down")
                                .font(.caption)
                        }
                        Text("Save Notes")
                            .fontWeight(.semibold)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                }
                .buttonStyle(PrimaryButtonStyle(isLoading: viewModel.isSavingNote))
                .disabled(viewModel.isSavingNote)
            }

            if viewModel.noteSaved {
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.ppSuccess)
                    Text("Notes saved")
                        .foregroundColor(.ppSuccess)
                }
                .font(.caption)
                .transition(.opacity)
            }

            if let error = viewModel.errorMessage {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.circle.fill")
                    Text(error)
                }
                .font(.caption)
                .foregroundColor(.ppError)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.ppError.opacity(0.1))
                .cornerRadius(12)
            }
        }
        .padding(20)
        .cardStyle()
    }
}

// MARK: - LessonMetaViewModel

@MainActor
final class LessonMetaViewModel: ObservableObject {
    let lessonMeta: LessonMeta
    @Published var isCompleted = false
    @Published var errorMessage: String?
    @Published var noteContent = ""
    @Published var isSavingNote = false
    @Published var noteSaved = false

    private let progressService = ProgressService.shared
    private let lessonService = LessonService.shared

    init(lessonMeta: LessonMeta) {
        self.lessonMeta = lessonMeta
    }

    func toggleCompletion() async {
        let newStatus = isCompleted ? "not_started" : "completed"

        do {
            _ = try await progressService.updateProgressBySlug(
                lessonSlug: lessonMeta.slug,
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
        // Load progress status
        do {
            let allProgress = try await progressService.fetchProgress()
            if let p = allProgress.first(where: { $0.lessonSlug == lessonMeta.slug }) {
                isCompleted = p.isCompleted
            }
        } catch {
            #if DEBUG
            print("Failed to load progress: \(error)")
            #endif
        }

        // Load notes
        do {
            let notes = try await lessonService.fetchNotes()
            if let note = notes.first(where: { $0.lessonSlug == lessonMeta.slug }) {
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
            _ = try await lessonService.saveNote(lessonSlug: lessonMeta.slug, content: noteContent)
            noteSaved = true
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
}

// MARK: - LessonDetailLoader (loads by slug from Dashboard navigation)

struct LessonDetailLoader: View {
    let slug: String

    var body: some View {
        if let meta = ALL_LESSONS.first(where: { $0.slug == slug }) {
            LessonMetaView(lessonMeta: meta)
        } else {
            ErrorView(message: "Lesson not found") {}
        }
    }
}

// Type-erased button style wrapper
struct AnyButtonStyle: ButtonStyle {
    private let _makeBody: (Configuration) -> AnyView

    init<S: ButtonStyle>(_ style: S) {
        _makeBody = { config in AnyView(style.makeBody(configuration: config)) }
    }

    func makeBody(configuration: Configuration) -> some View {
        _makeBody(configuration)
    }
}
