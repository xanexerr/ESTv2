import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const universityId = searchParams.get("universityId");
  const facultyId = searchParams.get("facultyId");
  const majorId = searchParams.get("majorId");
  const yearLevel = searchParams.get("yearLevel");

  const where: any = {};
  if (yearLevel) {
    const yl = Number(yearLevel);
    if (!Number.isInteger(yl) || yl < 1 || yl > 6) {
      return NextResponse.json(
        { ok: false, error: "Invalid yearLevel parameter" },
        { status: 400 }
      );
    }
    where.yearLevel = yl;
  }
  if (majorId) {
    where.majorId = Number(majorId);
  } else if (facultyId) {
    where.major = { facultyId: Number(facultyId) };
  } else if (universityId) {
    where.major = { faculty: { universityId: Number(universityId) } };
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: [{ yearLevel: "asc" }, { courseCode: "asc" }],
    include: {
      major: {
        include: {
          faculty: {
            include: { university: true },
          },
        },
      },
      reviews: {
        select: {
          contentRating: true,
          workloadRating: true,
          gradeDifficultyRating: true,
        },
      },
    },
  });

  const data = courses.map((c) => {
    const n = c.reviews.length;
    const avgOf = (fn: (r: (typeof c.reviews)[number]) => number) =>
      n === 0
        ? 0
        : Number((c.reviews.reduce((s, r) => s + fn(r), 0) / n).toFixed(2));
    return {
      courseId: c.courseId,
      courseCode: c.courseCode,
      courseName: c.courseName,
      yearLevel: c.yearLevel,
      credits: c.credits,
      major: c.major.name,
      faculty: c.major.faculty.name,
      university: c.major.faculty.university.name,
      reviewCount: n,
      ratings: {
        content: avgOf((r) => r.contentRating),
        workload: avgOf((r) => r.workloadRating),
        gradeDifficulty: avgOf((r) => r.gradeDifficultyRating),
      },
    };
  });

  return NextResponse.json({ ok: true, count: data.length, data });
}
