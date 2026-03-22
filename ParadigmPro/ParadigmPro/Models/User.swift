import Foundation

enum UserRole: String, Codable {
    case student = "STUDENT"
    case instructor = "INSTRUCTOR"
    case admin = "ADMIN"
}

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: UserRole
    let image: String?
    let createdAt: String?
    let updatedAt: String?
}

struct AuthResponse: Codable {
    let token: String
    let refreshToken: String
    let user: User
}

struct RegisterResponse: Codable {
    let id: String
    let email: String
    let name: String?
}
