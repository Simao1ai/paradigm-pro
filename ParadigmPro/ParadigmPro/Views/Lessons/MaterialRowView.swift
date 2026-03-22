import SwiftUI

struct MaterialRowView: View {
    let material: Material

    var body: some View {
        HStack(spacing: 12) {
            // File type badge
            Text(material.fileType.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.ppOrange)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(Color.ppOrange.opacity(0.15))
                .cornerRadius(4)

            VStack(alignment: .leading, spacing: 2) {
                Text(material.title)
                    .font(.subheadline)
                    .foregroundColor(.ppTextPrimary)

                Text(material.formattedFileSize)
                    .font(.caption)
                    .foregroundColor(.ppTextMuted)
            }

            Spacer()

            if let url = URL(string: material.fileUrl) {
                ShareLink(item: url) {
                    Image(systemName: "arrow.down.circle")
                        .font(.body)
                        .foregroundColor(.ppTextMuted)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }
}
