import SwiftUI

struct CourseListView: View {
    @StateObject private var viewModel = CoursesViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if viewModel.isLoading && viewModel.dashboard == nil {
                    LoadingView()
                } else if let error = viewModel.errorMessage, viewModel.dashboard == nil {
                    ErrorView(message: error) {
                        Task { await viewModel.fetchData() }
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Header
                            VStack(alignment: .leading, spacing: 4) {
                                Text("My Lessons")
                                    .font(.title2.bold())
                                    .foregroundColor(.ppTextPrimary)

                                let completed = viewModel.completedLessonNumbers.count
                                Text("\(completed) of 12 lessons completed")
                                    .font(.subheadline)
                                    .foregroundColor(.ppTextSecondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)

                            // Overall progress bar
                            if let dash = viewModel.dashboard {
                                VStack(spacing: 8) {
                                    HStack {
                                        Text("Overall Progress")
                                            .font(.subheadline.weight(.medium))
                                            .foregroundColor(.ppTextPrimary)
                                        Spacer()
                                        Text("\(dash.progressPercent)%")
                                            .font(.subheadline)
                                            .foregroundColor(.ppOrange)
                                    }

                                    GeometryReader { geo in
                                        ZStack(alignment: .leading) {
                                            RoundedRectangle(cornerRadius: 4)
                                                .fill(Color.ppBackground)
                                                .frame(height: 8)
                                            RoundedRectangle(cornerRadius: 4)
                                                .fill(PPGradient.gold)
                                                .frame(width: max(0, geo.size.width * CGFloat(dash.progressPercent) / 100), height: 8)
                                        }
                                    }
                                    .frame(height: 8)
                                }
                                .padding(16)
                                .cardStyle()
                            }

                            // Lesson cards grid
                            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                                ForEach(viewModel.lessons) { lesson in
                                    NavigationLink(value: lesson) {
                                        lessonCard(lesson)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    .refreshable {
                        await viewModel.fetchData()
                    }
                }
            }
            .navigationTitle("My Lessons")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .navigationDestination(for: LessonMeta.self) { lesson in
                LessonMetaView(lessonMeta: lesson)
            }
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    // MARK: - Lesson Card

    private func lessonCard(_ lesson: LessonMeta) -> some View {
        let isCompleted = viewModel.isLessonCompleted(lesson)
        let isInProgress = viewModel.progressMap[lesson.slug] == "in_progress"

        return VStack(alignment: .leading, spacing: 10) {
            // Top: number + status
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(isCompleted ? Color.ppOrange.opacity(0.2) :
                              isInProgress ? Color.ppIconBlue.opacity(0.2) :
                              Color.ppSurfaceLight)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(isCompleted ? Color.ppOrange.opacity(0.4) :
                                        isInProgress ? Color.ppIconBlue.opacity(0.4) :
                                        Color.ppBorder.opacity(0.5), lineWidth: 1)
                        )
                        .frame(width: 36, height: 36)

                    if isCompleted {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.subheadline)
                            .foregroundColor(.ppOrange)
                    } else {
                        Text("\(lesson.number)")
                            .font(.caption.weight(.bold))
                            .foregroundColor(isInProgress ? .ppIconBlue : .ppTextMuted)
                    }
                }

                Spacer()

                Text(isCompleted ? "Complete" :
                     isInProgress ? "In Progress" :
                     "Not started")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(isCompleted ? .ppOrange :
                                    isInProgress ? .ppIconBlue :
                                    .ppTextMuted)
            }

            // Title
            Text(lesson.title)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.ppTextPrimary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            // Subtitle
            Text(lesson.subtitle)
                .font(.caption)
                .foregroundColor(.ppTextMuted)
                .lineLimit(2)

            Spacer(minLength: 0)

            // Bottom: time + audio + PDF
            HStack(spacing: 10) {
                HStack(spacing: 3) {
                    Image(systemName: "clock")
                        .font(.system(size: 9))
                    Text("\(lesson.estimatedMinutes) min")
                }
                .font(.caption2)
                .foregroundColor(.ppTextMuted)

                if lesson.hasAudio {
                    HStack(spacing: 3) {
                        Image(systemName: "play.circle")
                            .font(.system(size: 9))
                        Text("Audio")
                    }
                    .font(.caption2)
                    .foregroundColor(.ppOrange.opacity(0.6))
                }

                HStack(spacing: 3) {
                    Image(systemName: "doc")
                        .font(.system(size: 9))
                    Text("PDF")
                }
                .font(.caption2)
                .foregroundColor(.ppTextMuted)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            isCompleted ? Color.ppOrange.opacity(0.03) :
            isInProgress ? Color.ppIconBlue.opacity(0.03) :
            Color.clear
        )
        .cardStyle()
    }
}
