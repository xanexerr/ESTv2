import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getWorkTypeMeta, normalizeImagePath } from "@/lib/constants";
import { WorkTypeIcon, WorkTypeBadge, StarRating } from "@/components/WorkTypeIcon";
import {
  SelectWorkplaceButton,
  ImageGalleryLightbox,
} from "@/components/WorkplaceDetailClient";
import {
  ArrowLeft,
  Briefcase,
  Phone,
  MapPin,
  ExternalLink,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Images,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkplaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workplaceId = Number(id);

  const [session, workplace] = await Promise.all([
    getSessionUser(),
    prisma.workplace.findUnique({
      where: { workplaceId },
      include: {
        _count: {
          select: { selectedByUsers: true },
        },
        comments: {
          where: { show: true },
          orderBy: { commentTime: "desc" },
          include: {
            user: {
              select: {
                userFname: true,
                userLname: true,
                role: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!workplace) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          ไม่พบข้อมูลสถานประกอบการ
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          สถานประกอบการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ssp-primary text-white text-sm font-semibold"
        >
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  let currentUserWorkplaceId: number | null = null;
  if (session) {
    const u = await prisma.user.findUnique({
      where: { userId: session.userId },
      select: { workplaceId: true },
    });
    currentUserWorkplaceId = u?.workplaceId ?? null;
  }

  const meta = getWorkTypeMeta(workplace.workType);
  const mapUrl = workplace.map
    ? workplace.map.startsWith("http")
      ? workplace.map
      : `https://${workplace.map}`
    : "";

  const galleryImages = workplace.comments
    .map((c) => normalizeImagePath(c.img))
    .filter((img): img is string => !!img);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-ssp-primary hover:text-ssp-primary text-xs font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้ารายชื่อสถานประกอบการ
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-start gap-4 pb-5 border-b border-slate-100">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: meta.bg, color: meta.color }}
              >
                <WorkTypeIcon type={workplace.workType} className="w-8 h-8" />
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Link
                    href={`/?work_type_filter=${encodeURIComponent(
                      workplace.workType
                    )}`}
                  >
                    <WorkTypeBadge type={workplace.workType} />
                  </Link>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <GraduationCap className="w-3.5 h-3.5 text-ssp-primary" />
                    นักศึกษาเลือกแล้ว {workplace._count.selectedByUsers} คน
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {workplace.workplaceName}
                </h1>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-ssp-primary" />
                  ลักษณะงาน (Job Description)
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {workplace.description || "ไม่ได้ระบุรายละเอียด"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-ssp-primary" />
                  เบอร์โทรติดต่อ
                </div>
                <div className="text-base font-semibold text-slate-800">
                  {workplace.workTel || "-"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-ssp-primary" />
                  พิกัดแผนที่
                </div>
                <div>
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ssp-primary hover:bg-ssp-dark text-white text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> ดูแผนที่สถานประกอบการ
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">
                      ไม่ได้ระบุลิงก์แผนที่
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-ssp-primary" />
                  ที่อยู่สถานประกอบการ
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {workplace.workplaceAddress || "-"}
                </p>
              </div>
            </div>

            {/* Student Select Button */}
            {session?.role === "student" && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                {currentUserWorkplaceId === null ? (
                  <SelectWorkplaceButton
                    workplaceId={workplace.workplaceId}
                    workplaceName={workplace.workplaceName}
                  />
                ) : currentUserWorkplaceId === workplace.workplaceId ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      สถานประกอบการปัจจุบันของคุณ
                    </div>
                    <Link
                      href="/student/workplace"
                      className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      จัดการข้อมูล / รีวิวของคุณ
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-ssp-primary" />
                ความคิดเห็นและรีวิวจากรุ่นพี่ ({workplace.comments.length})
              </h2>
            </div>

            {workplace.comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                ยังไม่มีความคิดเห็นต่อสถานประกอบการนี้
              </div>
            ) : (
              <div className="space-y-3">
                {workplace.comments.map((comment, idx) => {
                  const fullName = `${comment.user?.userFname || ""} ${
                    comment.user?.userLname || ""
                  }`.trim();
                  const displayName =
                    fullName || `นักศึกษาฝึกงาน #${idx + 1}`;
                  const initial = displayName.charAt(0).toUpperCase();
                  const cImg = normalizeImagePath(comment.img);

                  return (
                    <div
                      key={comment.commentId}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-ssp-primary text-white font-bold text-xs flex items-center justify-center">
                            {initial}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-slate-800">
                              {displayName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              ความคิดเห็นที่ {idx + 1} &bull;{" "}
                              {new Date(comment.commentTime).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                        <StarRating rating={comment.rating} />
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {comment.commentText}
                      </p>

                      {cImg && (
                        <div className="mt-3">
                          <img
                            src={cImg}
                            alt="Review photo"
                            className="w-28 h-28 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Rating Summary & Gallery */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              คะแนนรีวิวเฉลี่ย
            </h2>
            {workplace.rating > 0 ? (
              <>
                <div className="text-5xl font-extrabold text-ssp-primary mb-2">
                  {workplace.rating.toFixed(1)}
                  <span className="text-xl text-slate-400 font-normal">/5</span>
                </div>
                <div className="flex justify-center mb-2">
                  <StarRating rating={workplace.rating} size="lg" />
                </div>
                <div className="text-xs text-slate-500">
                  จากทั้งหมด {workplace.comments.length} ความคิดเห็น
                </div>
              </>
            ) : (
              <div className="py-4 text-slate-400">
                <div className="font-semibold text-slate-700">ยังไม่มีคะแนน</div>
                <div className="text-xs mt-1">
                  ยังไม่มีความคิดเห็นต่อสถานประกอบการ
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Images className="w-4 h-4 text-ssp-primary" />
              ภาพจากรุ่นก่อน
            </h2>
            <ImageGalleryLightbox images={galleryImages} />
          </div>
        </div>
      </div>
    </div>
  );
}
