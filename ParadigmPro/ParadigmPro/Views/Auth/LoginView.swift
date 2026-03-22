import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Header - matches web: text-3xl font-bold + gray subtitle
            Text("Paradigm Pro")
                .font(.title.bold())
                .foregroundColor(.gray900)

            Text("Sign in to your account")
                .font(.subheadline)
                .foregroundColor(.gray500)
                .padding(.top, 4)

            // Card container - matches web: .card p-8
            VStack(spacing: 16) {
                // Error message - matches web: rounded-lg bg-red-50 p-3 text-sm text-red-600
                if let error = authVM.errorMessage {
                    Text(error)
                        .font(.subheadline)
                        .foregroundColor(.statusRed600)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(Color.statusRed50)
                        .cornerRadius(8)
                }

                // Email field with label
                VStack(alignment: .leading, spacing: 4) {
                    Text("Email")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.gray700)

                    TextField("you@example.com", text: $authVM.loginEmail)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .inputFieldStyle()
                }

                // Password field with label
                VStack(alignment: .leading, spacing: 4) {
                    Text("Password")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.gray700)

                    SecureField("••••••••", text: $authVM.loginPassword)
                        .textContentType(.password)
                        .inputFieldStyle()
                }

                // Sign in button - matches web: .btn-primary w-full
                Button(action: {
                    Task { await authVM.login() }
                }) {
                    if authVM.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Sign in")
                    }
                }
                .buttonStyle(PrimaryButtonStyle(isLoading: authVM.isLoading))
                .disabled(authVM.isLoading)
            }
            .padding(24)
            .cardStyle()
            .padding(.top, 24)
        }
    }
}
