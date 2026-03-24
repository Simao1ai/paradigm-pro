import SwiftUI

struct CourseDetailView: View {
    let courseId: String // used as slug

    var body: some View {
        if let meta = ALL_LESSONS.first(where: { $0.slug == courseId }) {
            LessonMetaView(lessonMeta: meta)
        } else {
            ErrorView(message: "Lesson not found") {}
        }
    }
}
