import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekId, title, type, content, videoUrl, videoDuration, sortOrder } =
    await req.json();

  if (!weekId || !title || !type) {
    return NextResponse.json(
      { error: "weekId, title, and type are required" },
      { status: 400 }
    );
  }

  // Verify the week belongs to this course
  const week = await prisma.week.findFirst({
    where: { id: weekId, courseId: params.courseId },
  });

  if (!week) {
    return NextResponse.json({ error: "Week not found" }, { status: 404 });
  }

  // Get next sort order if not specified
  const order =
    sortOrder ??
    ((await prisma.lesson.count({ where: { weekId } })) + 1);

  const lesson = await prisma.lesson.create({
    data: {
      weekId,
      title,
      type,
      content,
      videoUrl,
      videoDuration,
      sortOrder: order,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
