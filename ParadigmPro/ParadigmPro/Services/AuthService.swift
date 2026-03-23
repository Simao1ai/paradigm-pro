import Foundation

final class AuthService {
    static let shared = AuthService()
    private let api = APIClient.shared
    private let keychain = KeychainManager.shared

    private init() {}

    func login(email: String, password: String) async throws -> User {
        let response: AuthResponse = try await api.post(
            "/auth/mobile/login",
            body: ["email": email, "password": password],
            authenticated: false
        )

        keychain.authToken = response.token
        keychain.refreshToken = response.refreshToken
        return response.user
    }

    func register(name: String, email: String, password: String) async throws -> RegisterResponse {
        let response: RegisterResponse = try await api.post(
            "/auth/mobile/register",
            body: ["name": name, "email": email, "password": password],
            authenticated: false
        )
        return response
    }

    func logout() {
        keychain.clearTokens()
    }

    var isLoggedIn: Bool {
        keychain.authToken != nil
    }
}
