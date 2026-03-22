import SwiftUI

struct LoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            ProgressView()
                .scaleEffect(1.2)
                .tint(.brand600)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.gray500)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}
