import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[health] Database check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
