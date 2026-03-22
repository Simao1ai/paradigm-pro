import SwiftUI

struct ErrorView: View {
    let message: String
    var onRetry: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Spacer()

            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundColor(.statusOrange700)

            Text("Something went wrong")
                .font(.headline)
                .foregroundColor(.gray900)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.gray500)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if let onRetry {
                Button(action: onRetry) {
                    Text("Try Again")
                }
                .buttonStyle(PrimaryButtonStyle())
                .frame(width: 160)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}
