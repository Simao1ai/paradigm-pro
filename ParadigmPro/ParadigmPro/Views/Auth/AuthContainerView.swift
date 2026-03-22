import SwiftUI

struct AuthContainerView: View {
    @State private var showRegister = false
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        ZStack {
            // Dark gradient background matching site hero
            LinearGradient(
                colors: [
                    Color.ppBackground,
                    Color(red: 30/255, green: 25/255, blue: 55/255),
                    Color.ppBackground
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: 60)

                    if showRegister {
                        RegisterView()
                    } else {
                        LoginView()
                    }

                    // Toggle link
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showRegister.toggle()
                            authVM.errorMessage = nil
                        }
                    }) {
                        if showRegister {
                            HStack(spacing: 4) {
                                Text("Already have an account?")
                                    .foregroundColor(.ppTextMuted)
                                Text("Sign in")
                                    .foregroundColor(.ppOrange)
                                    .fontWeight(.medium)
                            }
                        } else {
                            HStack(spacing: 4) {
                                Text("Don't have an account?")
                                    .foregroundColor(.ppTextMuted)
                                Text("Register")
                                    .foregroundColor(.ppOrange)
                                    .fontWeight(.medium)
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
