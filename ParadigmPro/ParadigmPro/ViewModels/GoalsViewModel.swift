import Foundation

@MainActor
final class GoalsViewModel: ObservableObject {
    @Published var goals: [LongTermGoal] = []
    @Published var actionItems: [ActionItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // New goal form
    @Published var newGoalTitle = ""
    @Published var newGoalDescription = ""
    @Published var isCreating = false
    @Published var showNewGoalForm = false

    private let service = LessonService.shared

    func fetchData() async {
        isLoading = true
        errorMessage = nil

        do {
            async let goalsTask = service.fetchGoals()
            async let itemsTask = service.fetchActionItems()

            let (g, items) = try await (goalsTask, itemsTask)
            goals = g
            actionItems = items
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func createGoal() async {
        guard !newGoalTitle.isEmpty else {
            errorMessage = "Goal title is required"
            return
        }

        isCreating = true
        do {
            let goal = try await service.createGoal(
                title: newGoalTitle,
                description: newGoalDescription.isEmpty ? nil : newGoalDescription,
                targetDate: nil
            )
            goals.append(goal)
            newGoalTitle = ""
            newGoalDescription = ""
            showNewGoalForm = false
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        isCreating = false
    }

    func deleteGoal(_ goal: LongTermGoal) async {
        do {
            _ = try await service.deleteGoal(id: goal.id)
            goals.removeAll { $0.id == goal.id }
        } catch {
            errorMessage = "Failed to delete goal"
        }
    }

    func toggleActionItem(_ item: ActionItem) async {
        let newCompleted = !(item.completed ?? false)
        do {
            let updated = try await service.updateActionItem(
                id: item.id,
                updates: ["completed": newCompleted]
            )
            if let idx = actionItems.firstIndex(where: { $0.id == item.id }) {
                actionItems[idx] = updated
            }
        } catch {
            errorMessage = "Failed to update action item"
        }
    }

    func deleteActionItem(_ item: ActionItem) async {
        do {
            _ = try await service.deleteActionItem(id: item.id)
            actionItems.removeAll { $0.id == item.id }
        } catch {
            errorMessage = "Failed to delete action item"
        }
    }
}
