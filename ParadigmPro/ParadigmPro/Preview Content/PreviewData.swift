import Foundation

enum PreviewData {
    static let user = User(
        id: "preview-user-1",
        email: "student@example.com",
        name: "Jane Student",
        role: .student,
        image: nil,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
    )

    static let material = Material(
        id: "preview-material-1",
        title: "Course Syllabus",
        fileUrl: "https://example.com/syllabus.pdf",
        fileType: "pdf",
        fileSize: 1_048_576,
        lessonId: "preview-lesson-1",
        weekId: nil,
        createdAt: "2024-01-01T00:00:00.000Z"
    )

    static let lesson = Lesson(
        id: "preview-lesson-1",
        weekId: "preview-week-1",
        title: "Introduction to the Course",
        type: "video",
        sortOrder: 0,
        videoUrl: "https://example.com/video.mp4",
        videoDuration: 600,
        content: nil,
        materials: [material],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
    )

    static let readingLesson = Lesson(
        id: "preview-lesson-2",
        weekId: "preview-week-1",
        title: "Core Concepts",
        type: "reading",
        sortOrder: 1,
        videoUrl: nil,
        videoDuration: nil,
        content: "This lesson covers the core concepts you need to understand before proceeding.",
        materials: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
    )

    static let week = Week(
        id: "preview-week-1",
        courseId: "preview-course-1",
        weekNumber: 1,
        title: "Getting Started",
        description: "Introduction to the fundamentals",
        lessons: [lesson, readingLesson],
        materials: [material],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
    )

    static let course = Course(
        id: "preview-course-1",
        title: "12-Week Paradigm Shift Program",
        slug: "paradigm-shift-program",
        description: "A comprehensive 12-week program designed to transform your approach.",
        thumbnail: nil,
        published: true,
        weeks: [week],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        _count: Course.EnrollmentCount(enrollments: 42)
    )

    static let courses = [course]

    static let progress = LessonProgress(
        id: "preview-progress-1",
        userId: "preview-user-1",
        lessonId: "preview-lesson-1",
        completed: false,
        videoProgress: 120,
        completedAt: nil,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
    )
}
