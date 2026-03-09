import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CourseEditor } from "@/components/course/CourseEditor";

export default async function EditCoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    redirect("/courses");
  }

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
          materials: true,
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div>
      <Link
        href="/admin/courses"
        className="text-sm text-brand-600 hover:text-brand-700 mb-4 inline-block"
      >
        &larr; Back to Courses
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Edit: {course.title}
      </h1>

      <CourseEditor course={course} />
    </div>
  );
}
