import SwiftUI

struct LessonView: View {
    @StateObject private var viewModel: LessonViewModel

    init(lesson: Lesson) {
        _viewModel = StateObject(wrappedValue: LessonViewModel(lesson: lesson))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Video player
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
                            .padding(.vertical, 4)
                            .background(Color.ppOrange.opacity(0.15))
                            .foregroundColor(.ppOrange)
                            .cornerRadius(6)

                        if let duration = viewModel.lesson.videoDuration {
                            Text(duration.formattedDuration)
                                .font(.caption)
                                .foregroundColor(.ppTextMuted)
                        }
                    }

                    Text(viewModel.lesson.title)
                        .font(.title3.bold())
                        .foregroundColor(.ppTextPrimary)
                }

                // Content
                if let content = viewModel.lesson.content, !content.isEmpty {
                    Text(content)
                        .font(.subheadline)
                        .foregroundColor(.ppTextSecondary)
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                }

                // Materials
                if let materials = viewModel.lesson.materials, !materials.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Materials")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.ppTextPrimary)

                        VStack(spacing: 0) {
                            ForEach(materials) { material in
                                MaterialRowView(material: material)
                                if material.id != materials.last?.id {
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
        .navigationTitle("Lesson")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}
