import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            include: {
              progress: { where: { userId } },
            },
          },
          materials: true,
        },
      },
      enrollments: { where: { userId } },
    },
  });

  if (!course) notFound();

  const isEnrolled = course.enrollments.length > 0;
  const totalLessons = course.weeks.reduce((s, w) => s + w.lessons.length, 0);
  const completedLessons = course.weeks.reduce(
    (s, w) => s + w.lessons.filter((l) => l.progress.some((p) => p.completed)).length,
    0
  );
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/courses" className="text-sm text-brand-600 hover:text-brand-700 mb-2 inline-block">
          &larr; Back to Courses
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="mt-2 text-gray-600 max-w-3xl">{course.description}</p>

        {isEnrolled && (
          <div className="mt-4 max-w-md">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200">
              <div
                className="h-3 rounded-full bg-brand-600 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
        )}
      </div>

      {/* Week list */}
      <div className="space-y-4">
        {course.weeks.map((week) => {
          const weekCompleted = week.lessons.filter((l) =>
            l.progress.some((p) => p.completed)
          ).length;
          const weekTotal = week.lessons.length;

          return (
            <div key={week.id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {week.title}
                  </h2>
                  {isEnrolled && (
                    <span className="text-sm text-gray-500">
                      {weekCompleted}/{weekTotal} completed
                    </span>
                  )}
                </div>

                {week.description && (
                  <p className="text-sm text-gray-600 mb-4">{week.description}</p>
                )}

                {/* Lessons */}
                <div className="space-y-2">
                  {week.lessons.map((lesson) => {
                    const done = lesson.progress.some((p) => p.completed);
                    return (
                      <Link
                        key={lesson.id}
                        href={
                          isEnrolled
                            ? `/courses/${course.slug}/week/${week.weekNumber}/lesson/${lesson.id}`
                            : "#"
                        }
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          isEnrolled
                            ? "hover:bg-gray-50 border-gray-200"
                            : "border-gray-100 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {/* Status icon */}
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 ${
                            done
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {done ? (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-gray-300" />
                          )}
                        </div>

                        {/* Lesson type icon */}
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 w-16">
                          {lesson.type === "VIDEO"
                            ? "Video"
                            : lesson.type === "READING"
                            ? "Read"
                            : "Task"}
                        </span>

                        <span className="flex-1 text-sm text-gray-900">
                          {lesson.title}
                        </span>

                        {lesson.videoDuration && (
                          <span className="text-xs text-gray-400">
                            {formatDuration(lesson.videoDuration)}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Week-level materials */}
                {week.materials.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {week.materials.map((m) => (
                        <a
                          key={m.id}
                          href={m.fileUrl}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                          download
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          {m.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
