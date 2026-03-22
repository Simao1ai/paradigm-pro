import Foundation
import Security

final class KeychainManager {
    static let shared = KeychainManager()
    private let service = Constants.keychainServiceName

    private init() {}

    // MARK: - Save

    func save(_ value: String, forKey key: String) {
        guard let data = value.data(using: .utf8) else { return }
        delete(key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    // MARK: - Read

    func read(_ key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }

        return string
    }

    // MARK: - Delete

    @discardableResult
    func delete(_ key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]

        return SecItemDelete(query as CFDictionary) == errSecSuccess
    }

    // MARK: - Token Convenience

    var authToken: String? {
        get { read(Constants.keychainTokenKey) }
        set {
            if let value = newValue {
                save(value, forKey: Constants.keychainTokenKey)
            } else {
                delete(Constants.keychainTokenKey)
            }
        }
    }

    var refreshToken: String? {
        get { read(Constants.keychainRefreshTokenKey) }
        set {
            if let value = newValue {
                save(value, forKey: Constants.keychainRefreshTokenKey)
            } else {
                delete(Constants.keychainRefreshTokenKey)
            }
        }
    }

    func clearTokens() {
        delete(Constants.keychainTokenKey)
        delete(Constants.keychainRefreshTokenKey)
    }
}
