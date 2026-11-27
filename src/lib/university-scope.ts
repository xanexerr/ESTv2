import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

/**
 * Fetch the currently authenticated user along with their University / Faculty / Major.
 */
export async function getCurrentUserContext() {
  const session = await getSessionUser();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { userId: session.userId },
    select: {
      userId: true,
      username: true,
      role: true,
      status: true,
      userFname: true,
      userLname: true,
      universityId: true,
      facultyId: true,
      majorId: true,
      workplaceId: true,
      academicYear: true,
      university: {
        select: { universityId: true, code: true, name: true, shortName: true },
      },
      faculty: {
        select: { facultyId: true, code: true, name: true },
      },
      major: {
        select: { majorId: true, code: true, name: true },
      },
    },
  });

  return user;
}

/**
 * Workplaces & Internships visibility rule:
 * A workplace is visible to students/teachers of university U ONLY IF
 * at least one student from university U has interned there, selected it,
 * reviewed it, or added it into the system.
 * Admins see all visible workplaces across universities.
 */
export function buildUniversityWorkplaceWhere(
  universityId: number | null | undefined,
  role?: string | null
): Prisma.WorkplaceWhereInput {
  if (role === "admin" || !universityId) {
    return { show: true };
  }

  return {
    show: true,
    OR: [
      { createdBy: { universityId, role: "student" } },
      { selectedByUsers: { some: { universityId, role: "student" } } },
      { internshipRounds: { some: { student: { universityId } } } },
      { comments: { some: { user: { universityId, role: "student" } } } },
    ],
  };
}
