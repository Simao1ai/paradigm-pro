import Foundation

enum PreviewData {
    static let user = User(
        id: "preview-user-1",
        email: "student@example.com",
        name: "Jane Student",
        role: "student",
        image: nil
    )

    static let asset = LessonAsset(
        id: "preview-asset-1",
        lessonId: "preview-lesson-1",
        assetType: "pdf",
        label: "Lesson 1 PDF",
        storagePath: "/assets/lesson-1.pdf",
        fileSizeBytes: 1_048_576,
        mimeType: "application/pdf",
        sortOrder: 0
    )

    static let lesson = Lesson(
        id: "preview-lesson-1",
        lessonNumber: 1,
        title: "A Worthy Ideal",
        slug: "a-worthy-ideal",
        subtitle: "Define what you truly want",
        description: "The first step in transformation is clarity.",
        keyPrinciple: "You must have a worthy ideal to pursue.",
        estimatedMinutes: 45,
        hasAudio: false,
        isPublished: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        assets: [asset]
    )

    static let lessons = (1...12).map { i in
        Lesson(
            id: "preview-lesson-\(i)",
            lessonNumber: i,
            title: "Lesson \(i)",
            slug: "lesson-\(i)",
            subtitle: "Subtitle for lesson \(i)",
            description: nil,
            keyPrinciple: nil,
            estimatedMinutes: 45,
            hasAudio: i > 3,
            isPublished: true,
            sortOrder: i,
            createdAt: nil,
            assets: nil
        )
    }

    static let progress = LessonProgress(
        id: "preview-progress-1",
        userId: "preview-user-1",
        lessonId: "preview-lesson-1",
        status: "in_progress",
        audioPositionSecs: 120,
        completedAt: nil,
        lastAccessedAt: nil,
        lessonNumber: 1,
        lessonTitle: "A Worthy Ideal",
        lessonSlug: "a-worthy-ideal"
    )

    static let profile = Profile(
        id: "preview-user-1",
        fullName: "Jane Student",
        avatarUrl: nil,
        role: "student",
        points: 150,
        level: 2,
        onboardingDone: true,
        lastActiveAt: nil,
        createdAt: "2024-01-01T00:00:00.000Z"
    )
}
