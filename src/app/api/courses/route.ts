import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      weeks: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "INSTRUCTOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, published } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  let slug = slugify(title);

  // Ensure unique slug
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description,
      published: published ?? false,
      weeks: {
        create: Array.from({ length: 12 }, (_, i) => ({
          weekNumber: i + 1,
          title: `Week ${i + 1}`,
        })),
      },
    },
    include: { weeks: true },
  });

  return NextResponse.json(course, { status: 201 });
}
