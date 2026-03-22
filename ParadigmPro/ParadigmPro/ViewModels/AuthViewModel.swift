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
    @Published var registerConfirmPassword = ""

    private let authService = AuthService.shared

    init() {
        // Auto-login if token exists
        isAuthenticated = authService.isLoggedIn
    }

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
            errorMessage = "Please fill in all required fields"
            return
        }
        guard registerPassword == registerConfirmPassword else {
            errorMessage = "Passwords do not match"
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
            // Auto-login after registration
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
        registerConfirmPassword = ""
    }
}
