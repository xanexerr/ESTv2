import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkMode } from "@prisma/client";
import {
  getCurrentUserContext,
  buildUniversityWorkplaceWhere,
} from "@/lib/university-scope";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUserContext();
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workModeRaw = searchParams.get("workMode");
  const province = searchParams.get("province");

  const scopeWhere = buildUniversityWorkplaceWhere(
    currentUser.universityId,
    currentUser.role
  );

  const andClauses: any[] = [scopeWhere];

  if (workModeRaw) {
    if (
      workModeRaw !== WorkMode.onsite &&
      workModeRaw !== WorkMode.remote &&
      workModeRaw !== WorkMode.hybrid
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid workMode (must be onsite, remote, or hybrid)" },
        { status: 400 }
      );
    }
    andClauses.push({ workMode: workModeRaw });
  }

  if (province) {
    andClauses.push({ province });
  }

  const workplaces = await prisma.workplace.findMany({
    where: { AND: andClauses },
    orderBy: { workplaceId: "asc" },
    select: {
      workplaceId: true,
      workplaceName: true,
      workType: true,
      workMode: true,
      province: true,
      rating: true,
    },
  });

  return NextResponse.json({ ok: true, count: workplaces.length, data: workplaces });
}
