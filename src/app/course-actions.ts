"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions";

const PASSING_GRADES = new Set(["A", "B+", "B", "C+", "C", "D+", "D", "S"]);

function clampRating(val: number): number | null {
  if (!Number.isInteger(val) || val < 1 || val > 5) return null;
  return val;
}

function isPassingGrade(grade: string): boolean {
  return PASSING_GRADES.has(grade.trim().toUpperCase());
}

async function getCourseWithHierarchy(courseId: number) {
  return prisma.course.findUnique({
    where: { courseId },
    include: {
      major: {
        include: {
          faculty: {
            include: {
              university: true,
            },
          },
        },
      },
    },
  });
}

function checkStudentAcademicMatch(
  user: {
    universityId: number | null;
    facultyId: number | null;
    majorId: number | null;
  },
  course: {
    majorId: number;
    major: {
      facultyId: number;
      faculty: {
        universityId: number;
      };
    };
  }
): string | null {
  if (!user.universityId || !user.facultyId || !user.majorId) {
    return "บัญชีนักศึกษาของคุณยังไม่ได้ระบุข้อมูลมหาวิทยาลัย คณะ และสาขา กรุณาติดต่อผู้ดูแลระบบ";
  }

  const sameUniversity = course.major.faculty.universityId === user.universityId;
  const sameFaculty = course.major.facultyId === user.facultyId;
  const sameMajor = course.majorId === user.majorId;

  if (!sameUniversity || !sameFaculty || !sameMajor) {
    return "นักศึกษาสามารถดำเนินการได้เฉพาะรายวิชาในมหาวิทยาลัย คณะ และสาขาของตนเองเท่านั้น";
  }

  return null;
}

export async function recordPassedCourseAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อนบันทึกวิชาที่เรียนผ่าน" };
  }

  if (session.role !== "student") {
    return { ok: false, message: "เฉพาะบัญชีนักศึกษาเท่านั้นที่สามารถบันทึกวิชาที่เรียนผ่านได้" };
  }

  const courseId = Number(formData.get("course_id"));
  const grade = String(formData.get("grade") || "").trim().toUpperCase();
  const academicYear = String(formData.get("academic_year") || "2569").trim();
  const semester = String(formData.get("semester") || "1").trim();

  if (!courseId) {
    return { ok: false, message: "ไม่พบรหัสรายวิชา" };
  }

  if (!isPassingGrade(grade)) {
    return {
      ok: false,
      message: "กรุณาระบุเกรดที่ผ่านการเรียนเท่านั้น (A, B+, B, C+, C, D+, D หรือ S)",
    };
  }

  const [user, course] = await Promise.all([
    prisma.user.findUnique({
      where: { userId: session.userId },
      select: {
        userId: true,
        role: true,
        universityId: true,
        facultyId: true,
        majorId: true,
      },
    }),
    getCourseWithHierarchy(courseId),
  ]);

  if (!user) {
    return { ok: false, message: "ไม่พบข้อมูลผู้ใช้งาน" };
  }

  if (!course) {
    return { ok: false, message: "ไม่พบรายวิชาที่เลือก" };
  }

  const ownershipError = checkStudentAcademicMatch(user, course);
  if (ownershipError) {
    return { ok: false, message: ownershipError };
  }

  await prisma.studentPassedCourse.upsert({
    where: {
      userId_courseId: {
        userId: user.userId,
        courseId,
      },
    },
    update: {
      grade,
      academicYear,
      semester,
    },
    create: {
      userId: user.userId,
      courseId,
      grade,
      academicYear,
      semester,
    },
  });

  revalidatePath("/courses");
  return {
    ok: true,
    message: `บันทึกว่าเรียนผ่านวิชา ${course.courseCode} (เกรด ${grade}) เรียบร้อยแล้ว สามารถเขียนรีวิวได้ทันที`,
  };
}

export async function removePassedCourseAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "student") {
    return { ok: false, message: "ไม่มีสิทธิ์ดำเนินการ" };
  }

  const courseId = Number(formData.get("course_id"));
  if (!courseId) {
    return { ok: false, message: "ไม่พบรหัสรายวิชา" };
  }

  const existingReview = await prisma.courseReview.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: session.userId,
      },
    },
  });

  if (existingReview) {
    return {
      ok: false,
      message: "ไม่สามารถยกเลิกสถานะเรียนผ่านได้ เนื่องจากคุณได้เขียนรีวิวรายวิชานี้ไว้แล้ว",
    };
  }

  await prisma.studentPassedCourse.deleteMany({
    where: {
      userId: session.userId,
      courseId,
    },
  });

  revalidatePath("/courses");
  return { ok: true, message: "ยกเลิกสถานะเรียนผ่านของรายวิชานี้เรียบร้อยแล้ว" };
}

export async function submitCourseReviewAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิวรายวิชา" };
  }

  const courseId = Number(formData.get("course_id"));
  const contentRating = clampRating(Number(formData.get("content_rating")));
  const workloadRating = clampRating(Number(formData.get("workload_rating")));
  const gradeDifficultyRating = clampRating(
    Number(formData.get("grade_difficulty_rating"))
  );
  const commentText = String(formData.get("comment_text") || "").trim();
  const academicYear = String(formData.get("academic_year") || "2569").trim();
  const semester = String(formData.get("semester") || "1").trim();

  if (
    !courseId ||
    !contentRating ||
    !workloadRating ||
    !gradeDifficultyRating ||
    !commentText
  ) {
    return {
      ok: false,
      message: "กรุณาให้คะแนนทั้ง 3 ด้าน (1–5) และกรอกความคิดเห็นให้ครบถ้วน",
    };
  }

  const [user, course] = await Promise.all([
    prisma.user.findUnique({
      where: { userId: session.userId },
      select: {
        userId: true,
        role: true,
        universityId: true,
        facultyId: true,
        majorId: true,
      },
    }),
    getCourseWithHierarchy(courseId),
  ]);

  if (!user) {
    return { ok: false, message: "ไม่พบข้อมูลผู้ใช้งาน" };
  }

  if (!course) {
    return { ok: false, message: "ไม่พบรายวิชาที่ต้องการรีวิว" };
  }

  // Enforce student-only rules: own university/faculty/major AND passed course only
  if (user.role === "student") {
    const ownershipError = checkStudentAcademicMatch(user, course);
    if (ownershipError) {
      return {
        ok: false,
        message: "นักศึกษาสามารถรีวิวได้เฉพาะรายวิชาในมหาวิทยาลัย คณะ และสาขาของตนเองเท่านั้น",
      };
    }

    const passedRecord = await prisma.studentPassedCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.userId,
          courseId,
        },
      },
    });

    if (!passedRecord || !isPassingGrade(passedRecord.grade)) {
      return {
        ok: false,
        message:
          "สามารถรีวิวได้เฉพาะรายวิชาที่เรียนผ่านแล้วเท่านั้น กรุณาบันทึกผลการเรียนที่ผ่าน (เกรด A–D หรือ S) ก่อนเขียนรีวิว",
      };
    }
  }

  await prisma.courseReview.upsert({
    where: {
      courseId_userId: {
        courseId,
        userId: session.userId,
      },
    },
    update: {
      contentRating,
      workloadRating,
      gradeDifficultyRating,
      commentText,
      academicYear,
      semester,
    },
    create: {
      courseId,
      userId: session.userId,
      contentRating,
      workloadRating,
      gradeDifficultyRating,
      commentText,
      academicYear,
      semester,
    },
  });

  revalidatePath("/courses");
  return { ok: true, message: "บันทึกรีวิวรายวิชาเรียบร้อยแล้ว" };
}

export async function createCourseAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบก่อนเพิ่มรายวิชา" };
  }

  const majorId = Number(formData.get("major_id"));
  const courseCode = String(formData.get("course_code") || "").trim();
  const courseName = String(formData.get("course_name") || "").trim();
  const yearLevel = Number(formData.get("year_level") || 1);
  const credits = Number(formData.get("credits") || 3);

  if (!majorId || !courseCode || !courseName) {
    return { ok: false, message: "กรุณาระบุสาขา รหัสวิชา และชื่อวิชาให้ครบถ้วน" };
  }

  if (yearLevel < 1 || yearLevel > 6) {
    return { ok: false, message: "ชั้นปีไม่ถูกต้อง" };
  }

  if (session.role === "student") {
    const student = await prisma.user.findUnique({
      where: { userId: session.userId },
      select: { majorId: true },
    });
    if (!student?.majorId || student.majorId !== majorId) {
      return {
        ok: false,
        message: "นักศึกษาสามารถเพิ่มรายวิชาได้เฉพาะในสาขาของตนเองเท่านั้น",
      };
    }
  }

  const existing = await prisma.course.findUnique({
    where: { majorId_courseCode: { majorId, courseCode } },
  });
  if (existing) {
    return { ok: false, message: "มีรหัสวิชานี้ในสาขาดังกล่าวแล้ว" };
  }

  await prisma.course.create({
    data: {
      majorId,
      courseCode,
      courseName,
      yearLevel,
      credits: credits >= 1 && credits <= 12 ? credits : 3,
    },
  });

  revalidatePath("/courses");
  return { ok: true, message: `เพิ่มรายวิชา ${courseCode} เรียบร้อยแล้ว` };
}
