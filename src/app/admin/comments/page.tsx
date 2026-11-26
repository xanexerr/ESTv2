import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ToggleCommentButton } from "@/components/AdminUserClient";

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
        <h1 className="text-xl font-semibold text-ink-primary">
          จัดการความคิดเห็น
        </h1>
        <p className="text-sm text-ink-secondary mt-0.5">
          ตรวจสอบและควบคุมการแสดงผลความคิดเห็นของนักศึกษา
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 bg-paper-surface border border-line rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-line">
        <div className="p-5">
          <div className="text-xs text-ink-muted">ความคิดเห็นทั้งหมด</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-primary mt-1">
            {totalComments}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">แสดงผลอยู่</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-brand mt-1">
            {visibleComments}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">ซ่อนอยู่</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-secondary mt-1">
            {hiddenComments}
          </div>
        </div>
      </div>

      <div className="bg-paper-surface rounded-xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-paper-muted/70 text-ink-secondary text-xs font-medium border-b border-line">
              <tr>
                <th className="py-3 px-4 font-mono">รหัสนักศึกษา</th>
                <th className="py-3 px-4">สถานประกอบการ</th>
                <th className="py-3 px-4">ความคิดเห็น</th>
                <th className="py-3 px-4">เวลา</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {comments.map((row) => (
                <tr key={row.commentId} className="hover:bg-paper-bg transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-ink-primary tabular-nums">
                    {row.userId}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/workplaces/${row.workplaceId}`}
                      className="font-medium text-ink-primary hover:text-brand"
                    >
                      #{String(row.workplaceId).padStart(3, "0")}{" "}
                      {row.workplace?.workplaceName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-ink-secondary max-w-md">
                    {row.commentText}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-ink-muted tabular-nums">
                    {new Date(row.commentTime).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {row.show ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        แสดง
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        ซ่อน
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
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
