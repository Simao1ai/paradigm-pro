import SwiftUI

struct CourseCardView: View {
    let course: Course
    let isEnrolled: Bool
    var onEnroll: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header gradient - matches web: gradient-to-br from-brand-500 to-brand-700 (enrolled)
            // or from-gray-600 to-gray-800 (available)
            ZStack {
                if isEnrolled {
                    LinearGradient(
                        colors: [.brand500, .brand700],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                } else {
                    LinearGradient(
                        colors: [.gray600, Color(red: 31/255, green: 41/255, blue: 55/255)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }

                if let thumbnail = course.thumbnail, let url = URL(string: thumbnail) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Image(systemName: "book.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white.opacity(0.5))
                    }
                } else {
                    Image(systemName: "book.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            .frame(height: 100)
            .clipped()

            // Content - matches web: p-5
            VStack(alignment: .leading, spacing: 8) {
                Text(course.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(2)
                    .foregroundColor(.gray900)

                Text(course.description)
                    .font(.caption)
                    .foregroundColor(.gray500)
                    .lineLimit(2)

                Spacer(minLength: 0)

                // Progress bar for enrolled courses - matches web
                if isEnrolled {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray200)
                                .frame(height: 6)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.brand600)
                                .frame(width: geo.size.width * 0.0, height: 6)
                        }
                    }
                    .frame(height: 6)
                } else if let onEnroll {
                    // Enroll button - matches web: .btn-primary
                    Button(action: onEnroll) {
                        Text("Enroll Now")
                            .font(.caption.weight(.medium))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.brand600)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(14)
        }
        .cardStyle()
    }
}
