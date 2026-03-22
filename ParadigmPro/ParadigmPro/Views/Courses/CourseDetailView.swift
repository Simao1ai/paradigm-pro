import SwiftUI

struct CourseDetailView: View {
    let courseId: String
    @StateObject private var viewModel = CourseDetailViewModel()
    @State private var expandedWeeks: Set<String> = []

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView()
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error) {
                    Task { await viewModel.fetchCourseDetail(courseId: courseId) }
                }
            } else if let course = viewModel.course {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        // Course header
                        VStack(alignment: .leading, spacing: 8) {
                            Text(course.title)
                                .font(.title2.bold())

                            Text(course.description)
                                .font(.body)
                                .foregroundColor(.secondary)

                            HStack {
                                Label("\(course.enrollmentCount) enrolled", systemImage: "person.2.fill")
                                Spacer()
                                Label("\(viewModel.weeks.count) weeks", systemImage: "calendar")
                            }
                            .font(.caption)
                            .foregroundColor(.secondary)
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)

                        // Weeks list
                        ForEach(viewModel.weeks) { week in
                            weekSection(week)
                        }
                    }
                    .padding()
                }
                .background(Color.paradigmBackground)
            }
        }
        .navigationTitle("Course Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.fetchCourseDetail(courseId: courseId)
        }
    }

    private func weekSection(_ week: Week) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Week header (tappable to expand)
            Button(action: {
                withAnimation(.easeInOut(duration: 0.2)) {
                    if expandedWeeks.contains(week.id) {
                        expandedWeeks.remove(week.id)
                    } else {
                        expandedWeeks.insert(week.id)
                    }
                }
            }) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Week \(week.weekNumber)")
                            .font(.caption.bold())
                            .foregroundColor(.paradigmBlue)

                        Text(week.title)
                            .font(.headline)
                            .foregroundColor(.primary)

                        if let lessonCount = week.lessons?.count {
                            Text("\(lessonCount) lesson\(lessonCount == 1 ? "" : "s")")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }

                    Spacer()

                    Image(systemName: expandedWeeks.contains(week.id) ? "chevron.up" : "chevron.down")
                        .foregroundColor(.secondary)
                }
                .padding()
            }

            // Expanded lessons
            if expandedWeeks.contains(week.id) {
                if let lessons = week.lessons {
                    Divider()
                    ForEach(lessons) { lesson in
                        NavigationLink {
                            LessonView(lesson: lesson)
                        } label: {
                            lessonRow(lesson)
                        }
                        if lesson.id != lessons.last?.id {
                            Divider().padding(.leading, 48)
                        }
                    }
                }

                // Week materials
                if let materials = week.materials, !materials.isEmpty {
                    Divider()
                    ForEach(materials) { material in
                        MaterialRowView(material: material)
                    }
                }
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }

    private func lessonRow(_ lesson: Lesson) -> some View {
        HStack(spacing: 12) {
            Image(systemName: lessonIcon(lesson.lessonType))
                .frame(width: 24)
                .foregroundColor(.paradigmBlue)

            VStack(alignment: .leading, spacing: 2) {
                Text(lesson.title)
                    .font(.subheadline)
                    .foregroundColor(.primary)

                HStack(spacing: 8) {
                    Text(lesson.type.capitalized)
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    if let duration = lesson.videoDuration {
                        Text(duration.formattedDuration)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
    }

    private func lessonIcon(_ type: LessonType) -> String {
        switch type {
        case .video: return "play.circle.fill"
        case .reading: return "doc.text.fill"
        case .assignment: return "pencil.circle.fill"
        }
    }
}

extension Week: Hashable {
    static func == (lhs: Week, rhs: Week) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
