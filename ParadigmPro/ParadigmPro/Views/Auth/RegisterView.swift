import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Image(systemName: "person.badge.plus.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.paradigmBlue)

                Text("Create Account")
                    .font(.largeTitle.bold())

                Text("Start your learning journey")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.bottom, 12)

            // Form
            VStack(spacing: 16) {
                TextField("Full Name", text: $authVM.registerName)
                    .textContentType(.name)
                    .textFieldStyle(.roundedBorder)

                TextField("Email", text: $authVM.registerEmail)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .textFieldStyle(.roundedBorder)

                SecureField("Password", text: $authVM.registerPassword)
                    .textContentType(.newPassword)
                    .textFieldStyle(.roundedBorder)

                SecureField("Confirm Password", text: $authVM.registerConfirmPassword)
                    .textContentType(.newPassword)
                    .textFieldStyle(.roundedBorder)
            }

            if let error = authVM.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }

            Button(action: {
                Task { await authVM.register() }
            }) {
                if authVM.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Create Account")
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
