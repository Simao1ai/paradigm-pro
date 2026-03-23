import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String?
    let name: String?
    let role: String?
    let image: String?
}

struct Profile: Codable, Identifiable {
    let id: String
    let fullName: String
    let avatarUrl: String?
    let role: String
    let points: Int?
    let level: Int?
    let onboardingDone: Bool?
    let lastActiveAt: String?
    let createdAt: String?
}

struct AuthResponse: Codable {
    let token: String
    let refreshToken: String
    let user: User
}

struct RegisterResponse: Codable {
    let id: String
    let email: String?
    let name: String?
}
