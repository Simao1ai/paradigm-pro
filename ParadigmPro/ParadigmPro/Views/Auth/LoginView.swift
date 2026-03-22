import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Header
            Text("Paradigm Pro")
                .font(.title.bold())
                .foregroundColor(.ppTextPrimary)

            Text("Sign in to your account")
                .font(.subheadline)
                .foregroundColor(.ppTextSecondary)
                .padding(.top, 4)

            // Card
            VStack(spacing: 18) {
                if let error = authVM.errorMessage {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.circle.fill")
                            .foregroundColor(.ppError)
                        Text(error)
                            .font(.subheadline)
                            .foregroundColor(.ppError)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(Color.ppError.opacity(0.1))
                    .cornerRadius(10)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Email")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.ppTextSecondary)

                    TextField("", text: $authVM.loginEmail)
                        .placeholder(when: authVM.loginEmail.isEmpty) {
                            Text("you@example.com").foregroundColor(.ppTextMuted)
                        }
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .darkInputStyle()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Password")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.ppTextSecondary)

                    SecureField("", text: $authVM.loginPassword)
                        .placeholder(when: authVM.loginPassword.isEmpty) {
                            Text("••••••••").foregroundColor(.ppTextMuted)
                        }
                        .textContentType(.password)
                        .darkInputStyle()
                }

                Button(action: {
                    Task { await authVM.login() }
                }) {
                    if authVM.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        HStack {
                            Text("Sign in")
                            Image(systemName: "arrow.right")
                                .font(.caption.weight(.bold))
                        }
                    }
                }
                .buttonStyle(PrimaryButtonStyle(isLoading: authVM.isLoading))
                .disabled(authVM.isLoading)
            }
            .padding(24)
            .cardStyle()
            .padding(.top, 28)
        }
    }
}

// Placeholder modifier for dark text fields
extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content
    ) -> some View {
        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
            self
        }
    }
}
