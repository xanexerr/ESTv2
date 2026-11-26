import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkTypeBadge } from "@/components/WorkTypeIcon";
import { WorkplaceFormClient } from "@/components/WorkplaceFormClient";

export const dynamic = "force-dynamic";

export default async function StudentWorkplacePage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const [createdWp, userRecord, existingComment] = await Promise.all([
    prisma.workplace.findFirst({
      where: { userId: session.userId },
    }),
    prisma.user.findUnique({
      where: { userId: session.userId },
      include: { workplace: true },
    }),
    prisma.comment.findFirst({
      where: { userId: session.userId },
    }),
  ]);

  const selectedWp = createdWp || userRecord?.workplace || null;
  const hasComment = !!existingComment;

  return (
    <div className="max-w-2xl mx-auto my-4">
      {createdWp ? (
        <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
          <div className="p-6 border-b border-line flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="text-xs text-ink-muted mb-1">
                ผู้เพิ่มข้อมูลสถานประกอบการ
              </div>
              <h1 className="text-lg font-semibold text-ink-primary">
                แก้ไขข้อมูลสถานประกอบการของคุณ
              </h1>
            </div>
            <Link
              href={`/workplaces/${createdWp.workplaceId}`}
              className="text-xs font-medium text-brand hover:text-brand-hover"
            >
              ดูหน้าแสดงผล
            </Link>
          </div>

          <WorkplaceFormClient
            mode="edit"
            initialData={createdWp}
            cancelHref="/"
            extraFooter={
              <Link
                href={hasComment ? "/student/review/edit" : "/student/review"}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg border border-line-strong text-ink-primary hover:bg-paper-muted text-sm font-medium transition-colors"
              >
                {hasComment
                  ? "แก้ไขความคิดเห็นของคุณ"
                  : "เพิ่มความคิดเห็นและให้คะแนนรีวิว"}
              </Link>
            }
          />
        </div>
      ) : selectedWp ? (
        <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
          <div className="p-6 border-b border-line flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="text-xs text-ink-muted mb-1">
                สถานประกอบการที่เลือกไว้
              </div>
              <h1 className="text-lg font-semibold text-ink-primary">
                สถานประกอบการของคุณ
              </h1>
            </div>
            <Link
              href={`/workplaces/${selectedWp.workplaceId}`}
              className="text-xs font-medium text-brand hover:text-brand-hover"
            >
              ดูหน้ารายละเอียด
            </Link>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2 pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-muted tabular-nums">
                  #{String(selectedWp.workplaceId).padStart(3, "0")}
                </span>
                <WorkTypeBadge type={selectedWp.workType} />
              </div>
              <h2 className="text-xl font-semibold text-ink-primary">
                {selectedWp.workplaceName}
              </h2>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-paper-bg border border-line">
                <dt className="text-xs text-ink-muted mb-1">รายละเอียดงาน</dt>
                <dd className="text-ink-primary">
                  {selectedWp.description || "—"}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-paper-bg border border-line">
                <dt className="text-xs text-ink-muted mb-1">เบอร์ติดต่อ</dt>
                <dd className="font-mono tabular-nums font-medium text-ink-primary">
                  {selectedWp.workTel || "—"}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-paper-bg border border-line">
                <dt className="text-xs text-ink-muted mb-1">ที่อยู่</dt>
                <dd className="text-ink-primary">
                  {selectedWp.workplaceAddress || "—"}
                </dd>
              </div>
            </dl>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href={hasComment ? "/student/review/edit" : "/student/review"}
                className="flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white font-medium text-sm transition-colors"
              >
                {hasComment
                  ? "แก้ไขความคิดเห็นของคุณ"
                  : "เพิ่มความคิดเห็นและให้คะแนนรีวิว"}
              </Link>
              <Link
                href="/"
                className="py-2.5 px-4 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
              >
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-paper-surface rounded-2xl border border-line p-10 text-center">
          <h1 className="text-lg font-semibold text-ink-primary mb-2">
            ยังไม่ได้เลือกสถานประกอบการ
          </h1>
          <p className="text-sm text-ink-secondary mb-6 max-w-md mx-auto">
            กรุณาเลือกสถานประกอบการที่มีอยู่ในระบบ หรือเพิ่มข้อมูลสถานประกอบการใหม่ที่คุณเข้าฝึกงาน
          </p>
          <div className="max-w-xs mx-auto space-y-2.5">
            <Link
              href="/student/workplace/new"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white font-medium text-sm transition-colors"
            >
              เพิ่มสถานประกอบการใหม่
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary font-medium text-sm transition-colors"
            >
              เลือกสถานประกอบการที่มีในระบบ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
