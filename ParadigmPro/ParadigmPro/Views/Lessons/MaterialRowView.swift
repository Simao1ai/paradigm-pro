import SwiftUI

struct MaterialRowView: View {
    let material: Material

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: iconForFileType(material.fileType))
                .font(.title3)
                .foregroundColor(.paradigmBlue)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(material.title)
                    .font(.subheadline)

                Text("\(material.fileType.uppercased()) - \(material.formattedFileSize)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if let url = URL(string: material.fileUrl) {
                ShareLink(item: url) {
                    Image(systemName: "square.and.arrow.down")
                        .foregroundColor(.paradigmBlue)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    private func iconForFileType(_ type: String) -> String {
        switch type.lowercased() {
        case "pdf": return "doc.fill"
        case "doc", "docx": return "doc.text.fill"
        case "xls", "xlsx": return "tablecells.fill"
        case "ppt", "pptx": return "rectangle.split.3x1.fill"
        case "zip", "rar": return "doc.zipper"
        case "mp4", "mov", "avi": return "film.fill"
        case "mp3", "wav": return "speaker.wave.2.fill"
        case "png", "jpg", "jpeg", "gif": return "photo.fill"
        default: return "doc.fill"
        }
    }
}
