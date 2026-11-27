import React from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  CourseReviewClient,
  type CurrentCourseUser,
} from "@/components/CourseReviewClient";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await getSessionUser();

  let currentUser: CurrentCourseUser | null = null;
  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { userId: session.userId },
      select: {
        userId: true,
        role: true,
        universityId: true,
        facultyId: true,
        majorId: true,
        university: { select: { name: true } },
        faculty: { select: { name: true } },
        major: { select: { name: true } },
        passedCourses: {
          select: {
            courseId: true,
            grade: true,
            academicYear: true,
            semester: true,
          },
        },
      },
    });

    if (dbUser) {
      currentUser = {
        userId: dbUser.userId,
        role: dbUser.role,
        universityId: dbUser.universityId,
        facultyId: dbUser.facultyId,
        majorId: dbUser.majorId,
        universityName: dbUser.university?.name ?? null,
        facultyName: dbUser.faculty?.name ?? null,
        majorName: dbUser.major?.name ?? null,
        passedCourses: dbUser.passedCourses,
      };
    }
  }

  // Logged-in students/teachers primarily see their own university's courses
  const uniWhere =
    currentUser && currentUser.role !== "admin" && currentUser.universityId
      ? { universityId: currentUser.universityId }
      : {};

  const universities = await prisma.university.findMany({
    where: uniWhere,
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
                  passedByUsers: {
                    select: { userId: true, grade: true },
                  },
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
  });

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
        courses: m.courses.map((c) => {
          const gradeByUserId = new Map<string, string>();
          for (const p of c.passedByUsers) {
            gradeByUserId.set(p.userId, p.grade);
          }
          return {
            courseId: c.courseId,
            courseCode: c.courseCode,
            courseName: c.courseName,
            yearLevel: c.yearLevel,
            credits: c.credits,
            reviews: c.reviews.map((r) => {
              const isMine = currentUser?.userId === r.userId;
              const rawGrade = gradeByUserId.get(r.userId) ?? null;
              return {
                reviewId: r.reviewId,
                isMine,
                reviewerName: r.showName
                  ? `${r.user.userFname} ${r.user.userLname}`.trim()
                  : "นักศึกษา (ไม่ระบุชื่อ)",
                reviewerGrade: r.showGrade ? rawGrade : null,
                showName: r.showName,
                showGrade: r.showGrade,
                contentRating: r.contentRating,
                workloadRating: r.workloadRating,
                gradeDifficultyRating: r.gradeDifficultyRating,
                commentText: r.commentText,
                academicYear: r.academicYear,
                semester: r.semester,
                createdAt: r.createdAt.toISOString(),
              };
            }),
          };
        }),
      })),
    })),
  }));

  return (
    <CourseReviewClient
      universities={serialized}
      currentUser={currentUser}
    />
  );
}
