import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        NavigationStack {
            ZStack {
                Color.paradigmBackground
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // User info card - matches web sidebar user section
                        HStack(spacing: 16) {
                            // Avatar circle - matches web: bg-brand-100 text-brand-700
                            ZStack {
                                Circle()
                                    .fill(Color.brand100)
                                    .frame(width: 56, height: 56)

                                Text(initials)
                                    .font(.title3.bold())
                                    .foregroundColor(.brand700)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(authVM.currentUser?.name ?? "Student")
                                    .font(.headline)
                                    .foregroundColor(.gray900)

                                Text(authVM.currentUser?.email ?? "")
                                    .font(.subheadline)
                                    .foregroundColor(.gray500)

                                if let role = authVM.currentUser?.role {
                                    Text(role.rawValue.capitalized)
                                        .font(.caption.weight(.medium))
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 2)
                                        .background(roleBadgeBackground(role))
                                        .foregroundColor(roleBadgeForeground(role))
                                        .cornerRadius(4)
                                }
                            }

                            Spacer()
                        }
                        .padding(16)
                        .cardStyle()

                        // App info card
                        VStack(spacing: 0) {
                            HStack {
                                Text("Version")
                                    .font(.subheadline)
                                    .foregroundColor(.gray700)
                                Spacer()
                                Text("1.0.0")
                                    .font(.subheadline)
                                    .foregroundColor(.gray500)
                            }
                            .padding(16)
                        }
                        .cardStyle()

                        // Sign out button - matches web: .btn-secondary w-full
                        Button(action: {
                            authVM.logout()
                        }) {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                Text("Sign Out")
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(.gray700)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.white)
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray300, lineWidth: 1)
                            )
                            .shadow(color: .black.opacity(0.04), radius: 1, y: 1)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Profile")
        }
        .tint(.brand600)
    }

    private var initials: String {
        guard let name = authVM.currentUser?.name, !name.isEmpty else { return "S" }
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(1)).uppercased()
    }

    // Role badge colors matching web
    private func roleBadgeBackground(_ role: UserRole) -> Color {
        switch role {
        case .admin: return Color(red: 243/255, green: 232/255, blue: 255/255) // purple-100
        case .instructor: return .statusBlue100
        case .student: return .gray100
        }
    }

    private func roleBadgeForeground(_ role: UserRole) -> Color {
        switch role {
        case .admin: return Color(red: 126/255, green: 34/255, blue: 206/255) // purple-700
        case .instructor: return .statusBlue700
        case .student: return .gray700
        }
    }
}
