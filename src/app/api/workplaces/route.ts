import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkMode } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workModeRaw = searchParams.get("workMode");
  const province = searchParams.get("province");

  const where: any = { show: true };

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
    where.workMode = workModeRaw;
  }

  if (province) {
    where.province = province;
  }

  const workplaces = await prisma.workplace.findMany({
    where,
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
