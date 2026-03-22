import SwiftUI

struct CourseCardView: View {
    let course: Course
    let isEnrolled: Bool
    var onEnroll: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Thumbnail area with gradient overlay
            ZStack(alignment: .bottomLeading) {
                if let thumbnail = course.thumbnail, let url = URL(string: thumbnail) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        gradientPlaceholder
                    }
                } else {
                    gradientPlaceholder
                }
            }
            .frame(height: 110)
            .clipped()

            // Content
            VStack(alignment: .leading, spacing: 8) {
                Text(course.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(2)
                    .foregroundColor(.ppTextPrimary)

                Text(course.description)
                    .font(.caption)
                    .foregroundColor(.ppTextSecondary)
                    .lineLimit(2)

                Spacer(minLength: 0)

                if isEnrolled {
                    // Progress bar
                    VStack(alignment: .leading, spacing: 4) {
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(Color.ppBorder)
                                    .frame(height: 5)

                                RoundedRectangle(cornerRadius: 3)
                                    .fill(Color.ppOrange)
                                    .frame(width: max(geo.size.width * 0.0, 0), height: 5)
                            }
                        }
                        .frame(height: 5)
                    }
                } else if let onEnroll {
                    Button(action: onEnroll) {
                        Text("Enroll Now")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(
                                LinearGradient(
                                    colors: [.ppOrange, .ppOrangeLight],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(8)
                    }
                }
            }
            .padding(14)
        }
        .background(Color.ppSurface)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.ppBorder, lineWidth: 1)
        )
    }

    private var gradientPlaceholder: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 40/255, green: 30/255, blue: 70/255),
                    Color(red: 60/255, green: 40/255, blue: 80/255)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Image(systemName: "book.fill")
                .font(.system(size: 24))
                .foregroundColor(.white.opacity(0.3))
        }
    }
}
