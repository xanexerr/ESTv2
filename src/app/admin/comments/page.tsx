import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ToggleCommentButton } from "@/components/AdminUserClient";
import { MessageSquare, CheckCircle2, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const [totalComments, visibleComments, comments] = await Promise.all([
    prisma.comment.count(),
    prisma.comment.count({ where: { show: true } }),
    prisma.comment.findMany({
      orderBy: { commentTime: "desc" },
      include: {
        workplace: {
          select: { workplaceName: true },
        },
      },
    }),
  ]);

  const hiddenComments = totalComments - visibleComments;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-ssp-primary" />
          ระบบจัดการความคิดเห็น (Review Moderation)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          ตรวจสอบและควบคุมการแสดงผลความคิดเห็นของนักศึกษา
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-ssp-light text-ssp-primary flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">ความคิดเห็นทั้งหมด</div>
            <div className="text-2xl font-bold text-slate-800">
              {totalComments}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">แสดงผลอยู่</div>
            <div className="text-2xl font-bold text-slate-800">
              {visibleComments}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">ซ่อนอยู่</div>
            <div className="text-2xl font-bold text-slate-800">
              {hiddenComments}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">รหัสนักศึกษา</th>
                <th className="py-3.5 px-4">สถานประกอบการ</th>
                <th className="py-3.5 px-4">ความคิดเห็น</th>
                <th className="py-3.5 px-4 text-center">เวลาแสดงความคิดเห็น</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {comments.map((row) => (
                <tr key={row.commentId} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.userId}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/workplaces/${row.workplaceId}`}
                      className="font-medium text-slate-800 hover:text-ssp-primary"
                    >
                      #{row.workplaceId} {row.workplace?.workplaceName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-md">
                    {row.commentText}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                    {new Date(row.commentTime).toLocaleString("th-TH")}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.show ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        แสดง
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        ไม่แสดง
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <ToggleCommentButton commentId={row.commentId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
