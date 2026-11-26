import React from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CourseReviewClient } from "@/components/CourseReviewClient";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [session, universities] = await Promise.all([
    getSessionUser(),
    prisma.university.findMany({
      orderBy: { code: "asc" },
      include: {
        faculties: {
          orderBy: { code: "asc" },
          include: {
            majors: {
              orderBy: { name: "asc" },
              include: {
                courses: {
                  orderBy: [{ yearLevel: "asc" }, { courseCode: "asc" }],
                  include: {
                    reviews: {
                      orderBy: { createdAt: "desc" },
                      include: {
                        user: {
                          select: { userFname: true, userLname: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const serialized = universities.map((u) => ({
    universityId: u.universityId,
    code: u.code,
    name: u.name,
    shortName: u.shortName,
    faculties: u.faculties.map((f) => ({
      facultyId: f.facultyId,
      code: f.code,
      name: f.name,
      majors: f.majors.map((m) => ({
        majorId: m.majorId,
        code: m.code,
        name: m.name,
        courses: m.courses.map((c) => ({
          courseId: c.courseId,
          courseCode: c.courseCode,
          courseName: c.courseName,
          yearLevel: c.yearLevel,
          credits: c.credits,
          reviews: c.reviews.map((r) => ({
            reviewId: r.reviewId,
            userId: r.userId,
            reviewerName: `${r.user.userFname} ${r.user.userLname}`.trim(),
            contentRating: r.contentRating,
            workloadRating: r.workloadRating,
            gradeDifficultyRating: r.gradeDifficultyRating,
            commentText: r.commentText,
            academicYear: r.academicYear,
            semester: r.semester,
            createdAt: r.createdAt.toISOString(),
          })),
        })),
      })),
    })),
  }));

  return (
    <CourseReviewClient
      universities={serialized}
      currentUserId={session?.userId || null}
    />
  );
}
