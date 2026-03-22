import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.paradigmBlue)

                Text("Paradigm Pro")
                    .font(.largeTitle.bold())

                Text("Sign in to continue")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.bottom, 20)

            // Form
            VStack(spacing: 16) {
                TextField("Email", text: $authVM.loginEmail)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .textFieldStyle(.roundedBorder)

                SecureField("Password", text: $authVM.loginPassword)
                    .textContentType(.password)
                    .textFieldStyle(.roundedBorder)
            }

            if let error = authVM.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }

            Button(action: {
                Task { await authVM.login() }
            }) {
                if authVM.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Sign In")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.paradigmBlue)
            .foregroundColor(.white)
            .cornerRadius(12)
            .disabled(authVM.isLoading)
        }
        .padding(32)
    }
}
