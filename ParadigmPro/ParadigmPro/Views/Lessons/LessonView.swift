import SwiftUI

struct LessonView: View {
    @StateObject private var viewModel: LessonViewModel

    init(lesson: Lesson) {
        _viewModel = StateObject(wrappedValue: LessonViewModel(lesson: lesson))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Lesson header card (matches web screenshot)
                lessonHeaderCard

                // Key principle card
                if let principle = viewModel.lesson.keyPrinciple, !principle.isEmpty {
                    keyPrincipleCard(principle)
                }

                // Mark complete button
                markCompleteButton

                // My Notes section
                notesSection

                // Materials
                if let assets = viewModel.lesson.assets, !assets.isEmpty {
                    materialsSection(assets)
                }

                // Error
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
            .padding(16)
        }
        .background(Color.ppBackground)
        .navigationTitle("Lesson \(viewModel.lesson.lessonNumber)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task {
            await viewModel.loadNote()
        }
    }

    // MARK: - Lesson Header Card

    private var lessonHeaderCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                // Lesson number circle
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.ppIndigo.opacity(0.3))
                        .frame(width: 44, height: 44)
                    Text("\(viewModel.lesson.lessonNumber)")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.ppIndigo)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("LESSON \(viewModel.lesson.lessonNumber)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.ppOrange)
                        .tracking(1)

                    Text(viewModel.lesson.title)
                        .font(.title3.bold())
                        .foregroundColor(.ppTextPrimary)
                }
            }

            if let subtitle = viewModel.lesson.subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(.ppTextSecondary)
            }

            // Description
            if let desc = viewModel.lesson.description, !desc.isEmpty {
                Text(desc)
                    .font(.subheadline)
                    .foregroundColor(.ppTextSecondary)
                    .lineSpacing(4)
            }

            // Duration
            if let minutes = viewModel.lesson.estimatedMinutes {
                HStack(spacing: 4) {
                    Image(systemName: "book.fill")
                        .font(.system(size: 10))
                    Text("\(minutes) min")
                }
                .font(.caption)
                .foregroundColor(.ppTextMuted)
            }
        }
        .padding(20)
        .cardStyle()
    }

    // MARK: - Key Principle

    private func keyPrincipleCard(_ principle: String) -> some View {
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

            Text("\u{201C}\(principle)\u{201D}")
                .font(.subheadline.italic())
                .foregroundColor(.ppTextPrimary)
                .lineSpacing(3)
        }
        .padding(20)
        .cardStyle()
    }

    // MARK: - Mark Complete Button

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

    // MARK: - My Notes Section

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
        }
        .padding(20)
        .cardStyle()
    }

    // MARK: - Materials

    private func materialsSection(_ assets: [LessonAsset]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Materials")
                .font(.headline)
                .foregroundColor(.ppTextPrimary)

            VStack(spacing: 0) {
                ForEach(assets) { asset in
                    assetRow(asset)
                    if asset.id != assets.last?.id {
                        Rectangle()
                            .fill(Color.ppBorder.opacity(0.3))
                            .frame(height: 1)
                            .padding(.leading, 48)
                    }
                }
            }
            .cardStyle()
        }
    }

    private func assetRow(_ asset: LessonAsset) -> some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.ppOrange.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: iconFor(asset.assetType))
                    .font(.body)
                    .foregroundColor(.ppOrange)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(asset.label)
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.ppTextPrimary)
                Text(asset.assetType.uppercased())
                    .font(.caption2.weight(.bold))
                    .foregroundColor(.ppTextMuted)
            }

            Spacer()

            Image(systemName: "arrow.down.circle.fill")
                .font(.title3)
                .foregroundColor(.ppOrange)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func iconFor(_ type: String) -> String {
        switch type.lowercased() {
        case "pdf": return "doc.fill"
        case "audio": return "headphones"
        case "worksheet": return "doc.text.fill"
        default: return "doc.fill"
        }
    }
}

// MARK: - Lesson Detail Loader (loads by slug from Dashboard navigation)

struct LessonDetailLoader: View {
    let slug: String
    @State private var lesson: Lesson?
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        ZStack {
            Color.ppBackground.ignoresSafeArea()

            if isLoading {
                LoadingView()
            } else if let lesson = lesson {
                LessonView(lesson: lesson)
            } else if let error = error {
                ErrorView(message: error) {
                    Task { await loadLesson() }
                }
            }
        }
        .task { await loadLesson() }
    }

    private func loadLesson() async {
        isLoading = true
        do {
            lesson = try await LessonService.shared.fetchLesson(slug: slug)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
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
