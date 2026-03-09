import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDuration, formatFileSize } from "@/lib/utils";
import { MarkCompleteButton } from "@/components/progress/MarkCompleteButton";
import { VideoPlayer } from "@/components/video/VideoPlayer";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; weekNumber: string; lessonId: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  // Verify enrollment
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: { enrollments: { where: { userId } } },
  });

  if (!course || course.enrollments.length === 0) {
    redirect("/courses");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      materials: true,
      progress: { where: { userId } },
      week: {
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
          course: {
            include: {
              weeks: {
                orderBy: { weekNumber: "asc" },
                include: { lessons: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) notFound();

  const currentProgress = lesson.progress[0];
  const isCompleted = currentProgress?.completed ?? false;

  // Find prev/next lesson
  const allLessons = lesson.week.course.weeks.flatMap((w) =>
    w.lessons.map((l) => ({
      id: l.id,
      weekNumber: w.weekNumber,
      slug: lesson.week.course.slug,
    }))
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/courses" className="hover:text-gray-700">Courses</Link>
        <span>/</span>
        <Link href={`/courses/${params.slug}`} className="hover:text-gray-700">
          {lesson.week.course.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{lesson.week.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Video */}
            {lesson.type === "VIDEO" && (
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                lessonId={lesson.id}
                initialProgress={currentProgress?.videoProgress ?? 0}
              />
            )}

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    lesson.type === "VIDEO"
                      ? "bg-blue-100 text-blue-700"
                      : lesson.type === "READING"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {lesson.type}
                </span>
                {lesson.videoDuration && (
                  <span className="text-sm text-gray-500">
                    {formatDuration(lesson.videoDuration)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {lesson.title}
              </h1>

              {/* Reading content */}
              {lesson.content && (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {lesson.content}
                </div>
              )}

              {/* Mark complete */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <MarkCompleteButton
                  lessonId={lesson.id}
                  completed={isCompleted}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {prevLesson ? (
              <Link
                href={`/courses/${prevLesson.slug}/week/${prevLesson.weekNumber}/lesson/${prevLesson.id}`}
                className="btn-secondary"
              >
                &larr; Previous Lesson
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                href={`/courses/${nextLesson.slug}/week/${nextLesson.weekNumber}/lesson/${nextLesson.id}`}
                className="btn-primary"
              >
                Next Lesson &rarr;
              </Link>
            ) : (
              <Link href={`/courses/${params.slug}`} className="btn-primary">
                Back to Course
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar — Materials */}
        <div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Materials</h3>
            {lesson.materials.length > 0 ? (
              <div className="space-y-3">
                {lesson.materials.map((m) => (
                  <a
                    key={m.id}
                    href={m.fileUrl}
                    download
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 flex-shrink-0">
                      <span className="text-xs font-bold uppercase">
                        {m.fileType}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {m.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(m.fileSize)}
                      </p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No materials for this lesson.</p>
            )}
          </div>

          {/* Lesson list for the week */}
          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {lesson.week.title}
            </h3>
            <div className="space-y-1">
              {lesson.week.lessons.map((l) => (
                <Link
                  key={l.id}
                  href={`/courses/${params.slug}/week/${params.weekNumber}/lesson/${l.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    l.id === lesson.id
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-12 text-xs text-gray-400 flex-shrink-0">
                    {l.type === "VIDEO" ? "Video" : l.type === "READING" ? "Read" : "Task"}
                  </span>
                  <span className="truncate">{l.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
