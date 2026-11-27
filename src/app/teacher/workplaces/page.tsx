import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkTypeBadge } from "@/components/WorkTypeIcon";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherWorkplacesPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "teacher" && session.role !== "admin") {
    redirect("/");
  }

  const workplaces = await prisma.workplace.findMany({
    where: { userId: session.userId },
    orderBy: { workplaceId: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            จัดการสถานประกอบการของฉัน
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            รายการสถานประกอบการที่คุณเพิ่มเข้าสู่ระบบทั้งหมด{" "}
            <span className="font-mono tabular-nums">{workplaces.length}</span>{" "}
            แห่ง
          </p>
        </div>

        <Link
          href="/teacher/workplaces/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
        >
          <Plus strokeWidth={1.5} className="w-4 h-4" />
          เพิ่มสถานประกอบการ
        </Link>
      </div>

      <div className="bg-paper-surface rounded-xl border border-line overflow-hidden">
        {workplaces.length === 0 ? (
          <div className="p-12 text-center text-ink-secondary">
            <p className="text-sm mb-4">
              ยังไม่มีข้อมูลสถานประกอบการที่คุณเพิ่มไว้
            </p>
            <Link
              href="/teacher/workplaces/new"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand text-white dark:text-zinc-950 text-sm font-medium"
            >
              เพิ่มสถานประกอบการแห่งแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-paper-muted/70 text-ink-secondary text-xs font-medium border-b border-line">
                <tr>
                  <th className="py-3 px-4 font-mono w-20">รหัส</th>
                  <th className="py-3 px-4">ชื่อสถานประกอบการ</th>
                  <th className="py-3 px-4">ประเภทงาน</th>
                  <th className="py-3 px-4">รายละเอียด</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {workplaces.map((row) => (
                  <tr key={row.workplaceId} className="hover:bg-paper-bg transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-ink-muted tabular-nums">
                      #{String(row.workplaceId).padStart(3, "0")}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink-primary">
                      {row.workplaceName}
                    </td>
                    <td className="py-3.5 px-4">
                      <WorkTypeBadge type={row.workType} />
                    </td>
                    <td className="py-3.5 px-4 text-ink-secondary text-xs max-w-md truncate">
                      {row.description}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-3 text-xs font-medium">
                      <Link
                        href={`/workplaces/${row.workplaceId}`}
                        className="text-ink-secondary hover:text-ink-primary"
                      >
                        ดูข้อมูล
                      </Link>
                      <Link
                        href={`/teacher/workplaces/${row.workplaceId}`}
                        className="text-brand hover:text-brand-hover"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
