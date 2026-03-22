import SwiftUI

struct CourseListView: View {
    @StateObject private var viewModel = CoursesViewModel()
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            ZStack {
                Color.paradigmBackground
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Segmented picker
                    Picker("", selection: $selectedTab) {
                        Text("My Courses").tag(0)
                        Text("Available").tag(1)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    .padding(.vertical, 12)

                    if viewModel.isLoading {
                        LoadingView()
                    } else if let error = viewModel.errorMessage {
                        ErrorView(message: error) {
                            Task { await viewModel.fetchCourses() }
                        }
                    } else {
                        ScrollView {
                            // Grid - matches web: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
                            LazyVGrid(columns: [
                                GridItem(.flexible(), spacing: 16),
                                GridItem(.flexible(), spacing: 16)
                            ], spacing: 16) {
                                if selectedTab == 0 {
                                    if viewModel.enrolledCourses.isEmpty {
                                        emptyState(
                                            icon: "tray",
                                            title: "No courses yet",
                                            subtitle: "Enroll in a course to get started"
                                        )
                                    } else {
                                        ForEach(viewModel.enrolledCourses) { course in
                                            NavigationLink(value: course) {
                                                CourseCardView(course: course, isEnrolled: true)
                                            }
                                            .buttonStyle(.plain)
                                        }
                                    }
                                } else {
                                    if viewModel.availableCourses.isEmpty {
                                        emptyState(
                                            icon: "checkmark.circle",
                                            title: "All caught up",
                                            subtitle: "You're enrolled in all available courses"
                                        )
                                    } else {
                                        ForEach(viewModel.availableCourses) { course in
                                            CourseCardView(course: course, isEnrolled: false) {
                                                Task { await viewModel.enroll(courseId: course.id) }
                                            }
                                        }
                                    }
                                }
                            }
                            .padding()
                        }
                        .refreshable {
                            await viewModel.fetchCourses()
                        }
                    }
                }
            }
            .navigationTitle("Courses")
            .navigationDestination(for: Course.self) { course in
                CourseDetailView(courseId: course.id)
            }
            .task {
                await viewModel.fetchCourses()
            }
        }
        .tint(.brand600)
    }

    private func emptyState(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(.gray400)
            Text(title)
                .font(.headline)
                .foregroundColor(.gray900)
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.gray500)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

extension Course: Hashable {
    static func == (lhs: Course, rhs: Course) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}
