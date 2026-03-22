import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/get-user";

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();

  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  // Check course exists and is published
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Upsert enrollment
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: user.id, courseId },
    },
    update: {},
    create: {
      userId: user.id,
      courseId,
    },
  });

  return NextResponse.json(enrollment, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await req.json();

  await prisma.enrollment.deleteMany({
    where: { userId: user.id, courseId },
  });

  return NextResponse.json({ ok: true });
}
