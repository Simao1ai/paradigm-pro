import Foundation

// Kept for API compatibility — this file now handles badge-related calls
struct OkResponse: Codable {
    let ok: Bool?
    let message: String?
}
