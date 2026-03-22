import SwiftUI

struct LessonView: View {
    @StateObject private var viewModel: LessonViewModel

    init(lesson: Lesson) {
        _viewModel = StateObject(wrappedValue: LessonViewModel(lesson: lesson))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Video player for video lessons
                if viewModel.lesson.lessonType == .video, let videoUrl = viewModel.lesson.videoUrl {
                    VideoPlayerView(
                        url: videoUrl,
                        resumeFrom: viewModel.resumeFromSeconds,
                        onProgressUpdate: { seconds in
                            Task { await viewModel.saveVideoProgress(seconds: seconds) }
                        }
                    )
                    .frame(height: 220)
                    .cornerRadius(12)
                }

                // Lesson title & type
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(viewModel.lesson.lessonType.rawValue.capitalized)
                            .font(.caption.bold())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.paradigmBlue.opacity(0.1))
                            .foregroundColor(.paradigmBlue)
                            .cornerRadius(4)

                        if let duration = viewModel.lesson.videoDuration {
                            Text(duration.formattedDuration)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    Text(viewModel.lesson.title)
                        .font(.title2.bold())
                }

                // Content for reading/assignment lessons
                if let content = viewModel.lesson.content, !content.isEmpty {
                    Text(content)
                        .font(.body)
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                }

                // Materials
                if let materials = viewModel.lesson.materials, !materials.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Materials")
                            .font(.headline)

                        ForEach(materials) { material in
                            MaterialRowView(material: material)
                        }
                    }
                }

                // Mark complete button
                Button(action: {
                    Task { await viewModel.toggleCompletion() }
                }) {
                    HStack {
                        Image(systemName: viewModel.isCompleted
                              ? "checkmark.circle.fill"
                              : "circle")
                        Text(viewModel.isCompleted ? "Completed" : "Mark Complete")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(viewModel.isCompleted
                                ? Color.paradigmGreen.opacity(0.1)
                                : Color.paradigmBlue.opacity(0.1))
                    .foregroundColor(viewModel.isCompleted ? .paradigmGreen : .paradigmBlue)
                    .cornerRadius(12)
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
            .padding()
        }
        .background(Color.paradigmBackground)
        .navigationTitle("Lesson")
        .navigationBarTitleDisplayMode(.inline)
    }
}
