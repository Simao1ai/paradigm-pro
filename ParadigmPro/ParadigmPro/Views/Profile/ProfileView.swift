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
                                    .fill(PPGradient.cta)
                                    .frame(width: 60, height: 60)
                                    .shadow(color: .ppOrange.opacity(0.4), radius: 12, x: 0, y: 0)

                                Text(initials)
                                    .font(.title3.bold())
                                    .foregroundColor(.white)
                            }

                            VStack(alignment: .leading, spacing: 5) {
                                Text(viewModel.profile?.fullName ?? authVM.currentUser?.name ?? "Student")
                                    .font(.headline)
                                    .foregroundColor(.ppTextPrimary)

                                Text(authVM.currentUser?.email ?? "")
                                    .font(.subheadline)
                                    .foregroundColor(.ppTextSecondary)

                                if let role = viewModel.profile?.role {
                                    Text(role.capitalized)
                                        .font(.caption.weight(.semibold))
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 3)
                                        .background(PPGradient.cta)
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                }
                            }

                            Spacer()
                        }
                        .padding(20)
                        .cardStyle()

                        // Stats
                        if let profile = viewModel.profile {
                            HStack(spacing: 12) {
                                statItem(
                                    value: "\(profile.points ?? 0)",
                                    label: "Points",
                                    icon: "bolt.fill",
                                    color: .ppOrange
                                )
                                statItem(
                                    value: "\(profile.level ?? 1)",
                                    label: "Level",
                                    icon: "arrow.up.circle.fill",
                                    color: .ppIconBlue
                                )
                            }
                        }

                        // App info
                        VStack(spacing: 0) {
                            infoRow(label: "Version", value: "1.0.0")
                        }
                        .cardStyle()

                        // Sign out
                        Button(action: { authVM.logout() }) {
                            HStack(spacing: 8) {
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

    private func statItem(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
            Text(value)
                .font(.title2.weight(.bold))
                .foregroundColor(.ppTextPrimary)
            Text(label)
                .font(.caption2.weight(.medium))
                .foregroundColor(.ppTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .cardStyle()
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.ppTextSecondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .foregroundColor(.ppTextMuted)
        }
        .padding(16)
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
