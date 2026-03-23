import SwiftUI

// Kept for Xcode project compatibility — lesson rows are now inline in CourseListView.
struct CourseCardView: View {
    let lesson: Lesson
    let isCompleted: Bool

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(isCompleted ? Color.ppSuccess : Color.ppOrange)
                    .frame(width: 36, height: 36)

                if isCompleted {
                    Image(systemName: "checkmark")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.white)
                } else {
                    Text("\(lesson.lessonNumber)")
                        .font(.subheadline.weight(.bold))
                        .foregroundColor(.white)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(lesson.title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.ppTextPrimary)

                if let subtitle = lesson.subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.ppTextSecondary)
                        .lineLimit(1)
                }
            }

            Spacer()
        }
        .padding(14)
        .cardStyle()
    }
}
