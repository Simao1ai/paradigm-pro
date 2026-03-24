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
                            if let checkIn = viewModel.todayCheckIn {
                                completedCheckInView(checkIn)
                            } else {
                                checkInForm
                            }

                            // History
                            if !viewModel.history.isEmpty {
                                historySection
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
            .navigationTitle("Daily Check-In")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    // MARK: - Completed Check-In

    private func completedCheckInView(_ checkIn: CheckIn) -> some View {
        VStack(spacing: 16) {
            // Success header
            VStack(spacing: 8) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 44))
                    .foregroundColor(.ppSuccess)
                Text("Today's Check-In Complete")
                    .font(.headline)
                    .foregroundColor(.ppTextPrimary)
                if let streak = checkIn.streak, streak > 1 {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.ppOrange)
                        Text("\(streak)-day streak!")
                            .foregroundColor(.ppOrange)
                    }
                    .font(.subheadline.weight(.semibold))
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity)
            .cardStyle()

            // Mood
            HStack {
                Text("Mood")
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.ppTextSecondary)
                Spacer()
                HStack(spacing: 4) {
                    ForEach(1...5, id: \.self) { i in
                        Text(i <= checkIn.mood ? "★" : "☆")
                            .foregroundColor(i <= checkIn.mood ? .ppOrange : .ppTextMuted)
                    }
                }
                .font(.title3)
            }
            .padding(16)
            .cardStyle()

            // Summary cards
            reflectionCard(icon: "trophy.fill", color: .ppIconYellow, label: "Today's Win", text: checkIn.wins)
            reflectionCard(icon: "exclamationmark.triangle.fill", color: .ppOrange, label: "Challenge", text: checkIn.struggles)
            reflectionCard(icon: "arrow.right.circle.fill", color: .ppIconBlue, label: "Tomorrow's Priority", text: checkIn.tomorrowPlan)

            // AI Insight
            if let insight = checkIn.aiInsight, !insight.isEmpty {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "brain.head.profile")
                        .font(.title3)
                        .foregroundColor(.ppIconPurple)
                        .padding(.top, 2)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("AI Coach Insight")
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
        }
    }

    private func reflectionCard(icon: String, color: Color, label: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.caption.weight(.bold))
                    .foregroundColor(color)
                Text(text)
                    .font(.subheadline)
                    .foregroundColor(.ppTextPrimary)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Check-In Form

    private var checkInForm: some View {
        VStack(spacing: 16) {
            // Header
            VStack(spacing: 8) {
                Image(systemName: "sun.horizon.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.ppOrange)
                Text("How was your day?")
                    .font(.title3.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Text("Take a moment to reflect and grow")
                    .font(.subheadline)
                    .foregroundColor(.ppTextSecondary)
            }
            .padding(.vertical, 8)

            // Mood selector
            VStack(spacing: 10) {
                Text("Mood")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)

                HStack(spacing: 16) {
                    ForEach(1...5, id: \.self) { i in
                        Button {
                            viewModel.mood = i
                        } label: {
                            VStack(spacing: 4) {
                                Text(moodEmoji(i))
                                    .font(.system(size: 32))
                                Text("\(i)")
                                    .font(.caption2)
                                    .foregroundColor(viewModel.mood == i ? .ppOrange : .ppTextMuted)
                            }
                            .padding(8)
                            .background(viewModel.mood == i ? Color.ppOrange.opacity(0.15) : Color.clear)
                            .cornerRadius(12)
                        }
                    }
                }
            }
            .padding(16)
            .cardStyle()

            // Wins
            formField(label: "Today's Win", placeholder: "What went well today?", text: $viewModel.wins, icon: "trophy.fill", color: .ppIconYellow)

            // Struggles
            formField(label: "Challenge", placeholder: "What was challenging?", text: $viewModel.struggles, icon: "exclamationmark.triangle.fill", color: .ppOrange)

            // Tomorrow
            formField(label: "Tomorrow's Priority", placeholder: "What's your #1 focus tomorrow?", text: $viewModel.tomorrowPlan, icon: "arrow.right.circle.fill", color: .ppIconBlue)

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

            // Submit
            Button {
                Task { await viewModel.submitCheckIn() }
            } label: {
                HStack(spacing: 8) {
                    if viewModel.isSubmitting {
                        ProgressView()
                            .tint(.white)
                    }
                    Text("Submit Check-In")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(PrimaryButtonStyle(isLoading: viewModel.isSubmitting))
            .disabled(viewModel.isSubmitting)
        }
    }

    private func formField(label: String, placeholder: String, text: Binding<String>, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.caption)
                Text(label)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)
            }
            TextField(placeholder, text: text, axis: .vertical)
                .lineLimit(2...4)
                .darkInputStyle()
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - History

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Check-Ins")
                .font(.subheadline.weight(.bold))
                .foregroundColor(.ppTextPrimary)

            ForEach(viewModel.history.prefix(7)) { checkIn in
                HStack(spacing: 12) {
                    Text(moodEmoji(checkIn.mood))
                        .font(.title3)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(checkIn.wins)
                            .font(.subheadline)
                            .foregroundColor(.ppTextPrimary)
                            .lineLimit(1)
                        if let date = checkIn.createdAt {
                            Text(date.relativeDate)
                                .font(.caption)
                                .foregroundColor(.ppTextMuted)
                        }
                    }

                    Spacer()

                    HStack(spacing: 2) {
                        ForEach(1...5, id: \.self) { i in
                            Circle()
                                .fill(i <= checkIn.mood ? Color.ppOrange : Color.ppSurfaceLight)
                                .frame(width: 6, height: 6)
                        }
                    }
                }
                .padding(14)
                .cardStyle()
            }
        }
    }

    // MARK: - Helpers

    private func moodEmoji(_ mood: Int) -> String {
        switch mood {
        case 1: return "😞"
        case 2: return "😐"
        case 3: return "🙂"
        case 4: return "😊"
        case 5: return "🤩"
        default: return "🙂"
        }
    }
}
