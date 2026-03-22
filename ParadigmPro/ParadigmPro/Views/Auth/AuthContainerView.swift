import SwiftUI

struct AuthContainerView: View {
    @State private var showRegister = false

    var body: some View {
        NavigationStack {
            ScrollView {
                if showRegister {
                    RegisterView()
                } else {
                    LoginView()
                }

                Button(action: { showRegister.toggle() }) {
                    if showRegister {
                        Text("Already have an account? **Sign In**")
                    } else {
                        Text("Don't have an account? **Create one**")
                    }
                }
                .font(.subheadline)
                .foregroundColor(.paradigmBlue)
                .padding(.top, 8)
            }
        }
    }
}
