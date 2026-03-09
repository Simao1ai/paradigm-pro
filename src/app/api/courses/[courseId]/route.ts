import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          lessons: { orderBy: { sortOrder: "asc" } },
          materials: true,
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const course = await prisma.course.update({
    where: { id: params.courseId },
    data: {
      title: data.title,
      description: data.description,
      published: data.published,
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.course.delete({ where: { id: params.courseId } });

  return NextResponse.json({ ok: true });
}
