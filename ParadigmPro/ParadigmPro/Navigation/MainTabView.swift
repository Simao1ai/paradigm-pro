import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authVM: AuthViewModel

    init() {
        // Tab bar matching #1e1b4b
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(red: 0x1e/255, green: 0x1b/255, blue: 0x4b/255, alpha: 1)
        appearance.shadowColor = UIColor(red: 0x31/255, green: 0x2e/255, blue: 0x7a/255, alpha: 1)
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    var body: some View {
        TabView {
            CourseListView()
                .tabItem {
                    Label("Lessons", systemImage: "book.fill")
                }

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .tint(.ppOrange)
    }
}
