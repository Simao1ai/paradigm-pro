import SwiftUI

@main
struct ParadigmProApp: App {
    @StateObject private var authViewModel = AuthViewModel()

    init() {
        // Navigation bar matching #1e1b4b
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = UIColor(red: 0x1e/255, green: 0x1b/255, blue: 0x4b/255, alpha: 1)
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor(red: 0xfa/255, green: 0xfa/255, blue: 0xf9/255, alpha: 1)]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor(red: 0xfa/255, green: 0xfa/255, blue: 0xf9/255, alpha: 1)]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = UIColor(red: 0xf9/255, green: 0x73/255, blue: 0x16/255, alpha: 1)
    }

    var body: some Scene {
        WindowGroup {
            if authViewModel.isAuthenticated {
                MainTabView()
                    .environmentObject(authViewModel)
                    .preferredColorScheme(.dark)
            } else {
                AuthContainerView()
                    .environmentObject(authViewModel)
                    .preferredColorScheme(.dark)
            }
        }
    }
}
