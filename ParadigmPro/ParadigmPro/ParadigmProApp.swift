import SwiftUI

@main
struct ParadigmProApp: App {
    @StateObject private var authViewModel = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            if authViewModel.isAuthenticated {
                MainTabView()
                    .environmentObject(authViewModel)
            } else {
                AuthContainerView()
                    .environmentObject(authViewModel)
            }
        }
    }
}
