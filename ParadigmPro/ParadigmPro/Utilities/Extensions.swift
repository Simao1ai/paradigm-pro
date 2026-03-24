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

// MARK: - Brand Colors (exact match: myparadigmpro.com Tailwind config)

extension Color {
    // Navy backgrounds (from tailwind.config.ts semantic tokens)
    static let ppBackground = Color(red: 0x1e/255, green: 0x1b/255, blue: 0x4b/255)     // #1e1b4b brand-navy
    static let ppSurface = Color(red: 0x27/255, green: 0x25/255, blue: 0x5a/255)         // #27255a brand-navy-mid (card)
    static let ppSurfaceLight = Color(red: 0x31/255, green: 0x2e/255, blue: 0x7a/255)    // #312e7a brand-navy-light
    static let ppBorder = Color(red: 0x31/255, green: 0x2e/255, blue: 0x7a/255)          // #312e7a (border/input)

    // Primary gold (CTA)
    static let ppOrange = Color(red: 0xf9/255, green: 0x73/255, blue: 0x16/255)          // #f97316 brand-gold
    static let ppOrangeLight = Color(red: 0xfb/255, green: 0x92/255, blue: 0x3c/255)     // #fb923c brand-gold-light
    static let ppOrangeDark = Color(red: 0xea/255, green: 0x6a/255, blue: 0x00/255)      // #ea6a00 brand-gold-dark

    // Accent pink
    static let ppPink = Color(red: 0xec/255, green: 0x48/255, blue: 0x99/255)            // #ec4899 brand-pink
    static let ppPinkLight = Color(red: 0xf4/255, green: 0x72/255, blue: 0xb6/255)       // #f472b6 brand-pink-light
    static let ppCoral = ppPink

    // Indigo (used in hero/CTA gradients)
    static let ppIndigo = Color(red: 0x4f/255, green: 0x46/255, blue: 0xe5/255)          // #4f46e5

    // Text colors
    static let ppTextPrimary = Color(red: 0xfa/255, green: 0xfa/255, blue: 0xf9/255)     // #fafaf9 foreground
    static let ppTextSecondary = Color(red: 0x9c/255, green: 0xa3/255, blue: 0xaf/255)   // #9ca3af gray-400
    static let ppTextMuted = Color(red: 0x6b/255, green: 0x72/255, blue: 0x80/255)       // #6b7280 gray-500

    // Status
    static let ppSuccess = Color(red: 0x10/255, green: 0xb9/255, blue: 0x81/255)         // #10b981 emerald
    static let ppError = Color(red: 0xef/255, green: 0x44/255, blue: 0x44/255)           // #EF4444 red

    // Icon colors
    static let ppIconBlue = Color(red: 0x3b/255, green: 0x82/255, blue: 0xf6/255)        // #3b82f6
    static let ppIconOrange = ppOrange
    static let ppIconGreen = ppSuccess
    static let ppIconPurple = Color(red: 0xa8/255, green: 0x55/255, blue: 0xf7/255)      // #a855f7
    static let ppIconRed = ppError
    static let ppIconYellow = Color(red: 0xea/255, green: 0xb3/255, blue: 0x08/255)      // #eab308

    // Legacy aliases
    static let paradigmBlue = ppOrange
    static let paradigmGreen = ppSuccess
    static let paradigmBackground = ppBackground
}

// MARK: - Brand Gradients

enum PPGradient {
    // Hero: 135deg #1e1b4b → #4f46e5 → #f97316
    static let hero = LinearGradient(
        colors: [.ppBackground, .ppIndigo, .ppOrange],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    // CTA button: 135deg #4f46e5 → #f97316
    static let cta = LinearGradient(
        colors: [.ppIndigo, .ppOrange],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    // Gold shimmer: #f97316 → #ec4899 → #f97316
    static let gold = LinearGradient(
        colors: [.ppOrange, .ppPink, .ppOrange],
        startPoint: .leading, endPoint: .trailing
    )

    // Card: 135deg #27255a → #312e7a
    static let card = LinearGradient(
        colors: [.ppSurface, .ppSurfaceLight],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
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
            .background(PPGradient.card)
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.ppBorder.opacity(0.5), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.25), radius: 16, x: 0, y: 8)
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
            .background(PPGradient.cta)
            .cornerRadius(12)
            .shadow(color: Color.ppOrange.opacity(configuration.isPressed ? 0 : 0.4), radius: 12, x: 0, y: 0)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(isLoading ? 0.6 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.medium))
            .foregroundColor(.ppTextPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.ppSurfaceLight)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.ppBorder.opacity(0.5), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct DarkInputFieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.subheadline)
            .foregroundColor(.ppTextPrimary)
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(Color.ppSurfaceLight.opacity(0.5))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.ppBorder.opacity(0.5), lineWidth: 1)
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
