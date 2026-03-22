import SwiftUI

struct WeekView: View {
    let week: Week

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if let description = week.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.gray600)
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardStyle()
                }

                if let lessons = week.lessons, !lessons.isEmpty {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Lessons")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.gray900)
                            .padding(.horizontal, 16)
                            .padding(.top, 16)
                            .padding(.bottom, 8)

                        ForEach(lessons) { lesson in
                            NavigationLink {
                                LessonView(lesson: lesson)
                            } label: {
                                HStack(spacing: 12) {
                                    Image(systemName: iconFor(lesson.lessonType))
                                        .foregroundColor(.brand600)
                                        .frame(width: 24)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(lesson.title)
                                            .font(.subheadline)
                                            .foregroundColor(.gray900)

                                        if let duration = lesson.videoDuration {
                                            Text(duration.formattedDuration)
                                                .font(.caption)
                                                .foregroundColor(.gray500)
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

                            if lesson.id != lessons.last?.id {
                                Divider().padding(.leading, 52)
                            }
                        }
                    }
                    .cardStyle()
                }

                if let materials = week.materials, !materials.isEmpty {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Materials")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.gray900)
                            .padding(.horizontal, 16)
                            .padding(.top, 16)
                            .padding(.bottom, 8)

                        ForEach(materials) { material in
                            MaterialRowView(material: material)
                            if material.id != materials.last?.id {
                                Divider()
                            }
                        }
                    }
                    .cardStyle()
                }
            }
            .padding()
        }
        .background(Color.paradigmBackground)
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
