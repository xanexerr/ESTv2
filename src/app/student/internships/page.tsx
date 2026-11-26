import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentInternshipsClient } from "@/components/StudentInternshipsClient";

export const dynamic = "force-dynamic";

export default async function StudentInternshipsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/");

  const [student, rounds, workplaces, advisors] = await Promise.all([
    prisma.user.findUnique({
      where: { userId: session.userId },
      select: { academicYear: true },
    }),
    prisma.internshipRound.findMany({
      where: { studentId: session.userId },
      orderBy: [{ roundNumber: "desc" }],
      include: {
        workplace: {
          select: { workplaceId: true, workplaceName: true, workType: true },
        },
        advisor: {
          select: { userId: true, userFname: true, userLname: true },
        },
        _count: {
          select: { dailyLogs: true, periodReports: true },
        },
      },
    }),
    prisma.workplace.findMany({
      where: { show: true },
      orderBy: { workplaceName: "asc" },
      select: { workplaceId: true, workplaceName: true, workType: true },
    }),
    prisma.user.findMany({
      where: { role: "teacher", status: "approved" },
      orderBy: { userFname: "asc" },
      select: {
        userId: true,
        userFname: true,
        userLname: true,
        institution: true,
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
    logCount: r._count.dailyLogs,
    reportCount: r._count.periodReports,
  }));

  return (
    <StudentInternshipsClient
      rounds={serializedRounds}
      workplaces={workplaces}
      advisors={advisors}
      defaultAcademicYear={student?.academicYear || "2569"}
    />
  );
}
