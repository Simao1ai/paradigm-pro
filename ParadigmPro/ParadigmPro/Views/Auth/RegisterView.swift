import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 0) {
            Text("Paradigm Pro")
                .font(.title.bold())
                .foregroundColor(.ppTextPrimary)

            Text("Create your account")
                .font(.subheadline)
                .foregroundColor(.ppTextSecondary)
                .padding(.top, 4)

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

                // Sign in with Apple
                Button(action: {
                    Task { await authVM.signInWithApple() }
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "apple.logo")
                            .font(.body.weight(.medium))
                        Text("Continue with Apple")
                            .font(.subheadline.weight(.semibold))
                    }
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.white)
                    .cornerRadius(10)
                }
                .disabled(authVM.isLoading)

                // Divider
                HStack {
                    Rectangle().fill(Color.ppBorder).frame(height: 1)
                    Text("or")
                        .font(.caption)
                        .foregroundColor(.ppTextMuted)
                        .padding(.horizontal, 12)
                    Rectangle().fill(Color.ppBorder).frame(height: 1)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Name")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.ppTextSecondary)

                    TextField("", text: $authVM.registerName)
                        .placeholder(when: authVM.registerName.isEmpty) {
                            Text("Your name").foregroundColor(.ppTextMuted)
                        }
                        .textContentType(.name)
                        .foregroundColor(.ppTextPrimary)
                        .darkInputStyle()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Email")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.ppTextSecondary)

                    TextField("", text: $authVM.registerEmail)
                        .placeholder(when: authVM.registerEmail.isEmpty) {
                            Text("you@example.com").foregroundColor(.ppTextMuted)
                        }
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .foregroundColor(.ppTextPrimary)
                        .darkInputStyle()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Password")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.ppTextSecondary)

                    SecureField("", text: $authVM.registerPassword)
                        .placeholder(when: authVM.registerPassword.isEmpty) {
                            Text("••••••••").foregroundColor(.ppTextMuted)
                        }
                        .textContentType(.newPassword)
                        .foregroundColor(.ppTextPrimary)
                        .darkInputStyle()
                }

                Button(action: {
                    Task { await authVM.register() }
                }) {
                    if authVM.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        HStack {
                            Text("Create account")
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
