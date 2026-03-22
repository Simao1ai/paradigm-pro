import SwiftUI

struct LessonView: View {
    @StateObject private var viewModel: LessonViewModel

    init(lesson: Lesson) {
        _viewModel = StateObject(wrappedValue: LessonViewModel(lesson: lesson))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Video player - matches web: aspect-video bg-black rounded
                if viewModel.lesson.lessonType == .video, let videoUrl = viewModel.lesson.videoUrl {
                    VideoPlayerView(
                        url: videoUrl,
                        resumeFrom: viewModel.resumeFromSeconds,
                        onProgressUpdate: { seconds in
                            Task { await viewModel.saveVideoProgress(seconds: seconds) }
                        }
                    )
                    .frame(height: 220)
                    .background(Color.black)
                    .cornerRadius(12)
                }

                // Lesson type badge + title
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Text(viewModel.lesson.lessonType.rawValue.capitalized)
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(badgeBackground(viewModel.lesson.lessonType))
                            .foregroundColor(badgeForeground(viewModel.lesson.lessonType))
                            .cornerRadius(4)

                        if let duration = viewModel.lesson.videoDuration {
                            Text(duration.formattedDuration)
                                .font(.caption)
                                .foregroundColor(.gray500)
                        }
                    }

                    Text(viewModel.lesson.title)
                        .font(.title3.bold())
                        .foregroundColor(.gray900)
                }

                // Content
                if let content = viewModel.lesson.content, !content.isEmpty {
                    Text(content)
                        .font(.subheadline)
                        .foregroundColor(.gray700)
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                }

                // Materials section
                if let materials = viewModel.lesson.materials, !materials.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Materials")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.gray900)

                        VStack(spacing: 0) {
                            ForEach(materials) { material in
                                MaterialRowView(material: material)
                                if material.id != materials.last?.id {
                                    Divider()
                                }
                            }
                        }
                        .cardStyle()
                    }
                }

                // Mark complete button - matches web MarkCompleteButton
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
                    .padding(.vertical, 12)
                    .background(viewModel.isCompleted
                                ? Color.statusGreen100
                                : Color.brand50)
                    .foregroundColor(viewModel.isCompleted ? .statusGreen700 : .brand600)
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(viewModel.isCompleted ? Color.statusGreen700.opacity(0.3) : Color.brand600.opacity(0.3), lineWidth: 1)
                    )
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.statusRed600)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.statusRed50)
                        .cornerRadius(8)
                }
            }
            .padding()
        }
        .background(Color.paradigmBackground)
        .navigationTitle("Lesson")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func badgeBackground(_ type: LessonType) -> Color {
        switch type {
        case .video: return .statusBlue100
        case .reading: return .statusGreen100
        case .assignment: return .statusOrange100
        }
    }

    private func badgeForeground(_ type: LessonType) -> Color {
        switch type {
        case .video: return .statusBlue700
        case .reading: return .statusGreen700
        case .assignment: return .statusOrange700
        }
    }
}
