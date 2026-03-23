import Foundation
import SwiftUI

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    // Login fields
    @Published var loginEmail = ""
    @Published var loginPassword = ""

    // Register fields
    @Published var registerName = ""
    @Published var registerEmail = ""
    @Published var registerPassword = ""

    private let authService = AuthService.shared
    private let appleSignIn = AppleSignInCoordinator()

    init() {
        isAuthenticated = authService.isLoggedIn
    }

    // MARK: - Email/Password

    func login() async {
        guard !loginEmail.isEmpty, !loginPassword.isEmpty else {
            errorMessage = "Please enter email and password"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            let user = try await authService.login(email: loginEmail, password: loginPassword)
            currentUser = user
            isAuthenticated = true
            clearLoginFields()
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func register() async {
        guard !registerEmail.isEmpty, !registerPassword.isEmpty else {
            errorMessage = "Email and password are required"
            return
        }
        guard registerPassword.count >= 6 else {
            errorMessage = "Password must be at least 6 characters"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            _ = try await authService.register(
                name: registerName,
                email: registerEmail,
                password: registerPassword
            )
            let user = try await authService.login(email: registerEmail, password: registerPassword)
            currentUser = user
            isAuthenticated = true
            clearRegisterFields()
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Apple Sign In

    func signInWithApple() async {
        isLoading = true
        errorMessage = nil

        do {
            let result = try await appleSignIn.signIn()
            let user = try await authService.socialLogin(
                provider: "apple",
                identityToken: result.identityToken,
                email: result.email,
                fullName: result.fullName
            )
            currentUser = user
            isAuthenticated = true
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            // User cancelled — don't show error
            let nsError = error as NSError
            if nsError.domain == "com.apple.AuthenticationServices.AuthorizationError" && nsError.code == 1001 {
                // Cancelled
            } else {
                errorMessage = error.localizedDescription
            }
        }

        isLoading = false
    }

    // MARK: - Logout

    func logout() {
        authService.logout()
        currentUser = nil
        isAuthenticated = false
    }

    private func clearLoginFields() {
        loginEmail = ""
        loginPassword = ""
    }

    private func clearRegisterFields() {
        registerName = ""
        registerEmail = ""
        registerPassword = ""
    }
}
