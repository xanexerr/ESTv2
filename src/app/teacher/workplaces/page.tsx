import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkTypeBadge } from "@/components/WorkTypeIcon";
import { Briefcase, PlusCircle, Building2 } from "lucide-react";

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
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-ssp-primary" />
            จัดการสถานประกอบการของฉัน
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            รายการสถานประกอบการที่คุณเป็นผู้เพิ่มเข้าสู่ระบบทั้งหมด{" "}
            {workplaces.length} แห่ง
          </p>
        </div>

        <Link
          href="/teacher/workplaces/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ssp-primary hover:bg-ssp-dark text-white text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> เพิ่มสถานประกอบการ
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {workplaces.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm mb-4">
              ยังไม่มีข้อมูลสถานประกอบการที่คุณเพิ่มไว้
            </p>
            <Link
              href="/teacher/workplaces/new"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ssp-primary text-white text-xs font-semibold"
            >
              เพิ่มสถานประกอบการแห่งแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 text-center w-20">#</th>
                  <th className="py-3.5 px-4">ชื่อสถานประกอบการ</th>
                  <th className="py-3.5 px-4 text-center">ประเภทงาน</th>
                  <th className="py-3.5 px-4">รายละเอียด</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workplaces.map((row) => (
                  <tr key={row.workplaceId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                      #{row.workplaceId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {row.workplaceName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <WorkTypeBadge type={row.workType} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-md">
                      {row.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/workplaces/${row.workplaceId}`}
                          className="px-3 py-1 rounded-full border border-ssp-primary text-ssp-primary hover:bg-ssp-light text-xs font-semibold transition"
                        >
                          รายละเอียด
                        </Link>
                        <Link
                          href={`/teacher/workplaces/${row.workplaceId}`}
                          className="px-3 py-1 rounded-full bg-ssp-amber hover:bg-ssp-amberDark text-slate-900 text-xs font-semibold transition"
                        >
                          แก้ไขข้อมูล
                        </Link>
                      </div>
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
