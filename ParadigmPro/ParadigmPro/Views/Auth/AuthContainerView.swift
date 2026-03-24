import SwiftUI

struct AuthContainerView: View {
    @State private var showRegister = false
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        ZStack {
            // Hero gradient background (matching site: #1e1b4b → #4f46e5 → #f97316)
            PPGradient.hero
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: 50)

                    // Brand header
                    VStack(spacing: 8) {
                        Text("Break the Pattern.")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundColor(.ppTextPrimary)

                        Text("Own the Results.")
                            .font(.system(size: 28, weight: .bold, design: .serif))
                            .foregroundStyle(PPGradient.gold)
                    }
                    .padding(.bottom, 8)

                    if showRegister {
                        RegisterView()
                    } else {
                        LoginView()
                    }

                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showRegister.toggle()
                            authVM.errorMessage = nil
                        }
                    }) {
                        if showRegister {
                            HStack(spacing: 4) {
                                Text("Already have an account?")
                                    .foregroundColor(.ppTextSecondary)
                                Text("Sign in")
                                    .foregroundColor(.ppOrange)
                                    .fontWeight(.semibold)
                            }
                        } else {
                            HStack(spacing: 4) {
                                Text("Don't have an account?")
                                    .foregroundColor(.ppTextSecondary)
                                Text("Register")
                                    .foregroundColor(.ppOrange)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                    .font(.subheadline)
                    .padding(.top, 20)

                    Spacer(minLength: 60)
                }
                .padding(.horizontal, 24)
            }
        }
    }
}
