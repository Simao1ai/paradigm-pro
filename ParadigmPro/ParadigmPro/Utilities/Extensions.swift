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

// MARK: - Brand Colors (matching web app tailwind.config.ts)

extension Color {
    // Brand blue palette from web: brand-50 through brand-900
    static let brand50 = Color(red: 240/255, green: 245/255, blue: 255/255)   // #f0f5ff
    static let brand100 = Color(red: 224/255, green: 234/255, blue: 255/255)  // #e0eaff
    static let brand200 = Color(red: 194/255, green: 213/255, blue: 255/255)  // #c2d5ff
    static let brand500 = Color(red: 51/255, green: 102/255, blue: 255/255)   // #3366ff
    static let brand600 = Color(red: 26/255, green: 77/255, blue: 255/255)    // #1a4dff
    static let brand700 = Color(red: 0/255, green: 51/255, blue: 230/255)     // #0033e6

    // Semantic aliases matching web usage
    static let paradigmBlue = brand600
    static let paradigmGreen = Color(red: 21/255, green: 128/255, blue: 61/255) // green-700 (#15803d)
    static let paradigmBackground = Color(red: 249/255, green: 250/255, blue: 251/255) // gray-50

    // Status colors from web
    static let statusGreen100 = Color(red: 220/255, green: 252/255, blue: 231/255)
    static let statusGreen700 = Color(red: 21/255, green: 128/255, blue: 61/255)
    static let statusYellow100 = Color(red: 254/255, green: 249/255, blue: 195/255)
    static let statusYellow700 = Color(red: 161/255, green: 98/255, blue: 7/255)
    static let statusRed50 = Color(red: 254/255, green: 242/255, blue: 242/255)
    static let statusRed600 = Color(red: 220/255, green: 38/255, blue: 38/255)
    static let statusBlue100 = Color(red: 219/255, green: 234/255, blue: 254/255)
    static let statusBlue700 = Color(red: 29/255, green: 78/255, blue: 216/255)
    static let statusOrange100 = Color(red: 255/255, green: 237/255, blue: 213/255)
    static let statusOrange700 = Color(red: 194/255, green: 65/255, blue: 12/255)

    // Gray palette
    static let gray50 = Color(red: 249/255, green: 250/255, blue: 251/255)
    static let gray100 = Color(red: 243/255, green: 244/255, blue: 246/255)
    static let gray200 = Color(red: 229/255, green: 231/255, blue: 235/255)
    static let gray300 = Color(red: 209/255, green: 213/255, blue: 219/255)
    static let gray400 = Color(red: 156/255, green: 163/255, blue: 175/255)
    static let gray500 = Color(red: 107/255, green: 114/255, blue: 128/255)
    static let gray600 = Color(red: 75/255, green: 85/255, blue: 99/255)
    static let gray700 = Color(red: 55/255, green: 65/255, blue: 81/255)
    static let gray900 = Color(red: 17/255, green: 24/255, blue: 39/255)
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

// MARK: - Reusable View Modifiers

struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray200, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.04), radius: 2, y: 1)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var isLoading = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.medium))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(configuration.isPressed ? Color.brand700 : Color.brand600)
            .cornerRadius(8)
            .shadow(color: .black.opacity(0.06), radius: 1, y: 1)
            .opacity(isLoading ? 0.5 : 1)
    }
}

struct InputFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.subheadline)
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.white)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.gray300, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.04), radius: 1, y: 1)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }

    func inputFieldStyle() -> some View {
        modifier(InputFieldStyle())
    }
}
