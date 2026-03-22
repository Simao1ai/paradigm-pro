import SwiftUI

struct WeekView: View {
    let week: Week

    var body: some View {
        List {
            if let description = week.description {
                Section {
                    Text(description)
                        .font(.body)
                        .foregroundColor(.secondary)
                }
            }

            if let lessons = week.lessons, !lessons.isEmpty {
                Section("Lessons") {
                    ForEach(lessons) { lesson in
                        NavigationLink {
                            LessonView(lesson: lesson)
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: iconFor(lesson.lessonType))
                                    .foregroundColor(.paradigmBlue)
                                    .frame(width: 24)

                                VStack(alignment: .leading) {
                                    Text(lesson.title)
                                        .font(.subheadline)

                                    if let duration = lesson.videoDuration {
                                        Text(duration.formattedDuration)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if let materials = week.materials, !materials.isEmpty {
                Section("Materials") {
                    ForEach(materials) { material in
                        MaterialRowView(material: material)
                    }
                }
            }
        }
        .navigationTitle("Week \(week.weekNumber): \(week.title)")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func iconFor(_ type: LessonType) -> String {
        switch type {
        case .video: return "play.circle.fill"
        case .reading: return "doc.text.fill"
        case .assignment: return "pencil.circle.fill"
        }
    }
}
