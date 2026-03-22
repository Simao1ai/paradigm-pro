import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Header - matches web register page
            Text("Paradigm Pro")
                .font(.title.bold())
                .foregroundColor(.gray900)

            Text("Create your account")
                .font(.subheadline)
                .foregroundColor(.gray500)
                .padding(.top, 4)

            // Card container
            VStack(spacing: 16) {
                // Error message
                if let error = authVM.errorMessage {
                    Text(error)
                        .font(.subheadline)
                        .foregroundColor(.statusRed600)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(Color.statusRed50)
                        .cornerRadius(8)
                }

                // Name field (optional, like web)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Name")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.gray700)

                    TextField("Your name", text: $authVM.registerName)
                        .textContentType(.name)
                        .inputFieldStyle()
                }

                // Email field
                VStack(alignment: .leading, spacing: 4) {
                    Text("Email")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.gray700)

                    TextField("you@example.com", text: $authVM.registerEmail)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .inputFieldStyle()
                }

                // Password field (no confirm - matches web)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Password")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.gray700)

                    SecureField("••••••••", text: $authVM.registerPassword)
                        .textContentType(.newPassword)
                        .inputFieldStyle()
                }

                // Create account button
                Button(action: {
                    Task { await authVM.register() }
                }) {
                    if authVM.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Create account")
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
