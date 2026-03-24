import SwiftUI

struct CheckInView: View {
    @StateObject private var viewModel = CheckInViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if viewModel.isLoading && viewModel.todayCheckIn == nil && viewModel.history.isEmpty {
                    LoadingView()
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Streak banner
                            if viewModel.currentStreak > 0 {
                                streakBanner
                            }

                            // Main content: completed or wizard
                            if viewModel.hasCheckedInToday {
                                completedView
                            } else {
                                wizardView
                            }

                            // 30-day calendar
                            calendarView

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
            .navigationTitle("Daily Check-In")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    // MARK: - Streak Banner

    private var streakBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "flame.fill")
                .foregroundColor(.ppOrange)
            Text("\(viewModel.currentStreak)-day check-in streak!")
                .font(.subheadline.weight(.bold))
                .foregroundColor(.ppOrange.opacity(0.8))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(Color.ppOrange.opacity(0.1))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.ppOrange.opacity(0.3), lineWidth: 1)
        )
        .cornerRadius(16)
    }

    // MARK: - Completed View

    private var completedView: some View {
        VStack(spacing: 20) {
            // Success header
            VStack(spacing: 8) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.ppSuccess)
                Text("Check-In Complete!")
                    .font(.title2.bold())
                    .foregroundColor(.ppTextPrimary)
                Text("You showed up for yourself today.")
                    .font(.subheadline)
                    .foregroundColor(.ppTextSecondary)
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .cardStyle()

            // AI Insight
            if let insight = viewModel.todayCheckIn?.aiInsight, !insight.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("YOUR AI COACH SAYS")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.ppOrange)
                        .tracking(1)
                    Text(insight)
                        .font(.subheadline.italic())
                        .foregroundColor(.ppTextPrimary)
                        .lineSpacing(3)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.ppOrange.opacity(0.05))
                .overlay(
                    Rectangle()
                        .fill(Color.ppOrange)
                        .frame(width: 4),
                    alignment: .leading
                )
                .cornerRadius(12)
            }
        }
    }

    // MARK: - Wizard (step-by-step like web)

    private var wizardView: some View {
        VStack(spacing: 20) {
            // Progress steps
            progressSteps

            // Current step content
            Group {
                switch viewModel.step {
                case 0: moodStep
                case 1: winStep
                case 2: challengeStep
                case 3: tomorrowStep
                default: EmptyView()
                }
            }

            // Error
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
        .padding(20)
        .cardStyle()
    }

    private var progressSteps: some View {
        VStack(spacing: 8) {
            HStack {
                ForEach(["Mood", "Win", "Challenge", "Tomorrow"], id: \.self) { label in
                    let idx = ["Mood", "Win", "Challenge", "Tomorrow"].firstIndex(of: label)!
                    Text(label)
                        .font(.system(size: 10, weight: idx <= viewModel.step ? .bold : .medium))
                        .foregroundColor(idx <= viewModel.step ? .ppOrange : .ppTextMuted)
                    if label != "Tomorrow" {
                        Spacer()
                    }
                }
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.ppBackground)
                        .frame(height: 6)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(PPGradient.gold)
                        .frame(width: geo.size.width * CGFloat(viewModel.step) / 4, height: 6)
                }
            }
            .frame(height: 6)
        }
    }

    // MARK: - Step 0: Mood

    private var moodStep: some View {
        VStack(spacing: 20) {
            Text("How are you feeling today?")
                .font(.title3.weight(.bold))
                .foregroundColor(.ppTextPrimary)
                .multilineTextAlignment(.center)

            HStack(spacing: 8) {
                ForEach(moodOptions, id: \.value) { option in
                    Button {
                        viewModel.mood = option.value
                    } label: {
                        VStack(spacing: 6) {
                            Text(option.emoji)
                                .font(.largeTitle)
                                .scaleEffect(viewModel.mood == option.value ? 1.15 : 1.0)
                            Text(option.label)
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.ppTextSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(viewModel.mood == option.value ? Color.ppOrange.opacity(0.2) : Color.white.opacity(0.05))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(viewModel.mood == option.value ? Color.ppOrange : Color.ppBorder.opacity(0.4), lineWidth: 1)
                        )
                        .cornerRadius(14)
                    }
                    .animation(.easeOut(duration: 0.15), value: viewModel.mood)
                }
            }

            Button {
                viewModel.step = 1
            } label: {
                HStack(spacing: 6) {
                    Text("Next")
                        .fontWeight(.semibold)
                    Image(systemName: "arrow.right")
                        .font(.caption)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(viewModel.mood == 0)
            .opacity(viewModel.mood == 0 ? 0.5 : 1)
        }
    }

    // MARK: - Step 1: Win

    private var winStep: some View {
        wizardTextField(
            emoji: "\u{1F3C6}",
            title: "What's one win from today?",
            subtitle: "Big or small - all wins count.",
            placeholder: "e.g. I completed lesson 3, had a great conversation...",
            text: $viewModel.wins,
            onBack: { viewModel.step = 0 },
            onNext: { viewModel.step = 2 },
            nextDisabled: viewModel.wins.trimmingCharacters(in: .whitespaces).isEmpty
        )
    }

    // MARK: - Step 2: Challenge

    private var challengeStep: some View {
        wizardTextField(
            emoji: "\u{1F4AA}",
            title: "What's one challenge you're facing?",
            subtitle: "Acknowledging it is the first step.",
            placeholder: "e.g. Hard to stay focused, procrastinating...",
            text: $viewModel.struggles,
            onBack: { viewModel.step = 1 },
            onNext: { viewModel.step = 3 },
            nextDisabled: viewModel.struggles.trimmingCharacters(in: .whitespaces).isEmpty
        )
    }

    // MARK: - Step 3: Tomorrow

    private var tomorrowStep: some View {
        VStack(spacing: 16) {
            Text("\u{1F3AF}").font(.system(size: 40))
            Text("What's your #1 priority for tomorrow?")
                .font(.title3.weight(.bold))
                .foregroundColor(.ppTextPrimary)
                .multilineTextAlignment(.center)
            Text("One focused intention = massive momentum.")
                .font(.caption)
                .foregroundColor(.ppTextMuted)

            TextField("e.g. Complete lesson 4, journal for 10 minutes...", text: $viewModel.tomorrowPlan, axis: .vertical)
                .lineLimit(3...5)
                .darkInputStyle()

            HStack(spacing: 12) {
                Button {
                    viewModel.step = 2
                } label: {
                    Text("Back")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(SecondaryButtonStyle())

                Button {
                    Task { await viewModel.submitCheckIn() }
                } label: {
                    HStack(spacing: 6) {
                        if viewModel.isSubmitting {
                            ProgressView().tint(.white)
                        } else {
                            Text("Submit")
                                .fontWeight(.semibold)
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
                .buttonStyle(PrimaryButtonStyle(isLoading: viewModel.isSubmitting))
                .disabled(viewModel.tomorrowPlan.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isSubmitting)
                .opacity(viewModel.tomorrowPlan.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
            }
        }
    }

    // MARK: - Reusable wizard text step

    private func wizardTextField(emoji: String, title: String, subtitle: String, placeholder: String, text: Binding<String>, onBack: @escaping () -> Void, onNext: @escaping () -> Void, nextDisabled: Bool) -> some View {
        VStack(spacing: 16) {
            Text(emoji).font(.system(size: 40))
            Text(title)
                .font(.title3.weight(.bold))
                .foregroundColor(.ppTextPrimary)
                .multilineTextAlignment(.center)
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.ppTextMuted)

            TextField(placeholder, text: text, axis: .vertical)
                .lineLimit(3...5)
                .darkInputStyle()

            HStack(spacing: 12) {
                Button {
                    onBack()
                } label: {
                    Text("Back")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(SecondaryButtonStyle())

                Button {
                    onNext()
                } label: {
                    HStack(spacing: 6) {
                        Text("Next")
                            .fontWeight(.semibold)
                        Image(systemName: "arrow.right")
                            .font(.caption)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(nextDisabled)
                .opacity(nextDisabled ? 0.5 : 1)
            }
        }
    }

    // MARK: - 30-Day Calendar

    private var calendarView: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 6) {
                Image(systemName: "calendar")
                    .font(.caption)
                    .foregroundColor(.ppOrange)
                Text("30-Day Check-In History")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
            }

            let days = viewModel.calendarDays
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 10), spacing: 4) {
                ForEach(days, id: \.date) { day in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(day.done ? Color.ppSuccess : (day.isToday ? Color.ppIndigo : Color.ppBackground.opacity(0.6)))
                        .frame(height: 18)
                        .overlay(
                            day.isToday && !day.done ?
                            RoundedRectangle(cornerRadius: 3)
                                .stroke(Color.ppIndigo, lineWidth: 1) : nil
                        )
                }
            }

            HStack(spacing: 12) {
                HStack(spacing: 4) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.ppSuccess)
                        .frame(width: 12, height: 12)
                    Text("Done")
                        .font(.system(size: 10))
                        .foregroundColor(.ppTextMuted)
                }
                HStack(spacing: 4) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.ppBackground.opacity(0.6))
                        .frame(width: 12, height: 12)
                    Text("Missed")
                        .font(.system(size: 10))
                        .foregroundColor(.ppTextMuted)
                }
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Data

    private var moodOptions: [(value: Int, emoji: String, label: String)] {
        [
            (1, "\u{1F61E}", "Struggling"),
            (2, "\u{1F615}", "Not great"),
            (3, "\u{1F610}", "Okay"),
            (4, "\u{1F642}", "Good"),
            (5, "\u{1F525}", "Amazing!"),
        ]
    }
}
