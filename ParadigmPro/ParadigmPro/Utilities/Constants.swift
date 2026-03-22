import Foundation

enum Constants {
    // MARK: - API Configuration
    // Update this to your Replit deployment URL
    static let apiBaseURL = "https://paradigm-pro.replit.app/api"

    // MARK: - Keychain
    static let keychainServiceName = "com.paradigmpro.ios"
    static let keychainTokenKey = "auth_token"
    static let keychainRefreshTokenKey = "refresh_token"

    // MARK: - Video
    static let videoAutoSaveInterval: TimeInterval = 5.0
    static let videoAutoCompleteThreshold: Double = 0.9
}
