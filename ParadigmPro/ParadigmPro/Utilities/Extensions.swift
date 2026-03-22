import SwiftUI

// MARK: - Date Formatting

extension String {
    var asDate: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: self) ?? ISO8601DateFormatter().date(from: self)
    }

    var relativeDate: String {
        guard let date = asDate else { return self }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Color

extension Color {
    static let paradigmBlue = Color(red: 0.2, green: 0.4, blue: 0.9)
    static let paradigmGreen = Color(red: 0.2, green: 0.8, blue: 0.4)
    static let paradigmBackground = Color(.systemGroupedBackground)
}

// MARK: - Int Duration Formatting

extension Int {
    var formattedDuration: String {
        let hours = self / 3600
        let minutes = (self % 3600) / 60
        let seconds = self % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        }
        return String(format: "%d:%02d", minutes, seconds)
    }
}
