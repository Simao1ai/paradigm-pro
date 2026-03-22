import Foundation

struct Course: Codable, Identifiable {
    let id: String
    let title: String
    let slug: String
    let description: String
    let thumbnail: String?
    let published: Bool
    let weeks: [Week]?
    let createdAt: String?
    let updatedAt: String?
    let _count: EnrollmentCount?

    struct EnrollmentCount: Codable {
        let enrollments: Int
    }

    var enrollmentCount: Int {
        _count?.enrollments ?? 0
    }
}

struct Week: Codable, Identifiable {
    let id: String
    let courseId: String
    let weekNumber: Int
    let title: String
    let description: String?
    let lessons: [Lesson]?
    let materials: [Material]?
    let createdAt: String?
    let updatedAt: String?
}

struct Lesson: Codable, Identifiable {
    let id: String
    let weekId: String
    let title: String
    let type: String
    let sortOrder: Int
    let videoUrl: String?
    let videoDuration: Int?
    let content: String?
    let materials: [Material]?
    let createdAt: String?
    let updatedAt: String?

    var lessonType: LessonType {
        LessonType(rawValue: type) ?? .reading
    }
}

enum LessonType: String, Codable {
    case video
    case reading
    case assignment
}

struct Material: Codable, Identifiable {
    let id: String
    let title: String
    let fileUrl: String
    let fileType: String
    let fileSize: Int
    let lessonId: String?
    let weekId: String?
    let createdAt: String?

    var formattedFileSize: String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(fileSize))
    }
}
