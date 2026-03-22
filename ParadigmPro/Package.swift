// swift-tools-version: 5.9
// This Package.swift is provided for reference.
// The actual iOS app should be opened via the .xcodeproj generated in Xcode.
//
// To set up the Xcode project:
// 1. Open Xcode → File → New → Project → iOS App
// 2. Set Product Name: "ParadigmPro", Interface: SwiftUI, Language: Swift
// 3. Set Minimum Deployment Target: iOS 16.0
// 4. Copy the ParadigmPro/ source folder into the project
// 5. Add frameworks: AVKit, Security (both should be auto-linked)
// 6. Update Constants.swift with your Replit deployment URL
//
// Required Capabilities:
// - Keychain Sharing (for token storage)
//
// Info.plist entries needed:
// - NSAppTransportSecurity → NSAllowsArbitraryLoads: NO (HTTPS only, Replit provides this)

import PackageDescription

let package = Package(
    name: "ParadigmPro",
    platforms: [.iOS(.v16)],
    targets: [
        .executableTarget(
            name: "ParadigmPro",
            path: "ParadigmPro"
        ),
    ]
)
