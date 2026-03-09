import { PrismaClient, Role, LessonType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@paradigmpro.com" },
    update: {},
    create: {
      email: "admin@paradigmpro.com",
      name: "Admin User",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  // Create instructor
  const instructorHash = await bcrypt.hash("instructor123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@paradigmpro.com" },
    update: {},
    create: {
      email: "instructor@paradigmpro.com",
      name: "Sarah Mitchell",
      passwordHash: instructorHash,
      role: Role.INSTRUCTOR,
    },
  });

  // Create student
  const studentHash = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@paradigmpro.com" },
    update: {},
    create: {
      email: "student@paradigmpro.com",
      name: "Alex Johnson",
      passwordHash: studentHash,
      role: Role.STUDENT,
    },
  });

  // Create a sample 12-week course
  const course = await prisma.course.upsert({
    where: { slug: "strategic-consulting-fundamentals" },
    update: {},
    create: {
      title: "Strategic Consulting Fundamentals",
      slug: "strategic-consulting-fundamentals",
      description:
        "A comprehensive 12-week program covering the core frameworks, tools, and methodologies used by top-tier consulting firms. Learn to structure problems, analyze data, and deliver compelling recommendations.",
      published: true,
    },
  });

  const weekTopics = [
    { num: 1, title: "Introduction & Frameworks", desc: "Overview of the consulting toolkit and core problem-solving frameworks." },
    { num: 2, title: "Problem Definition", desc: "Learn to define problem statements, build issue trees, and form hypotheses." },
    { num: 3, title: "Stakeholder Analysis", desc: "Identify, map, and manage stakeholders for successful engagements." },
    { num: 4, title: "Data Collection & Research", desc: "Primary and secondary research methods for building fact bases." },
    { num: 5, title: "Quantitative Analysis", desc: "Financial modeling, market sizing, and data-driven decision making." },
    { num: 6, title: "Qualitative Analysis", desc: "Interview techniques, surveys, and qualitative data synthesis." },
    { num: 7, title: "Strategy Frameworks", desc: "Porter's Five Forces, SWOT, value chain analysis, and competitive positioning." },
    { num: 8, title: "Operations & Process", desc: "Process mapping, lean methodology, and operational improvement." },
    { num: 9, title: "Change Management", desc: "Leading organizational change, overcoming resistance, and implementation planning." },
    { num: 10, title: "Communication & Storytelling", desc: "Structuring presentations, the pyramid principle, and data visualization." },
    { num: 11, title: "Client Management", desc: "Building client relationships, managing expectations, and navigating difficult conversations." },
    { num: 12, title: "Capstone & Wrap-Up", desc: "Apply everything in a capstone project and prepare for real-world engagements." },
  ];

  for (const wt of weekTopics) {
    const week = await prisma.week.upsert({
      where: { courseId_weekNumber: { courseId: course.id, weekNumber: wt.num } },
      update: {},
      create: {
        courseId: course.id,
        weekNumber: wt.num,
        title: `Week ${wt.num}: ${wt.title}`,
        description: wt.desc,
      },
    });

    // Create 3 lessons per week
    const lessons = [
      { title: `Introduction to ${wt.title}`, type: LessonType.VIDEO, order: 1, duration: 600 + Math.floor(Math.random() * 900) },
      { title: `Deep Dive: ${wt.title}`, type: LessonType.VIDEO, order: 2, duration: 900 + Math.floor(Math.random() * 1200) },
      { title: `${wt.title} — Key Takeaways`, type: LessonType.READING, order: 3 },
    ];

    for (const l of lessons) {
      await prisma.lesson.create({
        data: {
          weekId: week.id,
          title: l.title,
          type: l.type,
          sortOrder: l.order,
          videoDuration: l.type === LessonType.VIDEO ? l.duration : null,
          content:
            l.type === LessonType.READING
              ? `# ${l.title}\n\nThis reading summarizes the key concepts covered in this week's video lessons.\n\n## Key Points\n\n- Point 1: Core concept explanation\n- Point 2: Practical application\n- Point 3: Common pitfalls to avoid\n\n## Recommended Reading\n\n- \"The McKinsey Way\" by Ethan Rasiel\n- \"Case in Point\" by Marc Cosentino`
              : null,
        },
      });
    }

    // Add a week-level material
    await prisma.material.create({
      data: {
        title: `Week ${wt.num} Summary Slides`,
        fileUrl: `/uploads/materials/week-${wt.num}-slides.pdf`,
        fileType: "pdf",
        fileSize: 1024 * 1024 * 2,
        weekId: week.id,
      },
    });
  }

  // Enroll the student in the course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });

  console.log("Seed data created successfully!");
  console.log("Admin:      admin@paradigmpro.com / admin123");
  console.log("Instructor: instructor@paradigmpro.com / instructor123");
  console.log("Student:    student@paradigmpro.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
