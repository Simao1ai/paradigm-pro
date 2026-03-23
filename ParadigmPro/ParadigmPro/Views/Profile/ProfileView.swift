import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @StateObject private var viewModel = ProfileViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // User info card
                        HStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [.ppOrange, .ppOrangeLight],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 56, height: 56)

                                Text(initials)
                                    .font(.title3.bold())
                                    .foregroundColor(.white)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text(viewModel.profile?.fullName ?? authVM.currentUser?.name ?? "Student")
                                    .font(.headline)
                                    .foregroundColor(.ppTextPrimary)

                                Text(authVM.currentUser?.email ?? "")
                                    .font(.subheadline)
                                    .foregroundColor(.ppTextSecondary)

                                if let role = viewModel.profile?.role {
                                    Text(role.capitalized)
                                        .font(.caption.weight(.medium))
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 2)
                                        .background(Color.ppOrange.opacity(0.15))
                                        .foregroundColor(.ppOrange)
                                        .cornerRadius(4)
                                }
                            }

                            Spacer()
                        }
                        .padding(16)
                        .cardStyle()

                        // Stats
                        if let profile = viewModel.profile {
                            HStack(spacing: 0) {
                                statItem(value: "\(profile.points ?? 0)", label: "Points")
                                Divider().frame(height: 30).background(Color.ppBorder)
                                statItem(value: "\(profile.level ?? 1)", label: "Level")
                            }
                            .padding(.vertical, 12)
                            .cardStyle()
                        }

                        // Version
                        VStack(spacing: 0) {
                            HStack {
                                Text("Version")
                                    .font(.subheadline)
                                    .foregroundColor(.ppTextSecondary)
                                Spacer()
                                Text("1.0.0")
                                    .font(.subheadline)
                                    .foregroundColor(.ppTextMuted)
                            }
                            .padding(16)
                        }
                        .cardStyle()

                        // Sign out
                        Button(action: { authVM.logout() }) {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                Text("Sign Out")
                            }
                        }
                        .buttonStyle(SecondaryButtonStyle())
                    }
                    .padding()
                }
            }
            .navigationTitle("Profile")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .task {
                await viewModel.fetchProfile()
            }
        }
        .tint(.ppOrange)
    }

    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3.weight(.bold))
                .foregroundColor(.ppOrange)
            Text(label)
                .font(.caption)
                .foregroundColor(.ppTextMuted)
        }
        .frame(maxWidth: .infinity)
    }

    private var initials: String {
        let name = viewModel.profile?.fullName ?? authVM.currentUser?.name ?? ""
        guard !name.isEmpty else { return "S" }
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(1)).uppercased()
    }
}
