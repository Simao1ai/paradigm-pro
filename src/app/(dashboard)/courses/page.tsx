import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  // Get enrolled courses with progress
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          weeks: {
            include: {
              lessons: {
                include: {
                  progress: { where: { userId } },
                },
              },
            },
            orderBy: { weekNumber: "asc" },
          },
        },
      },
    },
  });

  // Get all published courses not enrolled in
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const availableCourses = await prisma.course.findMany({
    where: {
      published: true,
      id: { notIn: enrolledCourseIds },
    },
    include: {
      weeks: { include: { lessons: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Courses</h1>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const totalLessons = course.weeks.reduce(
              (sum, w) => sum + w.lessons.length,
              0
            );
            const completedLessons = course.weeks.reduce(
              (sum, w) =>
                sum +
                w.lessons.filter((l) =>
                  l.progress.some((p) => p.completed)
                ).length,
              0
            );
            const progress =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold px-4 text-center">
                    {course.title}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {completedLessons} of {totalLessons} lessons completed
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center mb-12">
          <p className="text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
        </div>
      )}

      {availableCourses.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Available Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => {
              const totalLessons = course.weeks.reduce(
                (sum, w) => sum + w.lessons.length,
                0
              );
              return (
                <div key={course.id} className="card overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold px-4 text-center">
                      {course.title}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {course.weeks.length} weeks &middot; {totalLessons} lessons
                    </p>
                    <form action={`/api/enrollments`} method="POST" className="mt-4">
                      <input type="hidden" name="courseId" value={course.id} />
                      <EnrollButton courseId={course.id} />
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EnrollButton({ courseId }: { courseId: string }) {
  return <EnrollButtonClient courseId={courseId} />;
}

// Client component for the enroll button
import { EnrollButtonClient } from "@/components/course/EnrollButton";
