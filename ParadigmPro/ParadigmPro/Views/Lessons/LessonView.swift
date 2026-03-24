import SwiftUI

struct LessonView: View {
    @StateObject private var viewModel: LessonViewModel

    init(lesson: Lesson) {
        _viewModel = StateObject(wrappedValue: LessonViewModel(lesson: lesson))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Lesson number + metadata badges
                HStack(spacing: 10) {
                    Text("Lesson \(viewModel.lesson.lessonNumber)")
                        .font(.caption.weight(.bold))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(PPGradient.cta)
                        .foregroundColor(.white)
                        .cornerRadius(12)

                    if let minutes = viewModel.lesson.estimatedMinutes {
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.system(size: 10))
                            Text("\(minutes) min")
                        }
                        .font(.caption)
                        .foregroundColor(.ppTextSecondary)
                    }

                    if viewModel.lesson.hasAudio == true {
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

                // Title
                Text(viewModel.lesson.title)
                    .font(.title2.bold())
                    .foregroundColor(.ppTextPrimary)

                if let subtitle = viewModel.lesson.subtitle, !subtitle.isEmpty {
                    Text(subtitle)
                        .font(.body)
                        .foregroundColor(.ppTextSecondary)
                }

                // Key principle card
                if let principle = viewModel.lesson.keyPrinciple, !principle.isEmpty {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "lightbulb.fill")
                            .font(.title3)
                            .foregroundColor(.ppOrange)
                            .padding(.top, 2)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Key Principle")
                                .font(.caption.weight(.bold))
                                .foregroundColor(.ppOrange)
                            Text(principle)
                                .font(.subheadline)
                                .foregroundColor(.ppTextPrimary)
                        }
                    }
                    .padding(20)
                    .cardStyle()
                }

                // Description
                if let desc = viewModel.lesson.description, !desc.isEmpty {
                    Text(desc)
                        .font(.subheadline)
                        .foregroundColor(.ppTextSecondary)
                        .lineSpacing(4)
                        .padding(20)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                }

                // Assets
                if let assets = viewModel.lesson.assets, !assets.isEmpty {
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

                // Mark complete button
                Button(action: {
                    Task { await viewModel.toggleCompletion() }
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: viewModel.isCompleted ? "checkmark.circle.fill" : "circle")
                            .font(.body)
                        Text(viewModel.isCompleted ? "Completed" : "Mark as Complete")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(viewModel.isCompleted
                    ? AnyButtonStyle(SecondaryButtonStyle())
                    : AnyButtonStyle(PrimaryButtonStyle()))

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
