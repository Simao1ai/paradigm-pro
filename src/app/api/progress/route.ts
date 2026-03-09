import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, videoProgress, completed } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId },
    },
    update: {
      videoProgress: videoProgress ?? undefined,
      completed: completed ?? undefined,
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      lessonId,
      videoProgress: videoProgress ?? 0,
      completed: completed ?? false,
      completedAt: completed ? new Date() : null,
    },
  });

  return NextResponse.json(progress);
}
