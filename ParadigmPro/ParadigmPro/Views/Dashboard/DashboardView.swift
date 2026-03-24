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
                            if let dash = viewModel.dashboard {
                                // Today's Affirmation
                                if let aff = dash.affirmation {
                                    affirmationCard(aff)
                                }

                                // Check-in prompt or streak banner
                                if !dash.checkInToday {
                                    checkInPromptBanner
                                } else if let streak = dash.checkInStreak, streak > 0 {
                                    checkedInBanner(streak)
                                }

                                // AI Coach Insight
                                if let insight = dash.coachInsight, !insight.isEmpty {
                                    coachInsightCard(insight)
                                }

                                // 4 stat cards
                                statsGrid(dash)

                                // Program Progress bar
                                programProgress(dash)

                                // Continue Learning + Upcoming Session
                                HStack(alignment: .top, spacing: 12) {
                                    continueCard(dash.nextLesson)
                                    upcomingSessionCard(dash.upcomingSession)
                                }

                                // Goals + Action Items side by side
                                if let goals = dash.activeGoals, !goals.isEmpty,
                                   let items = dash.pendingActionItems, !items.isEmpty {
                                    HStack(alignment: .top, spacing: 12) {
                                        activeGoalsCard(goals)
                                        actionItemsCard(items)
                                    }
                                } else {
                                    if let goals = dash.activeGoals, !goals.isEmpty {
                                        activeGoalsCard(goals)
                                    }
                                    if let items = dash.pendingActionItems, !items.isEmpty {
                                        actionItemsCard(items)
                                    }
                                }

                                // All Lessons grid (first 6)
                                allLessonsGrid(dash)
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
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 12) {
                        if viewModel.unreadCount > 0 {
                            ZStack(alignment: .topTrailing) {
                                Image(systemName: "bell.fill")
                                    .font(.subheadline)
                                    .foregroundColor(.ppTextSecondary)
                                Text("\(viewModel.unreadCount)")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(3)
                                    .background(Color.ppError)
                                    .clipShape(Circle())
                                    .offset(x: 6, y: -6)
                            }
                        }
                    }
                }
            }
            .navigationDestination(for: NextLesson.self) { next in
                LessonDetailLoader(slug: next.slug)
            }
            .navigationDestination(for: Lesson.self) { lesson in
                LessonView(lesson: lesson)
            }
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    // MARK: - Affirmation (matches web: star icon + "Today's Affirmation" label)

    private func affirmationCard(_ aff: Affirmation) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "star.fill")
                .font(.subheadline)
                .foregroundColor(.ppOrange)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 6) {
                Text("TODAY'S AFFIRMATION")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.ppOrange)
                    .tracking(1)

                Text("\u{201C}\(aff.content)\u{201D}")
                    .font(.subheadline.italic())
                    .foregroundColor(.ppTextPrimary)
                    .lineSpacing(3)

                Text("— \(aff.author ?? "Bob Proctor")")
                    .font(.caption)
                    .foregroundColor(.ppTextMuted)
            }
        }
        .padding(16)
        .background(Color.ppOrange.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.ppOrange.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(16)
    }

    // MARK: - Check-In Prompt (not checked in today)

    private var checkInPromptBanner: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.ppOrange.opacity(0.2))
                    .frame(width: 40, height: 40)
                Text("🔥")
                    .font(.title3)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("Daily Check-In")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)
                Text("Take 2 minutes to reflect and get your AI insight")
                    .font(.caption)
                    .foregroundColor(.ppOrange.opacity(0.8))
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundColor(.ppOrange)
        }
        .padding(14)
        .background(
            LinearGradient(colors: [Color.ppOrange.opacity(0.1), Color.ppOrange.opacity(0.05)],
                          startPoint: .leading, endPoint: .trailing)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.ppOrange.opacity(0.4), lineWidth: 1)
        )
        .cornerRadius(16)
    }

    // MARK: - Checked-In Banner

    private func checkedInBanner(_ streak: Int) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.ppSuccess)
            Text("Checked in today!")
                .font(.subheadline.weight(.medium))
                .foregroundColor(.ppSuccess)
            Spacer()
            HStack(spacing: 4) {
                Image(systemName: "flame.fill")
                    .foregroundColor(.ppOrange)
                Text("\(streak)-day streak")
                    .foregroundColor(.ppOrange)
                    .fontWeight(.bold)
            }
            .font(.subheadline)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.ppSuccess.opacity(0.1))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.ppSuccess.opacity(0.3), lineWidth: 1)
        )
        .cornerRadius(16)
    }

    // MARK: - Coach Insight

    private func coachInsightCard(_ insight: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "brain.head.profile")
                .font(.subheadline)
                .foregroundColor(.ppOrange)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 4) {
                Text("YOUR AI COACH SAYS")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.ppOrange)
                    .tracking(1)
                Text(insight)
                    .font(.subheadline.italic())
                    .foregroundColor(.ppTextPrimary)
                    .lineSpacing(3)
            }
        }
        .padding(16)
        .background(Color.ppOrange.opacity(0.05))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.ppOrange.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(16)
    }

    // MARK: - Stats Grid (2x2 like web)

    private func statsGrid(_ dash: DashboardData) -> some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
            statCard(value: "\(dash.lessonsCompleted)/12", label: "Lessons Complete", icon: "book.fill", color: .ppIconBlue, bg: Color.ppIconBlue.opacity(0.1))
            statCard(value: "\(dash.currentStreak)", label: "Day Streak", icon: "flame.fill", color: .ppOrange, bg: Color.ppOrange.opacity(0.1))
            statCard(value: "\(dash.badgeCount)", label: "Badges Earned", icon: "star.fill", color: .ppIconYellow, bg: Color.ppIconYellow.opacity(0.1))
            statCard(value: "\(dash.progressPercent)%", label: "Program Progress", icon: "target", color: .ppIconGreen, bg: Color.ppIconGreen.opacity(0.1))
        }
    }

    private func statCard(value: String, label: String, icon: String, color: Color, bg: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(bg)
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.subheadline)
                    .foregroundColor(color)
            }
            Text(value)
                .font(.title2.weight(.bold))
                .foregroundColor(.ppTextPrimary)
            Text(label)
                .font(.caption2)
                .foregroundColor(.ppTextSecondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Program Progress

    private func programProgress(_ dash: DashboardData) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Program Progress")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("\(dash.lessonsCompleted) of 12 lessons")
                    .font(.caption)
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

            Text(dash.lessonsCompleted == 12
                ? "Congratulations! You've completed the full program!"
                : "\(12 - dash.lessonsCompleted) lessons remaining")
                .font(.caption)
                .foregroundColor(.ppTextMuted)
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Continue Learning

    private func continueCard(_ next: NextLesson?) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Continue Learning")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.ppTextPrimary)

            if let next = next {
                NavigationLink(value: next) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.ppOrange.opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.ppOrange.opacity(0.3), lineWidth: 1)
                                )
                                .frame(width: 36, height: 36)
                            Text("\(next.number)")
                                .font(.subheadline.weight(.bold))
                                .foregroundColor(.ppOrange)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(next.title)
                                .font(.caption.weight(.medium))
                                .foregroundColor(.ppTextPrimary)
                                .lineLimit(1)
                            if let min = next.estimatedMinutes {
                                Text("\(min) min")
                                    .font(.system(size: 10))
                                    .foregroundColor(.ppOrange.opacity(0.7))
                            }
                        }

                        Spacer(minLength: 0)

                        Image(systemName: "chevron.right")
                            .font(.caption2)
                            .foregroundColor(.ppOrange)
                    }
                    .padding(10)
                    .background(Color.ppSurfaceLight.opacity(0.3))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.ppBorder.opacity(0.5), lineWidth: 1)
                    )
                    .cornerRadius(12)
                }
                .buttonStyle(.plain)
            } else {
                Text("All lessons complete! 🎉")
                    .font(.caption)
                    .foregroundColor(.ppTextMuted)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Upcoming Session

    private func upcomingSessionCard(_ session: UpcomingSession?) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Upcoming Session")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.ppTextPrimary)

            if let session = session {
                VStack(spacing: 10) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.ppOrange.opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.ppOrange.opacity(0.3), lineWidth: 1)
                                )
                                .frame(width: 36, height: 36)
                            Image(systemName: "calendar")
                                .font(.subheadline)
                                .foregroundColor(.ppOrange)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Consultant Session")
                                .font(.caption.weight(.medium))
                                .foregroundColor(.ppTextPrimary)
                            Text(session.scheduledAt.relativeDate)
                                .font(.system(size: 10))
                                .foregroundColor(.ppTextMuted)
                        }
                    }

                    if session.zoomMeetingUrl != nil {
                        Text("Join Zoom Session")
                            .font(.caption.weight(.bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(PPGradient.cta)
                            .cornerRadius(10)
                    }
                }
                .padding(10)
                .background(Color.ppSurfaceLight.opacity(0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.ppBorder.opacity(0.5), lineWidth: 1)
                )
                .cornerRadius(12)
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.title2)
                        .foregroundColor(.ppTextMuted)
                    Text("No upcoming sessions")
                        .font(.caption)
                        .foregroundColor(.ppTextMuted)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Active Goals

    private func activeGoalsCard(_ goals: [DashboardGoal]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "target")
                    .font(.caption)
                    .foregroundColor(.ppOrange)
                Text("Active Goals")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("View all")
                    .font(.system(size: 10))
                    .foregroundColor(.ppOrange)
            }

            ForEach(goals) { goal in
                HStack(spacing: 8) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 10))
                        .foregroundColor(.ppIndigo)
                    Text(goal.title)
                        .font(.caption)
                        .foregroundColor(.ppTextPrimary)
                        .lineLimit(1)
                    Spacer(minLength: 0)
                    if let date = goal.targetDate {
                        let days = daysLeft(date)
                        Text("\(days)d")
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(days <= 7 ? .ppOrange : .ppIndigo)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.ppIndigo.opacity(0.3), lineWidth: 1)
                )
                .cornerRadius(10)
            }

            Text("+ Add new goal")
                .font(.system(size: 10))
                .foregroundColor(.ppIndigo)
                .frame(maxWidth: .infinity)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Action Items

    private func actionItemsCard(_ items: [DashboardActionItem]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "checklist")
                    .font(.caption)
                    .foregroundColor(.ppIconGreen)
                Text("Action Items")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                let pending = items.filter { $0.completed != true }.count
                Text("\(pending) pending")
                    .font(.system(size: 10))
                    .foregroundColor(.ppTextMuted)
            }

            ForEach(items) { item in
                HStack(spacing: 8) {
                    Image(systemName: item.completed == true ? "checkmark.circle.fill" : "circle")
                        .font(.caption)
                        .foregroundColor(item.completed == true ? .ppSuccess : .ppTextMuted)
                    Text(item.title)
                        .font(.caption)
                        .foregroundColor(.ppTextPrimary)
                        .lineLimit(1)
                        .strikethrough(item.completed == true)
                    Spacer(minLength: 0)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.ppBorder.opacity(0.3), lineWidth: 1)
                )
                .cornerRadius(10)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - All Lessons Grid (first 6)

    private func allLessonsGrid(_ dash: DashboardData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("All Lessons")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("View all")
                    .font(.caption)
                    .foregroundColor(.ppOrange)
            }

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(viewModel.lessons.prefix(6)) { lesson in
                    NavigationLink(value: lesson) {
                        lessonMiniCard(lesson, isCompleted: dash.completedLessonNumbers.contains(lesson.lessonNumber))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func lessonMiniCard(_ lesson: Lesson, isCompleted: Bool) -> some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(isCompleted ? Color.ppOrange.opacity(0.2) : Color.ppSurfaceLight)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isCompleted ? Color.ppOrange.opacity(0.4) : Color.ppBorder.opacity(0.5), lineWidth: 1)
                    )
                    .frame(width: 36, height: 36)
                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.ppOrange)
                } else {
                    Text("\(lesson.lessonNumber)")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.ppTextMuted)
                }
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(lesson.title)
                    .font(.caption.weight(.medium))
                    .foregroundColor(.ppTextPrimary)
                    .lineLimit(1)
                if let min = lesson.estimatedMinutes {
                    Text("\(min) min")
                        .font(.system(size: 10))
                        .foregroundColor(.ppTextMuted)
                }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Helpers

    private func daysLeft(_ dateStr: String) -> Int {
        guard let date = dateStr.asDate else { return 0 }
        return max(0, Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0)
    }
}
