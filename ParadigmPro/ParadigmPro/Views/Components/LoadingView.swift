import SwiftUI

struct LoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            ProgressView()
                .scaleEffect(1.2)
                .tint(.ppOrange)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.ppTextSecondary)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}
