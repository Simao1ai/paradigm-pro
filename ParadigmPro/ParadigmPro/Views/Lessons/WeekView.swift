import SwiftUI

// Kept for Xcode project compatibility — no longer used since lessons are flat.
struct WeekView: View {
    let lesson: Lesson

    var body: some View {
        LessonView(lesson: lesson)
    }
}
