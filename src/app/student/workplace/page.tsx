import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkTypeMeta } from "@/lib/constants";
import { WorkTypeIcon, WorkTypeBadge } from "@/components/WorkTypeIcon";
import { WorkplaceFormClient } from "@/components/WorkplaceFormClient";
import {
  Building2,
  PlusCircle,
  Search,
  Star,
  PenSquare,
  Eye,
} from "lucide-react";

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
        /* Case A: Student added this workplace themselves -> can edit workplace details + add/edit comment */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ssp-amber text-slate-900 mb-1">
                ผู้เพิ่มข้อมูลสถานประกอบการ
              </span>
              <h1 className="text-lg font-bold">
                เมนูแก้ไขข้อมูลสถานประกอบการของคุณ
              </h1>
            </div>
            <Link
              href={`/workplaces/${createdWp.workplaceId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100"
            >
              <Eye className="w-3.5 h-3.5" /> ดูหน้าแสดงผล
            </Link>
          </div>

          <WorkplaceFormClient
            mode="edit"
            initialData={createdWp}
            cancelHref="/"
            extraFooter={
              <Link
                href={hasComment ? "/student/review/edit" : "/student/review"}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-amber hover:bg-ssp-amberDark text-slate-900 font-semibold text-sm transition"
              >
                {hasComment ? (
                  <>
                    <PenSquare className="w-4 h-4" /> แก้ไขความคิดเห็นของคุณ
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" /> เพิ่มความคิดเห็นและให้คะแนนรีวิว
                  </>
                )}
              </Link>
            }
          />
        </div>
      ) : selectedWp ? (
        /* Case B: Student selected an existing workplace -> view summary + add/edit comment */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-slate-900 mb-1">
                สถานประกอบการที่เลือกไว้
              </span>
              <h1 className="text-lg font-bold">สถานประกอบการของคุณ</h1>
            </div>
            <Link
              href={`/workplaces/${selectedWp.workplaceId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100"
            >
              <Eye className="w-3.5 h-3.5" /> ดูหน้ารายละเอียด
            </Link>
          </div>

          <div className="p-6 space-y-5">
            {(() => {
              const meta = getWorkTypeMeta(selectedWp.workType);
              return (
                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <WorkTypeIcon
                      type={selectedWp.workType}
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <WorkTypeBadge type={selectedWp.workType} />
                    <h2 className="text-xl font-bold text-slate-900 mt-1.5">
                      {selectedWp.workplaceName}
                    </h2>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  รายละเอียดงาน
                </div>
                <div className="text-slate-800">
                  {selectedWp.description || "-"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  เบอร์ติดต่อ
                </div>
                <div className="font-semibold text-slate-800">
                  {selectedWp.workTel || "-"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  ที่อยู่
                </div>
                <div className="text-slate-800">
                  {selectedWp.workplaceAddress || "-"}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href={hasComment ? "/student/review/edit" : "/student/review"}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark text-white font-semibold text-sm transition"
              >
                {hasComment ? (
                  <>
                    <PenSquare className="w-4 h-4" /> แก้ไขความคิดเห็นของคุณ
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" /> เพิ่มความคิดเห็นและให้คะแนนรีวิว
                  </>
                )}
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
              >
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Case C: Not selected yet */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-ssp-light text-ssp-primary flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            ยังไม่ได้เลือกสถานประกอบการ
          </h1>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            กรุณาเลือกสถานประกอบการที่มีอยู่ในระบบ หรือเพิ่มข้อมูลสถานประกอบการใหม่ที่คุณไปฝึกงาน
          </p>
          <div className="max-w-xs mx-auto space-y-2.5">
            <Link
              href="/student/workplace/new"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-amber hover:bg-ssp-amberDark text-slate-900 font-semibold text-sm transition"
            >
              <PlusCircle className="w-4 h-4" /> เพิ่มสถานประกอบการใหม่
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark text-white font-semibold text-sm transition"
            >
              <Search className="w-4 h-4" /> เลือกสถานประกอบการที่มีในระบบ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
