import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        NavigationStack {
            List {
                // User info section
                Section {
                    HStack(spacing: 16) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.paradigmBlue)

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authVM.currentUser?.name ?? "Student")
                                .font(.title3.bold())

                            Text(authVM.currentUser?.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)

                            if let role = authVM.currentUser?.role {
                                Text(role.rawValue.capitalized)
                                    .font(.caption.bold())
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color.paradigmBlue.opacity(0.1))
                                    .foregroundColor(.paradigmBlue)
                                    .cornerRadius(4)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }

                // App info
                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                }

                // Logout
                Section {
                    Button(role: .destructive, action: {
                        authVM.logout()
                    }) {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Sign Out")
                        }
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
}
