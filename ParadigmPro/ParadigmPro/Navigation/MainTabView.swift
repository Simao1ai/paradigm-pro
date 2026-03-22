import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authVM: AuthViewModel

    init() {
        // Dark tab bar appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(red: 26/255, green: 26/255, blue: 46/255, alpha: 1)
        appearance.shadowColor = UIColor(red: 55/255, green: 55/255, blue: 90/255, alpha: 1)
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    var body: some View {
        TabView {
            CourseListView()
                .tabItem {
                    Label("Courses", systemImage: "book.fill")
                }

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .tint(.ppOrange)
    }
}
