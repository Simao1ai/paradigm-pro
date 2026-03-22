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
                        VStack(alignment: .leading, spacing: 10) {
                            Text(course.title)
                                .font(.title3.bold())
                                .foregroundColor(.ppTextPrimary)

                            Text(course.description)
                                .font(.subheadline)
                                .foregroundColor(.ppTextSecondary)

                            HStack {
                                Label("\(course.enrollmentCount) enrolled", systemImage: "person.2.fill")
                                Spacer()
                                Label("\(viewModel.weeks.count) weeks", systemImage: "calendar")
                            }
                            .font(.caption)
                            .foregroundColor(.ppTextMuted)
                        }
                        .padding(16)
                        .cardStyle()

                        // Weeks - numbered circles like the curriculum section
                        ForEach(Array(viewModel.weeks.enumerated()), id: \.element.id) { index, week in
                            weekSection(week, number: index + 1)
                        }
                    }
                    .padding()
                }
            }
        }
        .background(Color.ppBackground)
        .navigationTitle("Course Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .task {
            await viewModel.fetchCourseDetail(courseId: courseId)
        }
    }

    private func weekSection(_ week: Week, number: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: {
                withAnimation(.easeInOut(duration: 0.2)) {
                    if expandedWeeks.contains(week.id) {
                        expandedWeeks.remove(week.id)
                    } else {
                        expandedWeeks.insert(week.id)
                    }
                }
            }) {
                HStack(spacing: 14) {
                    // Orange numbered circle (matching site curriculum)
                    ZStack {
                        Circle()
                            .fill(Color.ppOrange)
                            .frame(width: 32, height: 32)

                        Text("\(number)")
                            .font(.subheadline.weight(.bold))
                            .foregroundColor(.white)
                    }

                    VStack(alignment: .leading, spacing: 3) {
                        Text(week.title)
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.ppTextPrimary)

                        if let lessons = week.lessons {
                            Text("\(lessons.count) lesson\(lessons.count == 1 ? "" : "s")")
                                .font(.caption)
                                .foregroundColor(.ppTextMuted)
                        }
                    }

                    Spacer()

                    Image(systemName: expandedWeeks.contains(week.id) ? "chevron.up" : "chevron.down")
                        .font(.caption.weight(.semibold))
                        .foregroundColor(.ppTextMuted)
                }
                .padding(16)
            }

            if expandedWeeks.contains(week.id) {
                if let lessons = week.lessons {
                    Rectangle()
                        .fill(Color.ppBorder)
                        .frame(height: 1)
                        .padding(.horizontal, 16)

                    ForEach(lessons) { lesson in
                        NavigationLink {
                            LessonView(lesson: lesson)
                        } label: {
                            lessonRow(lesson)
                        }
                        if lesson.id != lessons.last?.id {
                            Rectangle()
                                .fill(Color.ppBorder)
                                .frame(height: 1)
                                .padding(.leading, 56)
                        }
                    }
                }

                if let materials = week.materials, !materials.isEmpty {
                    Rectangle()
                        .fill(Color.ppBorder)
                        .frame(height: 1)
                        .padding(.horizontal, 16)
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
                .foregroundColor(.ppOrange)

            VStack(alignment: .leading, spacing: 3) {
                Text(lesson.title)
                    .font(.subheadline)
                    .foregroundColor(.ppTextPrimary)

                HStack(spacing: 8) {
                    Text(lesson.type.capitalized)
                        .font(.caption2.weight(.medium))
                        .foregroundColor(.ppTextMuted)

                    if let duration = lesson.videoDuration {
                        Text(duration.formattedDuration)
                            .font(.caption2)
                            .foregroundColor(.ppTextMuted)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption2)
                .foregroundColor(.ppTextMuted)
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
}

extension Week: Hashable {
    static func == (lhs: Week, rhs: Week) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
