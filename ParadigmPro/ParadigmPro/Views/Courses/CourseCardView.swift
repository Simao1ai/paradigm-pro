import SwiftUI

struct CourseCardView: View {
    let course: Course
    let isEnrolled: Bool
    var onEnroll: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Thumbnail
            if let thumbnail = course.thumbnail, let url = URL(string: thumbnail) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(16/9, contentMode: .fill)
                } placeholder: {
                    thumbnailPlaceholder
                }
                .frame(height: 100)
                .clipped()
                .cornerRadius(8)
            } else {
                thumbnailPlaceholder
                    .frame(height: 100)
                    .cornerRadius(8)
            }

            // Title
            Text(course.title)
                .font(.headline)
                .lineLimit(2)
                .foregroundColor(.primary)

            // Description
            Text(course.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(2)

            Spacer()

            // Bottom action
            if isEnrolled {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.paradigmGreen)
                    Text("Enrolled")
                        .font(.caption)
                        .foregroundColor(.paradigmGreen)
                }
            } else if let onEnroll {
                Button(action: onEnroll) {
                    Text("Enroll")
                        .font(.caption.bold())
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                        .background(Color.paradigmBlue)
                        .foregroundColor(.white)
                        .cornerRadius(6)
                }
            }
        }
        .padding(12)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
    }

    private var thumbnailPlaceholder: some View {
        Rectangle()
            .fill(Color.paradigmBlue.opacity(0.1))
            .overlay(
                Image(systemName: "book.fill")
                    .font(.title2)
                    .foregroundColor(.paradigmBlue.opacity(0.4))
            )
    }
}
