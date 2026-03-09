import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    redirect("/courses");
  }

  const courses = await prisma.course.findMany({
    include: {
      weeks: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
        <Link href="/admin/courses/new" className="btn-primary">
          + New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Weeks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Lessons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {courses.map((course) => {
                const totalLessons = course.weeks.reduce(
                  (s, w) => s + w.lessons.length,
                  0
                );
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {course.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          course.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.weeks.length}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {totalLessons}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course._count.enrollments}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/courses/${course.slug}/edit`}
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
