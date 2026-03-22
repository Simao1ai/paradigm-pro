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

// MARK: - Brand Colors (matching myparadigmpro.com)

extension Color {
    // Dark navy backgrounds
    static let ppBackground = Color(red: 26/255, green: 26/255, blue: 46/255)       // #1a1a2e - main bg
    static let ppSurface = Color(red: 37/255, green: 37/255, blue: 67/255)           // #252543 - card bg
    static let ppSurfaceLight = Color(red: 45/255, green: 45/255, blue: 80/255)      // #2d2d50 - hover/elevated
    static let ppBorder = Color(red: 55/255, green: 55/255, blue: 90/255)            // #37375a - subtle borders

    // Orange accent (primary CTA)
    static let ppOrange = Color(red: 255/255, green: 107/255, blue: 53/255)          // #ff6b35
    static let ppOrangeLight = Color(red: 255/255, green: 140/255, blue: 90/255)     // lighter for gradients
    static let ppOrangeDark = Color(red: 230/255, green: 80/255, blue: 30/255)       // darker press state

    // Coral/pink accent ("Own the Results" text)
    static let ppCoral = Color(red: 255/255, green: 120/255, blue: 100/255)          // #ff7864

    // Text colors
    static let ppTextPrimary = Color.white
    static let ppTextSecondary = Color(red: 180/255, green: 180/255, blue: 200/255)  // light gray-blue
    static let ppTextMuted = Color(red: 130/255, green: 130/255, blue: 160/255)      // muted

    // Feature icon circle colors (from the "What's Included" section)
    static let ppIconBlue = Color(red: 59/255, green: 130/255, blue: 246/255)        // blue
    static let ppIconOrange = Color(red: 249/255, green: 115/255, blue: 22/255)      // orange
    static let ppIconGreen = Color(red: 34/255, green: 197/255, blue: 94/255)        // green
    static let ppIconPurple = Color(red: 168/255, green: 85/255, blue: 247/255)      // purple
    static let ppIconRed = Color(red: 239/255, green: 68/255, blue: 68/255)          // red
    static let ppIconYellow = Color(red: 234/255, green: 179/255, blue: 8/255)       // yellow

    // Status colors
    static let ppSuccess = Color(red: 34/255, green: 197/255, blue: 94/255)
    static let ppError = Color(red: 239/255, green: 68/255, blue: 68/255)

    // Legacy aliases for compatibility
    static let paradigmBlue = ppOrange
    static let paradigmGreen = ppSuccess
    static let paradigmBackground = ppBackground
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
            .background(Color.ppSurface)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.ppBorder, lineWidth: 1)
            )
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var isLoading = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                LinearGradient(
                    colors: [Color.ppOrange, Color.ppOrangeLight],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(10)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .opacity(isLoading ? 0.6 : 1)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.medium))
            .foregroundColor(.ppTextPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.ppSurface)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.ppBorder, lineWidth: 1)
            )
            .opacity(configuration.isPressed ? 0.85 : 1)
    }
}

struct DarkInputFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.subheadline)
            .foregroundColor(.ppTextPrimary)
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color.ppSurfaceLight)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.ppBorder, lineWidth: 1)
            )
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }

    func darkInputStyle() -> some View {
        modifier(DarkInputFieldStyle())
    }
}
