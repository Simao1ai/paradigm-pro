import SwiftUI

struct MaterialRowView: View {
    let material: Material

    var body: some View {
        HStack(spacing: 12) {
            // File type badge - matches web: red-50 bg
            Text(material.fileType.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.statusRed600)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(Color.statusRed50)
                .cornerRadius(4)

            VStack(alignment: .leading, spacing: 2) {
                Text(material.title)
                    .font(.subheadline)
                    .foregroundColor(.gray900)

                Text(material.formattedFileSize)
                    .font(.caption)
                    .foregroundColor(.gray500)
            }

            Spacer()

            if let url = URL(string: material.fileUrl) {
                ShareLink(item: url) {
                    Image(systemName: "arrow.down.circle")
                        .font(.body)
                        .foregroundColor(.gray400)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }
}
