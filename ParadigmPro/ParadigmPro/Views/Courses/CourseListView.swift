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
                        VStack(spacing: 20) {
                            // Dashboard stats row
                            if let dash = viewModel.dashboard {
                                statsRow(dash)
                            }

                            // Daily affirmation
                            if let aff = viewModel.dashboard?.affirmation {
                                VStack(spacing: 8) {
                                    Text("\"\(aff.content)\"")
                                        .font(.subheadline.italic())
                                        .foregroundColor(.ppTextPrimary)
                                        .multilineTextAlignment(.center)
                                    Text("— \(aff.author ?? "Bob Proctor")")
                                        .font(.caption.weight(.medium))
                                        .foregroundColor(.ppOrange)
                                }
                                .padding(20)
                                .cardStyle()
                            }

                            // Section header with progress bar
                            if let dash = viewModel.dashboard {
                                VStack(alignment: .leading, spacing: 10) {
                                    HStack {
                                        Text("The 12-Lesson System")
                                            .font(.title3.weight(.bold))
                                            .foregroundColor(.ppTextPrimary)
                                        Spacer()
                                        Text("\(dash.lessonsCompleted)/12")
                                            .font(.subheadline.weight(.semibold))
                                            .foregroundColor(.ppOrange)
                                    }

                                    // Overall progress bar
                                    GeometryReader { geo in
                                        ZStack(alignment: .leading) {
                                            RoundedRectangle(cornerRadius: 4)
                                                .fill(Color.ppSurfaceLight)
                                                .frame(height: 6)

                                            RoundedRectangle(cornerRadius: 4)
                                                .fill(PPGradient.gold)
                                                .frame(width: geo.size.width * CGFloat(dash.progressPercent) / 100, height: 6)
                                        }
                                    }
                                    .frame(height: 6)
                                }
                            } else {
                                HStack {
                                    Text("The 12-Lesson System")
                                        .font(.title3.weight(.bold))
                                        .foregroundColor(.ppTextPrimary)
                                    Spacer()
                                }
                            }

                            // Lesson cards
                            ForEach(viewModel.lessons) { lesson in
                                NavigationLink(value: lesson) {
                                    lessonRow(lesson)
                                }
                                .buttonStyle(.plain)
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

    // MARK: - Stats Row (4 mini cards like web dashboard)

    private func statsRow(_ dash: DashboardData) -> some View {
        HStack(spacing: 12) {
            statCard(
                value: "\(dash.progressPercent)%",
                label: "Progress",
                icon: "chart.bar.fill",
                color: .ppIconBlue
            )
            statCard(
                value: "\(dash.currentStreak)",
                label: "Streak",
                icon: "flame.fill",
                color: .ppOrange
            )
            statCard(
                value: "\(dash.badgeCount)",
                label: "Badges",
                icon: "star.fill",
                color: .ppIconYellow
            )
        }
    }

    private func statCard(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)

            Text(value)
                .font(.title2.weight(.bold))
                .foregroundColor(.ppTextPrimary)

            Text(label)
                .font(.caption2.weight(.medium))
                .foregroundColor(.ppTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .cardStyle()
    }

    // MARK: - Lesson Row

    private func lessonRow(_ lesson: Lesson) -> some View {
        HStack(spacing: 14) {
            // Numbered circle with gradient
            ZStack {
                if viewModel.isLessonCompleted(lesson) {
                    Circle()
                        .fill(Color.ppSuccess)
                        .frame(width: 40, height: 40)
                    Image(systemName: "checkmark")
                        .font(.subheadline.weight(.bold))
                        .foregroundColor(.white)
                } else {
                    Circle()
                        .fill(PPGradient.cta)
                        .frame(width: 40, height: 40)
                        .shadow(color: .ppOrange.opacity(0.3), radius: 6, x: 0, y: 0)
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
                        HStack(spacing: 3) {
                            Image(systemName: "clock")
                                .font(.system(size: 9))
                            Text("\(minutes) min")
                        }
                        .font(.caption)
                        .foregroundColor(.ppTextMuted)
                    }

                    if lesson.hasAudio == true {
                        HStack(spacing: 3) {
                            Image(systemName: "headphones")
                                .font(.system(size: 9))
                            Text("Audio")
                        }
                        .font(.caption)
                        .foregroundColor(.ppPink)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundColor(.ppTextMuted)
        }
        .padding(16)
        .cardStyle()
    }
}
