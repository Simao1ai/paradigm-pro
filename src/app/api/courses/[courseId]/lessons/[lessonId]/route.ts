import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const lesson = await prisma.lesson.update({
    where: { id: params.lessonId },
    data: {
      title: data.title,
      type: data.type,
      content: data.content,
      videoUrl: data.videoUrl,
      videoDuration: data.videoDuration,
      sortOrder: data.sortOrder,
    },
  });

  return NextResponse.json(lesson);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.lesson.delete({ where: { id: params.lessonId } });

  return NextResponse.json({ ok: true });
}
