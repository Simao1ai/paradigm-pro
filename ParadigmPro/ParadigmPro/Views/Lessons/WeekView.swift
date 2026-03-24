import SwiftUI

// Kept for Xcode project compatibility
struct WeekView: View {
    let lessonMeta: LessonMeta

    var body: some View {
        LessonMetaView(lessonMeta: lessonMeta)
    }
}
