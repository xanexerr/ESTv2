import React from "react";
import { prisma } from "@/lib/prisma";
import { getRoleLabel } from "@/lib/constants";
import { ApprovalActionsClient } from "@/components/ApprovalActionsClient";
import { FileText, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filterStatus =
    sp.status === "approved" || sp.status === "rejected"
      ? sp.status
      : "pending";

  const [pendingCount, approvedCount, rejectedCount, requests] =
    await Promise.all([
      prisma.user.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { status: "approved", role: { not: "admin" } } }),
      prisma.user.count({ where: { status: "rejected" } }),
      prisma.user.findMany({
        where: {
          status: filterStatus,
          role: { not: "admin" },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          อนุมัติคำขอสมัครสมาชิก
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          ตรวจสอบหลักฐานการเรียนหรือการทำงานในมหาวิทยาลัยก่อนเปิดใช้งานบัญชี
        </p>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-3 bg-paper-surface border border-line rounded-xl divide-x divide-line">
        <a
          href="/admin/approvals?status=pending"
          className={`p-4 transition-colors ${
            filterStatus === "pending" ? "bg-brand-subtle" : "hover:bg-paper-muted/50"
          }`}
        >
          <div className="text-xs text-ink-muted">รอตรวจสอบ</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-brand mt-0.5">
            {pendingCount}
          </div>
        </a>
        <a
          href="/admin/approvals?status=approved"
          className={`p-4 transition-colors ${
            filterStatus === "approved" ? "bg-brand-subtle" : "hover:bg-paper-muted/50"
          }`}
        >
          <div className="text-xs text-ink-muted">อนุมัติแล้ว</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-primary mt-0.5">
            {approvedCount}
          </div>
        </a>
        <a
          href="/admin/approvals?status=rejected"
          className={`p-4 transition-colors ${
            filterStatus === "rejected" ? "bg-brand-subtle" : "hover:bg-paper-muted/50"
          }`}
        >
          <div className="text-xs text-ink-muted">ปฏิเสธ</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-secondary mt-0.5">
            {rejectedCount}
          </div>
        </a>
      </div>

      {/* Requests Table */}
      <div className="bg-paper-surface border border-line rounded-xl overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            ไม่มีรายการคำขอในสถานะนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-paper-muted text-ink-secondary text-xs font-medium border-b border-line">
                <tr>
                  <th className="py-3 px-4 font-mono">รหัส / ชื่อผู้ใช้</th>
                  <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-4">บทบาท</th>
                  <th className="py-3 px-4">สถาบัน / ปีการศึกษา</th>
                  <th className="py-3 px-4">หลักฐาน</th>
                  <th className="py-3 px-4 text-right">การอนุมัติ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((u) => (
                  <tr key={u.userId} className="hover:bg-paper-bg transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-ink-primary">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink-primary">
                      {u.userFname} {u.userLname}
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-secondary">
                      {getRoleLabel(u.role)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="text-ink-primary">
                        {u.institution || "—"}
                      </div>
                      <div className="text-ink-muted font-mono tabular-nums">
                        ปีการศึกษา {u.academicYear || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {u.evidenceFile ? (
                        <a
                          href={u.evidenceFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand hover:underline font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                          ดูหลักฐาน
                          <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                        </a>
                      ) : (
                        <span className="text-ink-muted">ไม่มีไฟล์</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ApprovalActionsClient
                        userId={u.userId}
                        currentStatus={u.status}
                      />
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
