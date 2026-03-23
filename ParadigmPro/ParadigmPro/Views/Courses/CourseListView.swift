import SwiftUI

struct CourseListView: View {
    @StateObject private var viewModel = CoursesViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if viewModel.isLoading && viewModel.lessons.isEmpty {
                    LoadingView()
                } else if let error = viewModel.errorMessage, viewModel.lessons.isEmpty {
                    ErrorView(message: error) {
                        Task { await viewModel.fetchData() }
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Dashboard summary
                            if let dash = viewModel.dashboard {
                                dashboardCard(dash)
                            }

                            // Affirmation
                            if let aff = viewModel.dashboard?.affirmation {
                                VStack(spacing: 6) {
                                    Text("\"\(aff.content)\"")
                                        .font(.subheadline.italic())
                                        .foregroundColor(.ppTextSecondary)
                                        .multilineTextAlignment(.center)
                                    Text("— \(aff.author ?? "Bob Proctor")")
                                        .font(.caption)
                                        .foregroundColor(.ppTextMuted)
                                }
                                .padding(16)
                                .cardStyle()
                            }

                            // Section header
                            HStack {
                                Text("The 12-Lesson System")
                                    .font(.headline)
                                    .foregroundColor(.ppTextPrimary)
                                Spacer()
                            }

                            // Lesson cards
                            ForEach(viewModel.lessons) { lesson in
                                NavigationLink(value: lesson) {
                                    lessonRow(lesson)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                    .refreshable {
                        await viewModel.fetchData()
                    }
                }
            }
            .navigationTitle("Paradigm Pro")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .navigationDestination(for: Lesson.self) { lesson in
                LessonView(lesson: lesson)
            }
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    private func dashboardCard(_ dash: DashboardData) -> some View {
        HStack(spacing: 20) {
            ProgressRing(progress: Double(dash.progressPercent) / 100.0, size: 56)

            VStack(alignment: .leading, spacing: 6) {
                Text("\(dash.lessonsCompleted)/12 Lessons")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)

                HStack(spacing: 12) {
                    Label("\(dash.currentStreak) streak", systemImage: "flame.fill")
                        .foregroundColor(.ppOrange)
                    Label("\(dash.badgeCount) badges", systemImage: "star.fill")
                        .foregroundColor(.ppIconYellow)
                }
                .font(.caption)
            }

            Spacer()
        }
        .padding(16)
        .cardStyle()
    }

    private func lessonRow(_ lesson: Lesson) -> some View {
        HStack(spacing: 14) {
            // Numbered circle
            ZStack {
                Circle()
                    .fill(viewModel.isLessonCompleted(lesson) ? Color.ppSuccess : Color.ppOrange)
                    .frame(width: 36, height: 36)

                if viewModel.isLessonCompleted(lesson) {
                    Image(systemName: "checkmark")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.white)
                } else {
                    Text("\(lesson.lessonNumber)")
                        .font(.subheadline.weight(.bold))
                        .foregroundColor(.white)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(lesson.title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)

                HStack(spacing: 8) {
                    if let subtitle = lesson.subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.ppTextSecondary)
                            .lineLimit(1)
                    }

                    if let minutes = lesson.estimatedMinutes {
                        Text("\(minutes) min")
                            .font(.caption)
                            .foregroundColor(.ppTextMuted)
                    }

                    if lesson.hasAudio == true {
                        Label("Audio", systemImage: "headphones")
                            .font(.caption)
                            .foregroundColor(.ppTextMuted)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundColor(.ppTextMuted)
        }
        .padding(14)
        .cardStyle()
    }
}
