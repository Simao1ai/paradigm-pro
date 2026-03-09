import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveFile, getFileType } from "@/lib/storage";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const lessonId = formData.get("lessonId") as string | null;
  const weekId = formData.get("weekId") as string | null;
  const type = formData.get("type") as string; // "material" or "video"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const subfolder = type === "video" ? "videos" : "materials";
  const { url, size } = await saveFile(file, subfolder);

  if (type === "video" && lessonId) {
    // Update lesson with video URL
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { videoUrl: url },
    });
    return NextResponse.json({ url, size });
  }

  // Create material record
  const material = await prisma.material.create({
    data: {
      title: title || file.name,
      fileUrl: url,
      fileType: getFileType(file.name),
      fileSize: size,
      lessonId: lessonId || null,
      weekId: weekId || null,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
