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
                        // Course header card
                        VStack(alignment: .leading, spacing: 8) {
                            Text(course.title)
                                .font(.title3.bold())
                                .foregroundColor(.gray900)

                            Text(course.description)
                                .font(.subheadline)
                                .foregroundColor(.gray600)

                            HStack {
                                Label("\(course.enrollmentCount) enrolled", systemImage: "person.2.fill")
                                Spacer()
                                Label("\(viewModel.weeks.count) weeks", systemImage: "calendar")
                            }
                            .font(.caption)
                            .foregroundColor(.gray500)
                        }
                        .padding(16)
                        .cardStyle()

                        // Weeks - matches web: accordion cards
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
            // Week header
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
                            .foregroundColor(.brand600)

                        Text(week.title)
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.gray900)

                        if let lessons = week.lessons {
                            Text("\(lessons.count) lesson\(lessons.count == 1 ? "" : "s")")
                                .font(.caption)
                                .foregroundColor(.gray500)
                        }
                    }

                    Spacer()

                    Image(systemName: expandedWeeks.contains(week.id) ? "chevron.up" : "chevron.down")
                        .font(.caption.weight(.semibold))
                        .foregroundColor(.gray400)
                }
                .padding(16)
            }

            if expandedWeeks.contains(week.id) {
                if let lessons = week.lessons {
                    Divider().padding(.horizontal, 16)

                    ForEach(lessons) { lesson in
                        NavigationLink {
                            LessonView(lesson: lesson)
                        } label: {
                            lessonRow(lesson)
                        }
                        if lesson.id != lessons.last?.id {
                            Divider().padding(.leading, 56)
                        }
                    }
                }

                if let materials = week.materials, !materials.isEmpty {
                    Divider().padding(.horizontal, 16)
                    ForEach(materials) { material in
                        MaterialRowView(material: material)
                    }
                }
            }
        }
        .cardStyle()
    }

    private func lessonRow(_ lesson: Lesson) -> some View {
        HStack(spacing: 12) {
            Image(systemName: lessonIcon(lesson.lessonType))
                .frame(width: 24)
                .foregroundColor(.brand600)

            VStack(alignment: .leading, spacing: 2) {
                Text(lesson.title)
                    .font(.subheadline)
                    .foregroundColor(.gray900)

                HStack(spacing: 8) {
                    // Lesson type badge - matches web badge colors
                    Text(lesson.type.capitalized)
                        .font(.caption2.weight(.medium))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(badgeBackground(lesson.lessonType))
                        .foregroundColor(badgeForeground(lesson.lessonType))
                        .cornerRadius(4)

                    if let duration = lesson.videoDuration {
                        Text(duration.formattedDuration)
                            .font(.caption2)
                            .foregroundColor(.gray500)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundColor(.gray400)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    private func lessonIcon(_ type: LessonType) -> String {
        switch type {
        case .video: return "play.circle.fill"
        case .reading: return "doc.text.fill"
        case .assignment: return "pencil.circle.fill"
        }
    }

    private func badgeBackground(_ type: LessonType) -> Color {
        switch type {
        case .video: return .statusBlue100
        case .reading: return .statusGreen100
        case .assignment: return .statusOrange100
        }
    }

    private func badgeForeground(_ type: LessonType) -> Color {
        switch type {
        case .video: return .statusBlue700
        case .reading: return .statusGreen700
        case .assignment: return .statusOrange700
        }
    }
}

extension Week: Hashable {
    static func == (lhs: Week, rhs: Week) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
