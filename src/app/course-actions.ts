"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions";

function clampRating(val: number): number | null {
  if (!Number.isInteger(val) || val < 1 || val > 5) return null;
  return val;
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

  const course = await prisma.course.findUnique({ where: { courseId } });
  if (!course) {
    return { ok: false, message: "ไม่พบรายวิชาที่ต้องการรีวิว" };
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
