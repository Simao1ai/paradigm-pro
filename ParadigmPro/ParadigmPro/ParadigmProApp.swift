import SwiftUI

@main
struct ParadigmProApp: App {
    @StateObject private var authViewModel = AuthViewModel()

    init() {
        // Dark navigation bar matching site
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = UIColor(red: 26/255, green: 26/255, blue: 46/255, alpha: 1)
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = UIColor(red: 255/255, green: 107/255, blue: 53/255, alpha: 1)
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
