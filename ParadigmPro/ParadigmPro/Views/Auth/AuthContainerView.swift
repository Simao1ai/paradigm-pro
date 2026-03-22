import SwiftUI

struct AuthContainerView: View {
    @State private var showRegister = false
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        // Matches web: min-h-screen items-center justify-center bg-gray-50 px-4
        ZStack {
            Color.paradigmBackground
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: 40)

                    if showRegister {
                        RegisterView()
                    } else {
                        LoginView()
                    }

                    // Toggle link - matches web: mt-4 text-center text-sm text-gray-500
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showRegister.toggle()
                            authVM.errorMessage = nil
                        }
                    }) {
                        if showRegister {
                            HStack(spacing: 4) {
                                Text("Already have an account?")
                                    .foregroundColor(.gray500)
                                Text("Sign in")
                                    .foregroundColor(.brand600)
                                    .fontWeight(.medium)
                            }
                        } else {
                            HStack(spacing: 4) {
                                Text("Don't have an account?")
                                    .foregroundColor(.gray500)
                                Text("Register")
                                    .foregroundColor(.brand600)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                    .font(.subheadline)
                    .padding(.top, 16)

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 24)
            }
        }
    }
}
