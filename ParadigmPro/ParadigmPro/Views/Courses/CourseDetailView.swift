import SwiftUI

struct CourseDetailView: View {
    let courseId: String // used as slug
    @StateObject private var viewModel = CourseDetailViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView()
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error) {
                    Task { await viewModel.fetchLesson(slug: courseId) }
                }
            } else if let lesson = viewModel.lesson {
                LessonView(lesson: lesson)
            }
        }
        .background(Color.ppBackground)
        .task {
            await viewModel.fetchLesson(slug: courseId)
        }
    }
}
