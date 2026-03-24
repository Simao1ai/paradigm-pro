import SwiftUI

struct GoalsView: View {
    @StateObject private var viewModel = GoalsViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if viewModel.isLoading && viewModel.goals.isEmpty && viewModel.actionItems.isEmpty {
                    LoadingView()
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Goals section
                            goalsSection

                            // New goal form
                            if viewModel.showNewGoalForm {
                                newGoalForm
                            }

                            // Action items section
                            actionItemsSection

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
            .navigationTitle("Goals")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        withAnimation { viewModel.showNewGoalForm.toggle() }
                    } label: {
                        Image(systemName: viewModel.showNewGoalForm ? "xmark" : "plus")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.ppOrange)
                    }
                }
            }
            .task {
                await viewModel.fetchData()
            }
        }
        .tint(.ppOrange)
    }

    // MARK: - Goals Section

    private var goalsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.ppOrange)
                Text("Long-Term Goals")
                    .font(.headline.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                Text("\(viewModel.goals.count)")
                    .font(.caption.weight(.bold))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.ppOrange.opacity(0.15))
                    .foregroundColor(.ppOrange)
                    .cornerRadius(8)
            }

            if viewModel.goals.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "flag.fill")
                        .font(.title)
                        .foregroundColor(.ppTextMuted)
                    Text("No goals yet")
                        .font(.subheadline)
                        .foregroundColor(.ppTextSecondary)
                    Text("Tap + to set your first goal")
                        .font(.caption)
                        .foregroundColor(.ppTextMuted)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .cardStyle()
            } else {
                ForEach(viewModel.goals) { goal in
                    goalRow(goal)
                }
            }
        }
    }

    private func goalRow(_ goal: LongTermGoal) -> some View {
        HStack(spacing: 12) {
            Circle()
                .fill(statusColor(goal.status))
                .frame(width: 10, height: 10)

            VStack(alignment: .leading, spacing: 4) {
                Text(goal.title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)

                HStack(spacing: 8) {
                    if let status = goal.status {
                        Text(status.capitalized)
                            .font(.caption2.weight(.bold))
                            .foregroundColor(statusColor(status))
                    }
                    if let date = goal.targetDate {
                        Text(date.relativeDate)
                            .font(.caption2)
                            .foregroundColor(.ppTextMuted)
                    }
                }

                if let desc = goal.description, !desc.isEmpty {
                    Text(desc)
                        .font(.caption)
                        .foregroundColor(.ppTextSecondary)
                        .lineLimit(2)
                }
            }

            Spacer()

            Button {
                Task { await viewModel.deleteGoal(goal) }
            } label: {
                Image(systemName: "trash")
                    .font(.caption)
                    .foregroundColor(.ppTextMuted)
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - New Goal Form

    private var newGoalForm: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("New Goal")
                .font(.subheadline.weight(.bold))
                .foregroundColor(.ppOrange)

            TextField("Goal title", text: $viewModel.newGoalTitle)
                .darkInputStyle()

            TextField("Description (optional)", text: $viewModel.newGoalDescription, axis: .vertical)
                .lineLimit(2...4)
                .darkInputStyle()

            Button {
                Task { await viewModel.createGoal() }
            } label: {
                HStack(spacing: 8) {
                    if viewModel.isCreating {
                        ProgressView().tint(.white)
                    }
                    Text("Create Goal")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(PrimaryButtonStyle(isLoading: viewModel.isCreating))
            .disabled(viewModel.isCreating)
        }
        .padding(16)
        .cardStyle()
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    // MARK: - Action Items Section

    private var actionItemsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "checklist")
                    .foregroundColor(.ppIconGreen)
                Text("Action Items")
                    .font(.headline.weight(.bold))
                    .foregroundColor(.ppTextPrimary)
                Spacer()
                let pending = viewModel.actionItems.filter { $0.completed != true }.count
                if pending > 0 {
                    Text("\(pending) pending")
                        .font(.caption.weight(.medium))
                        .foregroundColor(.ppTextMuted)
                }
            }

            if viewModel.actionItems.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "checklist")
                        .font(.title)
                        .foregroundColor(.ppTextMuted)
                    Text("No action items yet")
                        .font(.subheadline)
                        .foregroundColor(.ppTextSecondary)
                    Text("Complete lessons to get AI-generated action items")
                        .font(.caption)
                        .foregroundColor(.ppTextMuted)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .cardStyle()
            } else {
                ForEach(viewModel.actionItems) { item in
                    actionItemRow(item)
                }
            }
        }
    }

    private func actionItemRow(_ item: ActionItem) -> some View {
        HStack(spacing: 12) {
            Button {
                Task { await viewModel.toggleActionItem(item) }
            } label: {
                Image(systemName: item.completed == true ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundColor(item.completed == true ? .ppSuccess : .ppTextMuted)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.ppTextPrimary)
                    .strikethrough(item.completed == true)

                if let desc = item.description, !desc.isEmpty {
                    Text(desc)
                        .font(.caption)
                        .foregroundColor(.ppTextSecondary)
                        .lineLimit(2)
                }

                if let date = item.dueDate {
                    Text("Due: \(date.relativeDate)")
                        .font(.caption2)
                        .foregroundColor(.ppTextMuted)
                }
            }

            Spacer()

            Button {
                Task { await viewModel.deleteActionItem(item) }
            } label: {
                Image(systemName: "trash")
                    .font(.caption)
                    .foregroundColor(.ppTextMuted)
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Helpers

    private func statusColor(_ status: String?) -> Color {
        switch status?.lowercased() {
        case "active": return .ppOrange
        case "completed": return .ppSuccess
        case "paused": return .ppTextMuted
        default: return .ppOrange
        }
    }
}
