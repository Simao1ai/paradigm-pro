import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    redirect("/courses");
  }

  const [totalUsers, totalCourses, totalEnrollments, totalProgress] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.progress.count({ where: { completed: true } }),
    ]);

  // Recent enrollments
  const recentEnrollments = await prisma.enrollment.findMany({
    take: 10,
    orderBy: { enrolledAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  // Course stats
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true } },
      weeks: {
        include: {
          lessons: {
            include: {
              _count: { select: { progress: true } },
            },
          },
        },
      },
    },
  });

  // Per-course completion rates
  const courseStats = courses.map((course) => {
    const totalLessons = course.weeks.reduce(
      (s, w) => s + w.lessons.length,
      0
    );
    const totalCompletions = course.weeks.reduce(
      (s, w) =>
        s + w.lessons.reduce((ls, l) => ls + l._count.progress, 0),
      0
    );
    const possibleCompletions = totalLessons * course._count.enrollments;
    const avgCompletion =
      possibleCompletions > 0
        ? Math.round((totalCompletions / possibleCompletions) * 100)
        : 0;

    return {
      title: course.title,
      enrolled: course._count.enrollments,
      lessons: totalLessons,
      avgCompletion,
    };
  });

  const stats = [
    { label: "Total Users", value: totalUsers, color: "bg-blue-100 text-blue-700" },
    { label: "Courses", value: totalCourses, color: "bg-green-100 text-green-700" },
    { label: "Enrollments", value: totalEnrollments, color: "bg-purple-100 text-purple-700" },
    { label: "Lessons Completed", value: totalProgress, color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course performance */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Course Performance
          </h2>
          {courseStats.length > 0 ? (
            <div className="space-y-4">
              {courseStats.map((cs) => (
                <div key={cs.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 truncate pr-4">
                      {cs.title}
                    </span>
                    <span className="text-gray-500 flex-shrink-0">
                      {cs.enrolled} students &middot; {cs.avgCompletion}% avg
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-brand-600"
                      style={{ width: `${cs.avgCompletion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No courses yet.</p>
          )}
        </div>

        {/* Recent enrollments */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Enrollments
          </h2>
          {recentEnrollments.length > 0 ? (
            <div className="space-y-3">
              {recentEnrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {e.user.name || e.user.email}
                    </span>
                    <span className="text-gray-500"> enrolled in </span>
                    <span className="font-medium text-gray-900">
                      {e.course.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(e.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No enrollments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
