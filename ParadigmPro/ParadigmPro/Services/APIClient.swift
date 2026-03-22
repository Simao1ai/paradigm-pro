import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case notFound
    case conflict(String)
    case badRequest(String)
    case serverError(String)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid server response"
        case .unauthorized: return "Please log in again"
        case .notFound: return "Resource not found"
        case .conflict(let msg): return msg
        case .badRequest(let msg): return msg
        case .serverError(let msg): return msg
        case .networkError(let err): return err.localizedDescription
        case .decodingError: return "Failed to parse server response"
        }
    }
}

final class APIClient {
    static let shared = APIClient()
    private let baseURL = Constants.apiBaseURL
    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30 // Longer timeout for Replit cold starts
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
        decoder = JSONDecoder()
    }

    // MARK: - Core Request

    func request<T: Decodable>(
        _ method: String,
        path: String,
        body: [String: Any]? = nil,
        authenticated: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if authenticated, let token = KeychainManager.shared.authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        case 401:
            // Try token refresh once
            if authenticated {
                let refreshed = try await refreshToken()
                if refreshed {
                    return try await self.request(method, path: path, body: body, authenticated: true)
                }
            }
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        case 409:
            let msg = parseErrorMessage(data) ?? "Conflict"
            throw APIError.conflict(msg)
        case 400:
            let msg = parseErrorMessage(data) ?? "Bad request"
            throw APIError.badRequest(msg)
        default:
            let msg = parseErrorMessage(data) ?? "Server error"
            throw APIError.serverError(msg)
        }
    }

    // MARK: - Convenience Methods

    func get<T: Decodable>(_ path: String, authenticated: Bool = true) async throws -> T {
        try await request("GET", path: path, authenticated: authenticated)
    }

    func post<T: Decodable>(_ path: String, body: [String: Any]? = nil, authenticated: Bool = true) async throws -> T {
        try await request("POST", path: path, body: body, authenticated: authenticated)
    }

    func patch<T: Decodable>(_ path: String, body: [String: Any]? = nil) async throws -> T {
        try await request("PATCH", path: path, body: body)
    }

    func delete<T: Decodable>(_ path: String, body: [String: Any]? = nil) async throws -> T {
        try await request("DELETE", path: path, body: body)
    }

    // MARK: - Token Refresh

    private func refreshToken() async throws -> Bool {
        guard let refreshToken = KeychainManager.shared.refreshToken else {
            return false
        }

        guard let url = URL(string: "\(baseURL)/auth/mobile/refresh") else {
            return false
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["refreshToken": refreshToken])

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            KeychainManager.shared.clearTokens()
            return false
        }

        struct RefreshResponse: Decodable {
            let token: String
            let refreshToken: String
        }

        guard let result = try? decoder.decode(RefreshResponse.self, from: data) else {
            return false
        }

        KeychainManager.shared.authToken = result.token
        KeychainManager.shared.refreshToken = result.refreshToken
        return true
    }

    // MARK: - Helpers

    private func parseErrorMessage(_ data: Data) -> String? {
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let error = json["error"] as? String {
            return error
        }
        return nil
    }
}
