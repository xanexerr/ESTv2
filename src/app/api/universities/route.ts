import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const universities = await prisma.university.findMany({
    orderBy: { code: "asc" },
    include: {
      faculties: {
        orderBy: { code: "asc" },
        include: {
          majors: {
            orderBy: { name: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    count: universities.length,
    data: universities,
  });
}
