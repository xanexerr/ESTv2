"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { InternshipStatus, ReportCycle, ReportStatus } from "@prisma/client";
import type { ActionResult } from "@/app/actions";

function computeWeekNumber(startDate: Date, workDate: Date): number {
  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );
  const workUtc = Date.UTC(
    workDate.getUTCFullYear(),
    workDate.getUTCMonth(),
    workDate.getUTCDate()
  );
  const diffDays = Math.floor((workUtc - startUtc) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  return Math.floor(diffDays / 7) + 1;
}

function normalizeTools(raw: string): string {
  const parts = raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique.join(", ");
}

function parseDateOnlyUtc(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ==========================================================================
   1. Multi-round Internship Management (Student)
   ========================================================================== */
export async function createInternshipRoundAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "student") {
    return { ok: false, message: "เฉพาะนักศึกษาเท่านั้นที่สามารถสร้างรอบฝึกงานได้" };
  }

  const workplaceId = Number(formData.get("workplace_id"));
  const advisorIdRaw = String(formData.get("advisor_id") || "").trim();
  const academicYear = String(formData.get("academic_year") || "").trim();
  const semester = String(formData.get("semester") || "").trim();
  const position = String(formData.get("position") || "").trim();
  const startDateRaw = String(formData.get("start_date") || "").trim();
  const endDateRaw = String(formData.get("end_date") || "").trim();
  const reportCycleRaw = String(formData.get("report_cycle") || "weekly").trim();
  const closePreviousActive = formData.get("close_previous") !== "false";

  if (!workplaceId || !academicYear || !semester || !startDateRaw) {
    return {
      ok: false,
      message: "กรุณาเลือกสถานประกอบการ ปีการศึกษา ภาคเรียน และวันเริ่มฝึกงาน",
    };
  }

  const startDate = parseDateOnlyUtc(startDateRaw);
  if (!startDate) {
    return { ok: false, message: "รูปแบบวันเริ่มฝึกงานไม่ถูกต้อง" };
  }

  let endDate: Date | null = null;
  if (endDateRaw) {
    endDate = parseDateOnlyUtc(endDateRaw);
    if (!endDate) {
      return { ok: false, message: "รูปแบบวันสิ้นสุดฝึกงานไม่ถูกต้อง" };
    }
    if (endDate < startDate) {
      return { ok: false, message: "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มฝึกงาน" };
    }
  }

  const workplace = await prisma.workplace.findUnique({
    where: { workplaceId },
  });
  if (!workplace) {
    return { ok: false, message: "ไม่พบสถานประกอบการที่เลือก" };
  }

  let advisorId: string | null = null;
  if (advisorIdRaw) {
    const advisor = await prisma.user.findFirst({
      where: { userId: advisorIdRaw, role: "teacher", status: "approved" },
    });
    if (!advisor) {
      return { ok: false, message: "ไม่พบอาจารย์ที่ปรึกษาที่เลือก" };
    }
    advisorId = advisor.userId;
  }

  const existingRounds = await prisma.internshipRound.findMany({
    where: { studentId: session.userId },
    select: { roundNumber: true, status: true, roundId: true },
  });

  const maxRoundNumber = existingRounds.reduce(
    (max, r) => (r.roundNumber > max ? r.roundNumber : max),
    0
  );

  const reportCycle: ReportCycle =
    reportCycleRaw === "biweekly" ? ReportCycle.biweekly : ReportCycle.weekly;

  await prisma.$transaction(async (tx) => {
    if (closePreviousActive) {
      await tx.internshipRound.updateMany({
        where: { studentId: session.userId, status: InternshipStatus.active },
        data: { status: InternshipStatus.completed },
      });
    }

    await tx.internshipRound.create({
      data: {
        studentId: session.userId,
        workplaceId,
        advisorId,
        roundNumber: maxRoundNumber + 1,
        academicYear,
        semester,
        position: position || null,
        startDate,
        endDate,
        reportCycle,
        status: InternshipStatus.active,
      },
    });

    await tx.user.update({
      where: { userId: session.userId },
      data: { workplaceId },
    });
  });

  revalidatePath("/student/internships");
  revalidatePath("/student/logbook");
  revalidatePath("/student/workplace");
  revalidatePath("/teacher/reports");
  return {
    ok: true,
    message: `เริ่มรอบการฝึกงานที่ ${maxRoundNumber + 1} เรียบร้อยแล้ว`,
  };
}

export async function updateInternshipRoundStatusAction(
  roundId: number,
  status: "active" | "completed" | "cancelled"
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, message: "กรุณาเข้าสู่ระบบ" };
  }

  const round = await prisma.internshipRound.findUnique({
    where: { roundId },
  });
  if (!round) {
    return { ok: false, message: "ไม่พบรอบการฝึกงาน" };
  }
  if (session.role !== "admin" && round.studentId !== session.userId) {
    return { ok: false, message: "ไม่มีสิทธิ์แก้ไขรอบการฝึกงานนี้" };
  }

  const nextStatus =
    status === "completed"
      ? InternshipStatus.completed
      : status === "cancelled"
        ? InternshipStatus.cancelled
        : InternshipStatus.active;

  await prisma.$transaction(async (tx) => {
    if (nextStatus === InternshipStatus.active) {
      await tx.internshipRound.updateMany({
        where: {
          studentId: round.studentId,
          status: InternshipStatus.active,
          roundId: { not: roundId },
        },
        data: { status: InternshipStatus.completed },
      });
      await tx.user.update({
        where: { userId: round.studentId },
        data: { workplaceId: round.workplaceId },
      });
    }

    await tx.internshipRound.update({
      where: { roundId },
      data: { status: nextStatus },
    });
  });

  revalidatePath("/student/internships");
  revalidatePath("/student/logbook");
  revalidatePath("/teacher/reports");
  return {
    ok: true,
    message:
      nextStatus === InternshipStatus.completed
        ? "ปิดรอบการฝึกงานเป็นเสร็จสิ้นแล้ว"
        : nextStatus === InternshipStatus.cancelled
          ? "ยกเลิกรอบการฝึกงานแล้ว"
          : "เปิดใช้งานรอบการฝึกงานนี้แล้ว",
  };
}

/* ==========================================================================
   2. Daily Logbook Actions (Student)
   ========================================================================== */
export async function upsertDailyLogAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "student") {
    return { ok: false, message: "เฉพาะนักศึกษาเท่านั้นที่บันทึกการทำงานได้" };
  }

  const roundId = Number(formData.get("round_id"));
  const workDateRaw = String(formData.get("work_date") || "").trim();
  const tasksAssigned = String(formData.get("tasks_assigned") || "").trim();
  const knowledgeGained = String(formData.get("knowledge_gained") || "").trim();
  const toolsUsedRaw = String(formData.get("tools_used") || "").trim();
  const hoursRaw = Number(formData.get("hours_worked") || 8);

  if (!roundId || !workDateRaw || !tasksAssigned || !knowledgeGained) {
    return {
      ok: false,
      message: "กรุณากรอกวันที่ งานที่ได้รับมอบหมาย และความรู้ที่ได้รับให้ครบถ้วน",
    };
  }

  const workDate = parseDateOnlyUtc(workDateRaw);
  if (!workDate) {
    return { ok: false, message: "รูปแบบวันที่ไม่ถูกต้อง" };
  }

  const round = await prisma.internshipRound.findUnique({
    where: { roundId },
  });
  if (!round || round.studentId !== session.userId) {
    return { ok: false, message: "ไม่พบรอบการฝึกงานของคุณ" };
  }
  if (round.status !== InternshipStatus.active) {
    return {
      ok: false,
      message: "รอบการฝึกงานนี้ปิดไปแล้ว ไม่สามารถเพิ่มหรือแก้ไขบันทึกประจำวันได้",
    };
  }

  const hoursWorked =
    Number.isFinite(hoursRaw) && hoursRaw > 0 && hoursRaw <= 24 ? hoursRaw : 8;
  const weekNumber = computeWeekNumber(round.startDate, workDate);
  const toolsUsed = normalizeTools(toolsUsedRaw);

  await prisma.dailyLog.upsert({
    where: {
      roundId_workDate: {
        roundId,
        workDate,
      },
    },
    update: {
      weekNumber,
      tasksAssigned,
      knowledgeGained,
      toolsUsed,
      hoursWorked,
    },
    create: {
      roundId,
      workDate,
      weekNumber,
      tasksAssigned,
      knowledgeGained,
      toolsUsed,
      hoursWorked,
    },
  });

  revalidatePath("/student/logbook");
  revalidatePath("/teacher/reports");
  return {
    ok: true,
    message: `บันทึกงานประจำวันที่ ${workDateRaw} (สัปดาห์ที่ ${weekNumber}) เรียบร้อยแล้ว`,
  };
}

export async function deleteDailyLogAction(logId: number): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "student") {
    return { ok: false, message: "ไม่มีสิทธิ์ลบข้อมูล" };
  }

  const log = await prisma.dailyLog.findUnique({
    where: { logId },
    include: { round: true },
  });
  if (!log || log.round.studentId !== session.userId) {
    return { ok: false, message: "ไม่พบบันทึกประจำวัน" };
  }
  if (log.round.status !== InternshipStatus.active) {
    return { ok: false, message: "ไม่สามารถลบบันทึกของรอบการฝึกงานที่ปิดไปแล้ว" };
  }

  await prisma.dailyLog.delete({ where: { logId } });

  revalidatePath("/student/logbook");
  revalidatePath("/teacher/reports");
  return { ok: true, message: "ลบบันทึกประจำวันเรียบร้อยแล้ว" };
}

/* ==========================================================================
   3. Period Summary Report Actions (Student -> Teacher)
   ========================================================================== */
export async function savePeriodReportAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || session.role !== "student") {
    return { ok: false, message: "เฉพาะนักศึกษาเท่านั้นที่ส่งรายงานสรุปได้" };
  }

  const roundId = Number(formData.get("round_id"));
  const startWeek = Number(formData.get("start_week"));
  const endWeek = Number(formData.get("end_week"));
  const summaryText = String(formData.get("summary_text") || "").trim();
  const challenges = String(formData.get("challenges") || "").trim();
  const intent = String(formData.get("intent") || "submitted").trim();

  if (
    !roundId ||
    !Number.isInteger(startWeek) ||
    !Number.isInteger(endWeek) ||
    startWeek < 1 ||
    endWeek < startWeek ||
    endWeek - startWeek > 3
  ) {
    return { ok: false, message: "ช่วงสัปดาห์ของรายงานไม่ถูกต้อง" };
  }

  if (!summaryText) {
    return { ok: false, message: "กรุณาเขียนสรุปรวมประจำรอบสัปดาห์" };
  }

  const round = await prisma.internshipRound.findUnique({
    where: { roundId },
  });
  if (!round || round.studentId !== session.userId) {
    return { ok: false, message: "ไม่พบรอบการฝึกงานของคุณ" };
  }
  if (round.status !== InternshipStatus.active) {
    return { ok: false, message: "รอบการฝึกงานนี้ปิดไปแล้ว ไม่สามารถส่งรายงานเพิ่มได้" };
  }

  const existing = await prisma.periodReport.findUnique({
    where: {
      roundId_startWeek_endWeek: {
        roundId,
        startWeek,
        endWeek,
      },
    },
  });

  if (existing && existing.status === ReportStatus.reviewed) {
    return {
      ok: false,
      message: "รายงานรอบนี้ผ่านการตรวจจากอาจารย์แล้ว ไม่สามารถแก้ไขได้",
    };
  }

  const nextStatus =
    intent === "draft" ? ReportStatus.draft : ReportStatus.submitted;

  await prisma.periodReport.upsert({
    where: {
      roundId_startWeek_endWeek: {
        roundId,
        startWeek,
        endWeek,
      },
    },
    update: {
      summaryText,
      challenges: challenges || null,
      status: nextStatus,
      submittedAt:
        nextStatus === ReportStatus.submitted ? new Date() : existing?.submittedAt,
    },
    create: {
      roundId,
      startWeek,
      endWeek,
      summaryText,
      challenges: challenges || null,
      status: nextStatus,
      submittedAt: nextStatus === ReportStatus.submitted ? new Date() : null,
    },
  });

  revalidatePath("/student/logbook");
  revalidatePath("/teacher/reports");
  return {
    ok: true,
    message:
      nextStatus === ReportStatus.submitted
        ? `ส่งรายงานสรุปสัปดาห์ที่ ${startWeek === endWeek ? startWeek : `${startWeek}–${endWeek}`} ให้อาจารย์เรียบร้อยแล้ว`
        : "บันทึกร่างรายงานเรียบร้อยแล้ว",
  };
}

export async function teacherReviewPeriodReportAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    return { ok: false, message: "เฉพาะอาจารย์หรือผู้ดูแลระบบเท่านั้นที่ตรวจรายงานได้" };
  }

  const reportId = Number(formData.get("report_id"));
  const decision = String(formData.get("decision") || "").trim();
  const teacherFeedback = String(formData.get("teacher_feedback") || "").trim();

  if (!reportId || (decision !== "reviewed" && decision !== "needs_revision")) {
    return { ok: false, message: "ข้อมูลการตรวจรายงานไม่ถูกต้อง" };
  }

  if (decision === "needs_revision" && !teacherFeedback) {
    return {
      ok: false,
      message: "กรุณาระบุข้อเสนอแนะหรือสิ่งที่ต้องการให้นักศึกษาแก้ไข",
    };
  }

  const report = await prisma.periodReport.findUnique({
    where: { reportId },
    include: { round: true },
  });
  if (!report) {
    return { ok: false, message: "ไม่พบรายงานที่ต้องการตรวจ" };
  }

  if (
    session.role === "teacher" &&
    report.round.advisorId &&
    report.round.advisorId !== session.userId
  ) {
    return { ok: false, message: "คุณไม่ใช่อาจารย์ที่ปรึกษาของรอบฝึกงานนี้" };
  }

  const nextStatus =
    decision === "reviewed"
      ? ReportStatus.reviewed
      : ReportStatus.needs_revision;

  await prisma.periodReport.update({
    where: { reportId },
    data: {
      status: nextStatus,
      teacherFeedback: teacherFeedback || null,
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/teacher/reports");
  revalidatePath("/student/logbook");
  return {
    ok: true,
    message:
      nextStatus === ReportStatus.reviewed
        ? "บันทึกผลการตรวจ (ผ่าน/รับทราบ) เรียบร้อยแล้ว"
        : "ส่งกลับให้นักศึกษาแก้ไขพร้อมข้อเสนอแนะแล้ว",
  };
}
