import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

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
                            // Welcome + Notifications
                            welcomeHeader

                            // Stats row
                            if let dash = viewModel.dashboard {
                                statsRow(dash)
                            }

                            // Daily affirmation
                            if let aff = viewModel.dashboard?.affirmation {
                                affirmationCard(aff)
                            }

                            // Coach insight
                            if let insight = viewModel.dashboard?.coachInsight, !insight.isEmpty {
                                coachInsightCard(insight)
                            }

                            // Next lesson card
                            if let next = viewModel.dashboard?.nextLesson {
                                nextLessonCard(next)
                            }

                            // Upcoming session
                            if let session = viewModel.dashboard?.upcomingSession {
                                upcomingSessionCard(session)
                            }

                            // Check-in status
                            checkInStatusCard

                            // Active goals
                            if let goals = viewModel.dashboard?.activeGoals, !goals.isEmpty {
                                activeGoalsCard(goals)
                            }

                            // Pending action items
                            if let items = viewModel.dashboard?.pendingActionItems, !items.isEmpty {
                                actionItemsCard(items)
                            }

                            // Progress overview
                            if let dash = viewModel.dashboard {
                                progressOverview(dash)
                            }

                            Spacer(minLength: 20)
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
            .navigationDestination(for: NextLesson.self) { next in
                LessonDetailLoader(slug: next.slug)
            }
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    // MARK: - Welcome Header

    private var welcomeHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Welcome Back")
                    .font(.title2.bold())
                    .foregroundColor(.ppTextPrimary)

                if let streak = viewModel.dashboard?.checkInStreak, streak > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.ppOrange)
                        Text("\(streak)-day streak")
                            .foregroundColor(.ppOrange)
                    }
                    .font(.caption.weight(.semibold))
                }
            }

            Spacer()

            if viewModel.unreadCount > 0 {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell.fill")
                        .font(.title3)
                        .foregroundColor(.ppTextSecondary)

                    Text("\(viewModel.unreadCount)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(4)
                        .background(Color.ppError)
                        .clipShape(Circle())
                        .offset(x: 6, y: -6)
                }
            }
        }
    }

    // MARK: - Stats Row

    private func statsRow(_ dash: DashboardData) -> some View {
        HStack(spacing: 10) {
            statCard(value: "\(dash.progressPercent)%", label: "Progress", icon: "chart.bar.fill", color: .ppIconBlue)
            statCard(value: "\(dash.currentStreak)", label: "Streak", icon: "flame.fill", color: .ppOrange)
            statCard(value: "\(dash.badgeCount)", label: "Badges", icon: "star.fill", color: .ppIconYellow)
            statCard(value: "\(dash.lessonsCompleted)/12", label: "Lessons", icon: "book.fill", color: .ppIconGreen)
        }
    }

    private func statCard(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundColor(color)
            Text(value)
                .font(.headline.weight(.bold))
                .foregroundColor(.ppTextPrimary)
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.ppTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .cardStyle()
    }

    // MARK: - Affirmation

    private func affirmationCard(_ aff: Affirmation) -> some View {
        VStack(spacing: 8) {
            Image(systemName: "quote.opening")
                .font(.title3)
                .foregroundColor(.ppOrange.opacity(0.6))

            Text(aff.content)
                .font(.subheadline.italic())
                .foregroundColor(.ppTextPrimary)
                .multilineTextAlignment(.center)
                .lineSpacing(3)

            Text("- \(aff.author ?? "Bob Proctor")")
                .font(.caption.weight(.medium))
                .foregroundColor(.ppOrange)
        }
        .padding(20)
        .cardStyle()
    }

    // MARK: - Coach Insight

    private func coachInsightCard(_ insight: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "brain.head.profile")
                .font(.title3)
                .foregroundColor(.ppIconPurple)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 4) {
                Text("Coach Insight")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.ppIconPurple)
                Text(insight)
                    .font(.subheadline)
                    .foregroundColor(.ppTextPrimary)
                    .lineSpacing(3)
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Next Lesson

    private func nextLessonCard(_ next: NextLesson) -> some View {
        NavigationLink(value: next) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(PPGradient.cta)
                        .frame(width: 44, height: 44)
                        .shadow(color: .ppOrange.opacity(0.3), radius: 8)
                    Text("\(next.number)")
                        .font(.headline.weight(.bold))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Continue Learning")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.ppOrange)
                    Text(next.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.ppTextPrimary)
                    if let subtitle = next.subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.ppTextSecondary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                VStack(spacing: 4) {
                    Image(systemName: "play.circle.fill")
                        .font(.title2)
                        .foregroundColor(.ppOrange)
                    if let min = next.estimatedMinutes {
                        Text("\(min) min")
                            .font(.system(size: 10))
                            .foregroundColor(.ppTextMuted)
                    }
                }
            }
            .padding(16)
            .cardStyle()
        }
        .buttonStyle(.plain)
    }

    // MARK: - Upcoming Session

    private func upcomingSessionCard(_ session: UpcomingSession) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "video.fill")
                .font(.title3)
                .foregroundColor(.ppIconBlue)
                .frame(width: 40, height: 40)
                .background(Color.ppIconBlue.opacity(0.15))
                .cornerRadius(10)

            VStack(alignment: .leading, spacing: 4) {
                Text("Upcoming Session")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.ppIconBlue)
                Text(session.scheduledAt.relativeDate)
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.ppTextPrimary)
            }

            Spacer()

            if session.zoomMeetingUrl != nil {
                Text("Join")
                    .font(.caption.weight(.bold))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(PPGradient.cta)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Check-In Status

    private var checkInStatusCard: some View {
        HStack(spacing: 12) {
            Image(systemName: viewModel.todayCheckIn != nil ? "checkmark.circle.fill" : "circle")
                .font(.title3)
                .foregroundColor(viewModel.todayCheckIn != nil ? .ppSuccess : .ppTextMuted)

            VStack(alignment: .leading, spacing: 2) {
                Text("Daily Check-In")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)
                Text(viewModel.todayCheckIn != nil ? "Completed today" : "Tap the Check-In tab to reflect on your day")
                    .font(.caption)
                    .foregroundColor(.ppTextSecondary)
            }

            Spacer()

            if let checkIn = viewModel.todayCheckIn {
                moodEmoji(checkIn.mood)
                    .font(.title2)
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Active Goals

    private func activeGoalsCard(_ goals: [DashboardGoal]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.ppOrange)
                Text("Active Goals")
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("\(goals.count)")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.ppOrange)
            }

            ForEach(goals) { goal in
                HStack(spacing: 10) {
                    Circle()
                        .fill(Color.ppOrange.opacity(0.3))
                        .frame(width: 8, height: 8)
                    Text(goal.title)
                        .font(.subheadline)
                        .foregroundColor(.ppTextPrimary)
                        .lineLimit(1)
                    Spacer()
                    if let date = goal.targetDate {
                        Text(date.relativeDate)
                            .font(.caption2)
                            .foregroundColor(.ppTextMuted)
                    }
                }
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Action Items

    private func actionItemsCard(_ items: [DashboardActionItem]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "checklist")
                    .foregroundColor(.ppIconGreen)
                Text("Action Items")
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("\(items.count) pending")
                    .font(.caption.weight(.medium))
                    .foregroundColor(.ppTextMuted)
            }

            ForEach(items) { item in
                HStack(spacing: 10) {
                    Image(systemName: item.completed == true ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(item.completed == true ? .ppSuccess : .ppTextMuted)
                        .font(.subheadline)
                    Text(item.title)
                        .font(.subheadline)
                        .foregroundColor(.ppTextPrimary)
                        .lineLimit(1)
                        .strikethrough(item.completed == true)
                    Spacer()
                }
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Progress Overview

    private func progressOverview(_ dash: DashboardData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("12-Lesson Progress")
                    .font(.subheadline.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("\(dash.lessonsCompleted)/12")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(.ppOrange)
            }

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.ppSurfaceLight)
                        .frame(height: 8)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(PPGradient.gold)
                        .frame(width: geo.size.width * CGFloat(dash.progressPercent) / 100, height: 8)
                }
            }
            .frame(height: 8)

            // Lesson dots
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 6), spacing: 8) {
                ForEach(1...12, id: \.self) { num in
                    ZStack {
                        Circle()
                            .fill(dash.completedLessonNumbers.contains(num) ? Color.ppSuccess : Color.ppSurfaceLight)
                            .frame(width: 36, height: 36)
                        if dash.completedLessonNumbers.contains(num) {
                            Image(systemName: "checkmark")
                                .font(.caption.weight(.bold))
                                .foregroundColor(.white)
                        } else {
                            Text("\(num)")
                                .font(.caption.weight(.semibold))
                                .foregroundColor(.ppTextMuted)
                        }
                    }
                }
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Helpers

    private func moodEmoji(_ mood: Int) -> Text {
        switch mood {
        case 1: return Text("😞")
        case 2: return Text("😐")
        case 3: return Text("🙂")
        case 4: return Text("😊")
        case 5: return Text("🤩")
        default: return Text("🙂")
        }
    }
}
