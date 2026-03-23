import SwiftUI

struct LessonView: View {
    @StateObject private var viewModel: LessonViewModel

    init(lesson: Lesson) {
        _viewModel = StateObject(wrappedValue: LessonViewModel(lesson: lesson))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Lesson header
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Text("Lesson \(viewModel.lesson.lessonNumber)")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.ppOrange.opacity(0.15))
                            .foregroundColor(.ppOrange)
                            .cornerRadius(6)

                        if let minutes = viewModel.lesson.estimatedMinutes {
                            Text("\(minutes) min")
                                .font(.caption)
                                .foregroundColor(.ppTextMuted)
                        }

                        if viewModel.lesson.hasAudio == true {
                            Label("Audio", systemImage: "headphones")
                                .font(.caption)
                                .foregroundColor(.ppTextMuted)
                        }
                    }

                    Text(viewModel.lesson.title)
                        .font(.title3.bold())
                        .foregroundColor(.ppTextPrimary)

                    if let subtitle = viewModel.lesson.subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.subheadline)
                            .foregroundColor(.ppTextSecondary)
                    }
                }

                // Key principle
                if let principle = viewModel.lesson.keyPrinciple, !principle.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Key Principle")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.ppOrange)
                        Text(principle)
                            .font(.subheadline)
                            .foregroundColor(.ppTextSecondary)
                    }
                    .padding(16)
                    .cardStyle()
                }

                // Description
                if let desc = viewModel.lesson.description, !desc.isEmpty {
                    Text(desc)
                        .font(.subheadline)
                        .foregroundColor(.ppTextSecondary)
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                }

                // Assets (PDFs, worksheets, audio)
                if let assets = viewModel.lesson.assets, !assets.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Materials")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.ppTextPrimary)

                        VStack(spacing: 0) {
                            ForEach(assets) { asset in
                                assetRow(asset)
                                if asset.id != assets.last?.id {
                                    Rectangle()
                                        .fill(Color.ppBorder)
                                        .frame(height: 1)
                                }
                            }
                        }
                        .cardStyle()
                    }
                }

                // Mark complete
                Button(action: {
                    Task { await viewModel.toggleCompletion() }
                }) {
                    HStack {
                        Image(systemName: viewModel.isCompleted
                              ? "checkmark.circle.fill"
                              : "circle")
                        Text(viewModel.isCompleted ? "Completed" : "Mark Complete")
                            .fontWeight(.medium)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(viewModel.isCompleted
                                ? Color.ppSuccess.opacity(0.15)
                                : Color.ppOrange.opacity(0.15))
                    .foregroundColor(viewModel.isCompleted ? .ppSuccess : .ppOrange)
                    .cornerRadius(10)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(viewModel.isCompleted ? Color.ppSuccess.opacity(0.3) : Color.ppOrange.opacity(0.3), lineWidth: 1)
                    )
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
                    .cornerRadius(8)
                }
            }
            .padding()
        }
        .background(Color.ppBackground)
        .navigationTitle("Lesson \(viewModel.lesson.lessonNumber)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    private func assetRow(_ asset: LessonAsset) -> some View {
        HStack(spacing: 12) {
            Image(systemName: iconFor(asset.assetType))
                .font(.body)
                .foregroundColor(.ppOrange)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(asset.label)
                    .font(.subheadline)
                    .foregroundColor(.ppTextPrimary)

                Text(asset.assetType.uppercased())
                    .font(.caption2.weight(.medium))
                    .foregroundColor(.ppTextMuted)
            }

            Spacer()

            Image(systemName: "arrow.down.circle")
                .foregroundColor(.ppTextMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
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
