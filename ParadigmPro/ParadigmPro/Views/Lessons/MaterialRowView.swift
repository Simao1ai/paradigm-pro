import SwiftUI

struct MaterialRowView: View {
    let asset: LessonAsset

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: iconFor(asset.assetType))
                .font(.body)
                .foregroundColor(.ppOrange)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(asset.label)
                    .font(.subheadline)
                    .foregroundColor(.ppTextPrimary)

                Text(asset.assetType.uppercased())
                    .font(.caption2.weight(.medium))
                    .foregroundColor(.ppTextMuted)
            }

            Spacer()

            Image(systemName: "arrow.down.circle")
                .foregroundColor(.ppTextMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    private func iconFor(_ type: String) -> String {
        switch type.lowercased() {
        case "pdf": return "doc.fill"
        case "audio": return "headphones"
        case "worksheet": return "doc.text.fill"
        default: return "doc.fill"
        }
    }
}
