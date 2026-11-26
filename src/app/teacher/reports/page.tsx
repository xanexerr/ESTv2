import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeacherReportsClient } from "@/components/TeacherReportsClient";

export const dynamic = "force-dynamic";

export default async function TeacherReportsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "teacher" && session.role !== "admin") {
    redirect("/");
  }

  const reports = await prisma.periodReport.findMany({
    where: {
      status: { not: "draft" },
      ...(session.role === "teacher"
        ? {
            round: {
              OR: [{ advisorId: session.userId }, { advisorId: null }],
            },
          }
        : {}),
    },
    orderBy: [{ submittedAt: "desc" }, { reportId: "desc" }],
    include: {
      round: {
        include: {
          workplace: { select: { workplaceName: true } },
          student: {
            select: {
              userId: true,
              userFname: true,
              userLname: true,
              institution: true,
            },
          },
          dailyLogs: {
            orderBy: { workDate: "asc" },
          },
        },
      },
    },
  });

  const serialized = reports.map((rep) => ({
    reportId: rep.reportId,
    startWeek: rep.startWeek,
    endWeek: rep.endWeek,
    summaryText: rep.summaryText,
    challenges: rep.challenges,
    status: rep.status,
    submittedAt: rep.submittedAt ? rep.submittedAt.toISOString() : null,
    teacherFeedback: rep.teacherFeedback,
    reviewedAt: rep.reviewedAt ? rep.reviewedAt.toISOString() : null,
    round: {
      roundId: rep.round.roundId,
      roundNumber: rep.round.roundNumber,
      academicYear: rep.round.academicYear,
      semester: rep.round.semester,
      position: rep.round.position,
      reportCycle: rep.round.reportCycle,
      workplaceName: rep.round.workplace.workplaceName,
      studentId: rep.round.student.userId,
      studentName: `${rep.round.student.userFname} ${rep.round.student.userLname}`.trim(),
      studentInstitution: rep.round.student.institution,
    },
    dailyLogs: rep.round.dailyLogs
      .filter(
        (l) => l.weekNumber >= rep.startWeek && l.weekNumber <= rep.endWeek
      )
      .map((l) => ({
        logId: l.logId,
        workDate: l.workDate.toISOString().slice(0, 10),
        weekNumber: l.weekNumber,
        tasksAssigned: l.tasksAssigned,
        knowledgeGained: l.knowledgeGained,
        toolsUsed: l.toolsUsed,
        hoursWorked: l.hoursWorked,
      })),
  }));

  return <TeacherReportsClient reports={serialized} />;
}
