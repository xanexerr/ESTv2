import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUserContext,
  buildUniversityWorkplaceWhere,
} from "@/lib/university-scope";
import { StudentInternshipsClient } from "@/components/StudentInternshipsClient";

export const dynamic = "force-dynamic";

export default async function StudentInternshipsPage() {
  const currentUser = await getCurrentUserContext();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "student") redirect("/my-career");

  const scopeWhere = buildUniversityWorkplaceWhere(
    currentUser.universityId,
    currentUser.role
  );

  const [rounds, workplaces, advisors] = await Promise.all([
    prisma.internshipRound.findMany({
      where: { studentId: currentUser.userId },
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
      where: scopeWhere,
      orderBy: { workplaceName: "asc" },
      select: { workplaceId: true, workplaceName: true, workType: true },
    }),
    prisma.user.findMany({
      where: {
        role: "teacher",
        status: "approved",
        ...(currentUser.universityId
          ? { universityId: currentUser.universityId }
          : {}),
      },
      orderBy: { userFname: "asc" },
      select: {
        userId: true,
        userFname: true,
        userLname: true,
        institution: true,
      },
    }),
  ]);

  const defaultAcademicYear = currentUser.academicYear || "2569";

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
      defaultAcademicYear={defaultAcademicYear}
    />
  );
}
