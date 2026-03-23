import Foundation

// Badge earned by user
struct UserBadge: Codable, Identifiable {
    let id: String
    let userId: String
    let badgeId: String
    let earnedAt: String?
}

struct BadgeDefinition: Codable, Identifiable {
    let id: String
    let slug: String
    let name: String
    let description: String?
    let icon: String?
    let badgeType: String
}
