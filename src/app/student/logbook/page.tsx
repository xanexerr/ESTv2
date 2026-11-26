import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentLogbookClient } from "@/components/StudentLogbookClient";

export const dynamic = "force-dynamic";

export default async function StudentLogbookPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/");

  const params = await searchParams;

  const rounds = await prisma.internshipRound.findMany({
    where: { studentId: session.userId },
    orderBy: [{ status: "asc" }, { roundNumber: "desc" }],
    include: {
      workplace: {
        select: { workplaceId: true, workplaceName: true, workType: true },
      },
      advisor: {
        select: { userId: true, userFname: true, userLname: true },
      },
    },
  });

  if (rounds.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-paper-surface border border-line rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-lg font-semibold text-ink-primary">
          ยังไม่มีรอบการฝึกงานสำหรับบันทึกงาน
        </h1>
        <p className="text-sm text-ink-secondary">
          สร้างรอบการฝึกงานก่อนเพื่อเริ่มบันทึกการทำงานรายวันและส่งรายงานสรุปรอบ 1–2 สัปดาห์ให้อาจารย์
        </p>
        <Link
          href="/student/internships"
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
        >
          ไปสร้างรอบการฝึกงาน
        </Link>
      </div>
    );
  }

  const requestedRoundId = params.round ? Number(params.round) : null;
  const selectedRound =
    rounds.find((r) => r.roundId === requestedRoundId) ||
    rounds.find((r) => r.status === "active") ||
    rounds[0];

  const [dailyLogs, periodReports] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { roundId: selectedRound.roundId },
      orderBy: { workDate: "desc" },
    }),
    prisma.periodReport.findMany({
      where: { roundId: selectedRound.roundId },
      orderBy: [{ startWeek: "desc" }, { endWeek: "desc" }],
      include: {
        reviewedBy: {
          select: { userFname: true, userLname: true },
        },
      },
    }),
  ]);

  const serializedRounds = rounds.map((r) => ({
    roundId: r.roundId,
    roundNumber: r.roundNumber,
    academicYear: r.academicYear,
    semester: r.semester,
    position: r.position,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate ? r.endDate.toISOString() : null,
    reportCycle: r.reportCycle,
    status: r.status,
    workplace: r.workplace,
    advisor: r.advisor,
  }));

  const serializedSelected = serializedRounds.find(
    (r) => r.roundId === selectedRound.roundId
  )!;

  const serializedLogs = dailyLogs.map((l) => ({
    logId: l.logId,
    roundId: l.roundId,
    workDate: l.workDate.toISOString().slice(0, 10),
    weekNumber: l.weekNumber,
    tasksAssigned: l.tasksAssigned,
    knowledgeGained: l.knowledgeGained,
    toolsUsed: l.toolsUsed,
    hoursWorked: l.hoursWorked,
  }));

  const serializedReports = periodReports.map((rep) => ({
    reportId: rep.reportId,
    roundId: rep.roundId,
    startWeek: rep.startWeek,
    endWeek: rep.endWeek,
    summaryText: rep.summaryText,
    challenges: rep.challenges,
    status: rep.status,
    submittedAt: rep.submittedAt ? rep.submittedAt.toISOString() : null,
    teacherFeedback: rep.teacherFeedback,
    reviewedAt: rep.reviewedAt ? rep.reviewedAt.toISOString() : null,
    reviewedByName: rep.reviewedBy
      ? `${rep.reviewedBy.userFname} ${rep.reviewedBy.userLname}`.trim()
      : null,
  }));

  return (
    <StudentLogbookClient
      rounds={serializedRounds}
      selectedRound={serializedSelected}
      dailyLogs={serializedLogs}
      periodReports={serializedReports}
    />
  );
}
