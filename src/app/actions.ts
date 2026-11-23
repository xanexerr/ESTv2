"use server";

import { prisma, recalculateWorkplaceRating } from "@/lib/prisma";
import { createSessionCookie, clearSessionCookie, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Role } from "@prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
  redirectTo?: string;
}

/* ==========================================================================
   1. Authentication Actions
   ========================================================================== */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const usernameInput = String(formData.get("username") || "").trim();
  const passwordInput = String(formData.get("password") || "");

  if (!usernameInput || !passwordInput) {
    return { ok: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ userId: usernameInput }, { username: usernameInput }],
      password: passwordInput,
    },
  });

  if (!user) {
    return { ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง" };
  }

  await createSessionCookie({
    userId: user.userId,
    username: user.username,
    role: user.role,
    userFname: user.userFname,
    userLname: user.userLname,
  });

  revalidatePath("/");
  return { ok: true, message: "เข้าสู่ระบบสำเร็จ", redirectTo: "/" };
}

export async function logoutAction(): Promise<ActionResult> {
  await clearSessionCookie();
  revalidatePath("/");
  return { ok: true, message: "ออกจากระบบเรียบร้อยแล้ว", redirectTo: "/" };
}

/* ==========================================================================
   2. Profile & User Management Actions
   ========================================================================== */
export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "คุณยังไม่ได้เข้าสู่ระบบ", redirectTo: "/login" };
  }

  const userFname = String(formData.get("user_fname") || "").trim();
  const userLname = String(formData.get("user_lname") || "").trim();
  const userTel = String(formData.get("user_tel") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!userFname || !userLname || !password) {
    return { ok: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const updated = await prisma.user.update({
    where: { userId: session.userId },
    data: {
      userFname,
      userLname,
      userTel,
      password,
    },
  });

  await createSessionCookie({
    userId: updated.userId,
    username: updated.username,
    role: updated.role,
    userFname: updated.userFname,
    userLname: updated.userLname,
  });

  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true, message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!" };
}

export async function adminCreateUserAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || (session.role !== "admin" && session.role !== "teacher")) {
    return { ok: false, message: "คุณไม่มีสิทธิเข้าถึง!" };
  }

  const username = String(formData.get("username") || "").trim();
  const userFname = String(formData.get("user_fname") || "").trim();
  const userLname = String(formData.get("user_lname") || "").trim();
  const userTel = String(formData.get("user_tel") || "").trim();
  const userTypeRaw = String(formData.get("user_type") || "student").trim();
  const role: Role =
    userTypeRaw === "admin" && session.role === "admin"
      ? Role.admin
      : userTypeRaw === "teacher"
      ? Role.teacher
      : Role.student;

  if (!username || !userFname || !userLname) {
    return { ok: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ userId: username }, { username }],
    },
  });

  if (existing) {
    return { ok: false, message: "เคยลงทะเบียนบัญชีรหัสนี้ไปแล้ว" };
  }

  await prisma.user.create({
    data: {
      userId: username,
      username,
      password: username,
      userFname,
      userLname,
      userTel,
      role,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true, message: "เพิ่มผู้ใช้สำเร็จ!", redirectTo: "/admin/users" };
}

export async function adminUpdateUserAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { ok: false, message: "คุณไม่มีสิทธิเข้าถึง!" };
  }

  const oldUserId = String(formData.get("old_user_id") || "").trim();
  const userId = String(formData.get("user_id") || "").trim();
  const userFname = String(formData.get("user_fname") || "").trim();
  const userLname = String(formData.get("user_lname") || "").trim();
  const userTel = String(formData.get("user_tel") || "").trim();
  const roleRaw = String(formData.get("role") || "student").trim();
  const password = String(formData.get("password") || "").trim();

  const role: Role =
    roleRaw === "admin" ? Role.admin : roleRaw === "teacher" ? Role.teacher : Role.student;

  await prisma.user.update({
    where: { userId: oldUserId },
    data: {
      userId,
      username: userId,
      userFname,
      userLname,
      userTel,
      role,
      password,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true, message: "แก้ไขข้อมูลผู้ใช้สำเร็จ!", redirectTo: "/admin/users" };
}

export async function adminDeleteUserAction(userId: string): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { ok: false, message: "คุณไม่มีสิทธิเข้าถึง!" };
  }

  const commentsCount = await prisma.comment.count({
    where: { userId },
  });

  if (commentsCount > 0) {
    return {
      ok: false,
      message: "ไม่สามารถลบบัญชีได้! เนื่องจากบัญชีนี้ได้ทำการเพิ่มความคิดเห็น/ข้อมูลสู่เว็บไซต์แล้ว",
    };
  }

  await prisma.user.delete({
    where: { userId },
  });

  revalidatePath("/admin/users");
  return { ok: true, message: "ลบบัญชีผู้ใช้ออกจากระบบแล้ว!", redirectTo: "/admin/users" };
}

/* ==========================================================================
   3. Workplace Actions (Student, Teacher, Admin)
   ========================================================================== */
export async function selectWorkplaceAction(workplaceId: number): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "คุณยังไม่ได้เข้าสู่ระบบ", redirectTo: "/login" };
  }

  await prisma.user.update({
    where: { userId: session.userId },
    data: { workplaceId },
  });

  revalidatePath(`/workplaces/${workplaceId}`);
  revalidatePath("/student/workplace");
  revalidatePath("/");
  return {
    ok: true,
    message: "เลือกสถานประกอบการสำเร็จ!",
    redirectTo: "/student/workplace",
  };
}

export async function createWorkplaceAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "คุณยังไม่ได้เข้าสู่ระบบ", redirectTo: "/login" };
  }

  const workplaceName = String(formData.get("workplace_name") || "").trim();
  const workType = String(formData.get("work_type") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const workTel = String(formData.get("work_tel") || "").trim();
  const workplaceAddress = String(formData.get("workplace_address") || "").trim();
  const map = String(formData.get("map") || "").trim();

  if (!workplaceName || !workplaceAddress) {
    return { ok: false, message: "กรุณากรอกชื่อและที่อยู่สถานประกอบการ" };
  }

  const created = await prisma.workplace.create({
    data: {
      workplaceName,
      workType,
      description,
      workTel,
      workplaceAddress,
      map,
      userId: session.role === "admin" ? null : session.userId,
      rating: 0,
      show: true,
    },
  });

  // If created by a student, automatically assign this workplace to their profile
  if (session.role === "student") {
    await prisma.user.update({
      where: { userId: session.userId },
      data: { workplaceId: created.workplaceId },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/workplaces");
  revalidatePath("/teacher/workplaces");
  revalidatePath("/student/workplace");

  const redirectTo =
    session.role === "admin"
      ? "/admin/workplaces"
      : session.role === "teacher"
      ? "/teacher/workplaces"
      : "/student/workplace";

  return {
    ok: true,
    message: "เพิ่มสถานประกอบการสำเร็จ!",
    redirectTo,
  };
}

export async function updateWorkplaceAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "คุณยังไม่ได้เข้าสู่ระบบ", redirectTo: "/login" };
  }

  const workplaceId = Number(formData.get("workplace_id"));
  const workplaceName = String(formData.get("workplace_name") || "").trim();
  const workType = String(formData.get("work_type") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const workTel = String(formData.get("work_tel") || "").trim();
  const workplaceAddress = String(formData.get("workplace_address") || "").trim();
  const map = String(formData.get("map") || "").trim();

  if (!workplaceId || !workplaceName) {
    return { ok: false, message: "ข้อมูลไม่ครบถ้วน" };
  }

  await prisma.workplace.update({
    where: { workplaceId },
    data: {
      workplaceName,
      workType,
      description,
      workTel,
      workplaceAddress,
      map,
    },
  });

  revalidatePath("/");
  revalidatePath(`/workplaces/${workplaceId}`);
  revalidatePath("/admin/workplaces");
  revalidatePath("/teacher/workplaces");
  revalidatePath("/student/workplace");

  const redirectTo =
    session.role === "admin"
      ? "/admin/workplaces"
      : session.role === "teacher"
      ? "/teacher/workplaces"
      : "/student/workplace";

  return {
    ok: true,
    message: "บันทึกข้อมูลสถานประกอบการเรียบร้อยแล้ว!",
    redirectTo,
  };
}

export async function toggleWorkplaceVisibilityAction(workplaceId: number): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { ok: false, message: "คุณไม่มีสิทธิเข้าถึง!" };
  }

  const wp = await prisma.workplace.findUnique({ where: { workplaceId } });
  if (!wp) {
    return { ok: false, message: "ไม่พบสถานประกอบการ" };
  }

  await prisma.workplace.update({
    where: { workplaceId },
    data: { show: !wp.show },
  });

  revalidatePath("/");
  revalidatePath("/admin/workplaces");
  revalidatePath(`/admin/workplaces/${workplaceId}`);
  return {
    ok: true,
    message: !wp.show ? "เปิดแสดงผลสถานประกอบการแล้ว" : "ซ่อนสถานประกอบการแล้ว",
  };
}

export async function deleteWorkplaceAction(workplaceId: number): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || (session.role !== "admin" && session.role !== "teacher")) {
    return { ok: false, message: "คุณไม่มีสิทธิเข้าถึง!" };
  }

  const commentCount = await prisma.comment.count({
    where: { workplaceId },
  });

  if (commentCount > 0) {
    return {
      ok: false,
      message: "ไม่สามารถลบได้! เนื่องจากได้มีนักเรียน นักศึกษา แสดงความคิดเห็นไว้แล้ว",
    };
  }

  await prisma.user.updateMany({
    where: { workplaceId },
    data: { workplaceId: null },
  });

  await prisma.workplace.delete({
    where: { workplaceId },
  });

  revalidatePath("/");
  revalidatePath("/admin/workplaces");
  revalidatePath("/teacher/workplaces");

  return {
    ok: true,
    message: "ลบสถานประกอบการออกจากระบบแล้ว!",
    redirectTo: session.role === "admin" ? "/admin/workplaces" : "/teacher/workplaces",
  };
}

/* ==========================================================================
   4. Review / Comment Actions (with Image Upload & Rating Recalculation)
   ========================================================================== */
async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
  const imgDir = path.join(process.cwd(), "public", "img");
  await mkdir(imgDir, { recursive: true });
  await writeFile(path.join(imgDir, fileName), buffer);
  return fileName;
}

export async function submitCommentAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "คุณยังไม่ได้เข้าสู่ระบบ", redirectTo: "/login" };
  }

  const workplaceId = Number(formData.get("workplace_id"));
  const rating = Number(formData.get("rate") || 5);
  const commentText = String(formData.get("comment") || "").trim();
  const file = formData.get("img") as File | null;

  if (!workplaceId || !commentText) {
    return { ok: false, message: "กรุณากรอกความคิดเห็นและให้คะแนน" };
  }

  const existing = await prisma.comment.findFirst({
    where: { userId: session.userId },
  });

  if (existing) {
    return {
      ok: false,
      message: "คุณได้แสดงความคิดเห็นไปแล้ว สามารถแก้ไขความคิดเห็นเดิมได้",
      redirectTo: "/student/workplace",
    };
  }

  const uploadedFileName = await saveUploadedImage(file);

  await prisma.comment.create({
    data: {
      userId: session.userId,
      workplaceId,
      rating,
      commentText,
      img: uploadedFileName,
      show: true,
    },
  });

  await recalculateWorkplaceRating(workplaceId);

  revalidatePath("/");
  revalidatePath(`/workplaces/${workplaceId}`);
  revalidatePath("/student/workplace");
  revalidatePath("/admin/comments");

  return {
    ok: true,
    message: "แสดงความคิดเห็นสำเร็จ! ระบบบันทึกข้อมูลของคุณเรียบร้อยแล้ว",
    redirectTo: `/workplaces/${workplaceId}`,
  };
}

export async function updateCommentAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "คุณยังไม่ได้เข้าสู่ระบบ", redirectTo: "/login" };
  }

  const workplaceId = Number(formData.get("workplace_id"));
  const rating = Number(formData.get("rate") || 5);
  const commentText = String(formData.get("comment") || "").trim();
  const file = formData.get("img") as File | null;

  const existing = await prisma.comment.findFirst({
    where: { userId: session.userId },
  });

  if (!existing) {
    return { ok: false, message: "ไม่พบความคิดเห็นเดิมของคุณ" };
  }

  const uploadedFileName = await saveUploadedImage(file);

  await prisma.comment.update({
    where: { commentId: existing.commentId },
    data: {
      commentText,
      rating,
      ...(uploadedFileName ? { img: uploadedFileName } : {}),
    },
  });

  const targetWpId = workplaceId || existing.workplaceId;
  await recalculateWorkplaceRating(targetWpId);

  revalidatePath("/");
  revalidatePath(`/workplaces/${targetWpId}`);
  revalidatePath("/student/workplace");
  revalidatePath("/admin/comments");

  return {
    ok: true,
    message: "แก้ไขความคิดเห็นเรียบร้อยแล้ว!",
    redirectTo: `/workplaces/${targetWpId}`,
  };
}

export async function toggleCommentVisibilityAction(commentId: number): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { ok: false, message: "คุณไม่มีสิทธิเข้าถึง!" };
  }

  const comment = await prisma.comment.findUnique({
    where: { commentId },
  });

  if (!comment) {
    return { ok: false, message: "ไม่พบความคิดเห็น" };
  }

  await prisma.comment.update({
    where: { commentId },
    data: { show: !comment.show },
  });

  await recalculateWorkplaceRating(comment.workplaceId);

  revalidatePath("/");
  revalidatePath(`/workplaces/${comment.workplaceId}`);
  revalidatePath("/admin/comments");

  return {
    ok: true,
    message: !comment.show ? "เปิดแสดงผลความคิดเห็นแล้ว" : "ซ่อนความคิดเห็นแล้ว",
  };
}
