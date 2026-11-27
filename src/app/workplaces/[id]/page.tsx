import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUserContext,
  buildUniversityWorkplaceWhere,
} from "@/lib/university-scope";
import { normalizeImagePath, getWorkModeLabel } from "@/lib/constants";
import { WorkTypeBadge, StarRating } from "@/components/WorkTypeIcon";
import {
  SelectWorkplaceButton,
  ImageGalleryLightbox,
} from "@/components/WorkplaceDetailClient";
import { ArrowLeft, ExternalLink, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkplaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workplaceId = Number(id);

  const currentUser = await getCurrentUserContext();
  if (!currentUser) {
    return null;
  }

  const scopeWhere = buildUniversityWorkplaceWhere(
    currentUser.universityId,
    currentUser.role
  );

  const workplace = await prisma.workplace.findFirst({
    where: {
      AND: [{ workplaceId }, scopeWhere],
    },
    include: {
      _count: {
        select: {
          selectedByUsers:
            currentUser.role !== "admin" && currentUser.universityId
              ? { where: { universityId: currentUser.universityId } }
              : true,
        },
      },
      comments: {
        where: {
          show: true,
          ...(currentUser.role !== "admin" && currentUser.universityId
            ? { user: { universityId: currentUser.universityId } }
            : {}),
        },
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
  });

  if (!workplace) {
    return (
      <div className="bg-paper-surface rounded-xl border border-line p-12 text-center">
        <h1 className="text-lg font-semibold text-ink-primary mb-2">
          ไม่พบข้อมูลสถานประกอบการในมหาวิทยาลัยของคุณ
        </h1>
        <p className="text-sm text-ink-secondary mb-4">
          สถานประกอบการนี้อาจถูกลบ หรือยังไม่มีนักศึกษาจากมหาวิทยาลัยของคุณเข้าฝึกงานและเพิ่มข้อมูลไว้
        </p>
        <Link
          href="/career-reviews"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-brand text-white dark:text-zinc-950 text-sm font-medium"
        >
          กลับหน้า Career Reviews
        </Link>
      </div>
    );
  }

  const currentUserWorkplaceId = currentUser.workplaceId ?? null;
  const session = currentUser;

  const mapUrl = workplace.map
    ? workplace.map.startsWith("http")
      ? workplace.map
      : `https://${workplace.map}`
    : "";

  const galleryImages = workplace.comments
    .map((c) => normalizeImagePath(c.img))
    .filter((img): img is string => !!img);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/career-reviews"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
          กลับหน้า Career Reviews
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-paper-surface rounded-2xl border border-line p-6 space-y-6">
            {/* Header */}
            <div className="space-y-3 pb-5 border-b border-line">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-ink-muted tabular-nums">
                  #{String(workplace.workplaceId).padStart(3, "0")}
                </span>
                <Link
                  href={`/career-reviews?work_type_filter=${encodeURIComponent(
                    workplace.workType
                  )}`}
                >
                  <WorkTypeBadge type={workplace.workType} />
                </Link>
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-paper-muted text-ink-secondary border border-line">
                  {getWorkModeLabel(workplace.workMode)}
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">
                {workplace.workplaceName}
              </h1>
            </div>

            {/* Structured Specs */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2 p-4 rounded-xl bg-paper-bg border border-line">
                <dt className="text-xs font-medium text-ink-muted mb-1">
                  ลักษณะงาน
                </dt>
                <dd className="text-ink-primary leading-relaxed whitespace-pre-line">
                  {workplace.description || "ไม่ได้ระบุรายละเอียด"}
                </dd>
              </div>

              <div className="p-4 rounded-xl bg-paper-bg border border-line">
                <dt className="text-xs font-medium text-ink-muted mb-1">
                  เบอร์โทรติดต่อ
                </dt>
                <dd className="font-mono tabular-nums font-medium text-ink-primary">
                  {workplace.workTel || "—"}
                </dd>
              </div>

              <div className="p-4 rounded-xl bg-paper-bg border border-line flex flex-col justify-between">
                <dt className="text-xs font-medium text-ink-muted mb-1">
                  พิกัดแผนที่
                </dt>
                <dd>
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover transition-colors"
                    >
                      เปิดแผนที่ Google Maps
                      <ExternalLink strokeWidth={1.5} className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-ink-muted">ไม่ได้ระบุลิงก์แผนที่</span>
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-paper-bg border border-line">
                <dt className="text-xs font-medium text-ink-muted mb-1">
                  ที่อยู่สถานประกอบการ
                </dt>
                <dd className="text-ink-primary whitespace-pre-line">
                  {workplace.workplaceAddress || "—"}
                </dd>
              </div>
            </dl>

            {/* Student Selection CTA */}
            {session?.role === "student" && (
              <div className="pt-4 border-t border-line">
                {currentUserWorkplaceId === null ? (
                  <SelectWorkplaceButton
                    workplaceId={workplace.workplaceId}
                    workplaceName={workplace.workplaceName}
                  />
                ) : currentUserWorkplaceId === workplace.workplaceId ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-700/20 text-emerald-900">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Check strokeWidth={1.5} className="w-4 h-4 text-emerald-700" />
                      สถานประกอบการปัจจุบันของคุณ
                    </div>
                    <Link
                      href="/student/workplace"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
                    >
                      จัดการข้อมูลและรีวิว
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-paper-surface rounded-2xl border border-line p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="text-base font-semibold text-ink-primary">
                ความคิดเห็นและรีวิวจากรุ่นพี่
              </h2>
              <span className="text-xs font-mono tabular-nums text-ink-muted">
                {workplace.comments.length} รายการ
              </span>
            </div>

            {workplace.comments.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-muted">
                ยังไม่มีความคิดเห็นต่อสถานประกอบการนี้
              </div>
            ) : (
              <div className="divide-y divide-line">
                {workplace.comments.map((comment, idx) => {
                  const fullName = `${comment.user?.userFname || ""} ${
                    comment.user?.userLname || ""
                  }`.trim();
                  const displayName =
                    fullName || `นักศึกษาฝึกงาน #${idx + 1}`;
                  const cImg = normalizeImagePath(comment.img);

                  return (
                    <div
                      key={comment.commentId}
                      className="py-4 first:pt-0 last:pb-0 space-y-2"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="text-sm font-medium text-ink-primary">
                            {displayName}
                          </div>
                          <div className="text-xs font-mono tabular-nums text-ink-muted">
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
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={comment.rating} />
                          <span className="text-xs font-mono tabular-nums text-ink-secondary">
                            {comment.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
                        {comment.commentText}
                      </p>

                      {cImg && (
                        <div className="pt-1">
                          <img
                            src={cImg}
                            alt="ภาพประกอบรีวิว"
                            className="w-28 h-28 object-cover rounded-lg border border-line"
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

        {/* Right Column: Rating Summary & Photo Gallery */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-paper-surface rounded-2xl border border-line p-6 space-y-3">
            <div className="pb-3 border-b border-line text-xs font-mono tabular-nums text-ink-secondary">
              นักศึกษาเลือกแล้ว {workplace._count.selectedByUsers} คน
            </div>
            <div>
              <h2 className="text-xs font-medium text-ink-muted mb-2">
                คะแนนรีวิวเฉลี่ย
              </h2>
            {workplace.rating > 0 ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-semibold tabular-nums text-brand">
                    {workplace.rating.toFixed(1)}
                  </span>
                  <span className="text-sm font-mono text-ink-muted">/ 5.0</span>
                </div>
                <StarRating rating={workplace.rating} size="md" />
                <div className="text-xs text-ink-secondary pt-1">
                  จากทั้งหมด{" "}
                  <span className="font-mono tabular-nums">
                    {workplace.comments.length}
                  </span>{" "}
                  ความคิดเห็น
                </div>
              </div>
            ) : (
              <div className="py-3 text-sm text-ink-muted">
                ยังไม่มีคะแนนรีวิว
              </div>
            )}
            </div>
          </div>

          <div className="bg-paper-surface rounded-2xl border border-line p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-primary">
                ภาพจากรุ่นก่อน
              </h2>
              <span className="text-xs font-mono tabular-nums text-ink-muted">
                {galleryImages.length} ภาพ
              </span>
            </div>
            <ImageGalleryLightbox images={galleryImages} />
          </div>
        </div>
      </div>
    </div>
  );
}
