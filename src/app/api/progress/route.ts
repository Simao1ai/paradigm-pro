import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/get-user";

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, videoProgress, completed } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_lessonId: { userId: user.id, lessonId },
    },
    update: {
      videoProgress: videoProgress ?? undefined,
      completed: completed ?? undefined,
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId: user.id,
      lessonId,
      videoProgress: videoProgress ?? 0,
      completed: completed ?? false,
      completedAt: completed ? new Date() : null,
    },
  });

  return NextResponse.json(progress);
}
