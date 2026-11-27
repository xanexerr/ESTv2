import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkModeLabel, WORK_MODES } from "@/lib/constants";
import {
  getCurrentUserContext,
  buildUniversityWorkplaceWhere,
} from "@/lib/university-scope";
import { WorkTypeBadge, StarRating } from "@/components/WorkTypeIcon";
import {
  Briefcase,
  MapPin,
  Plus,
  Users,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{
    work_mode?: string;
    province?: string;
    q?: string;
  }>;
}) {
  const currentUser = await getCurrentUserContext();
  if (!currentUser) {
    redirect("/login");
  }

  const sp = await searchParams;
  const workModeFilter = (sp.work_mode || "").trim();
  const provinceFilter = (sp.province || "").trim();
  const query = (sp.q || "").trim();

  const scopeWhere = buildUniversityWorkplaceWhere(
    currentUser.universityId,
    currentUser.role
  );

  const andClauses: any[] = [scopeWhere];
  if (
    workModeFilter === "onsite" ||
    workModeFilter === "hybrid" ||
    workModeFilter === "remote"
  ) {
    andClauses.push({ workMode: workModeFilter });
  }
  if (provinceFilter) {
    andClauses.push({ province: provinceFilter });
  }
  if (query) {
    andClauses.push({
      OR: [
        { workplaceName: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { workType: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  const uniFilter =
    currentUser.role !== "admin" && currentUser.universityId
      ? { student: { universityId: currentUser.universityId } }
      : {};

  const workplaces = await prisma.workplace.findMany({
    where: { AND: andClauses },
    orderBy: [{ rating: "desc" }, { workplaceId: "desc" }],
    include: {
      internshipRounds: {
        where: uniFilter,
        orderBy: { startDate: "desc" },
        select: {
          roundId: true,
          position: true,
          academicYear: true,
          status: true,
          student: {
            select: { userFname: true, userLname: true },
          },
        },
      },
      _count: {
        select: {
          selectedByUsers:
            currentUser.role !== "admin" && currentUser.universityId
              ? { where: { universityId: currentUser.universityId } }
              : true,
          comments:
            currentUser.role !== "admin" && currentUser.universityId
              ? {
                  where: {
                    show: true,
                    user: { universityId: currentUser.universityId },
                  },
                }
              : { where: { show: true } },
        },
      },
    },
  });

  const availableProvinces = Array.from(
    new Set(
      workplaces
        .map((w) => w.province)
        .filter((p): p is string => Boolean(p))
    )
  ).sort((a, b) => a.localeCompare(b, "th"));

  const uniName =
    currentUser.role === "admin"
      ? "ทุกมหาวิทยาลัย (Admin)"
      : currentUser.university?.name || "ไม่ระบุมหาวิทยาลัย";

  const isFiltered = Boolean(workModeFilter || provinceFilter || query);

  return (
    <div className="space-y-5">
      {/* Header & Add Internship Workplace Action */}
      <div className="bg-paper-surface border border-line rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
            Internships แหล่งรวบรวมสถานประกอบการ
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === "student" && (
            <>
              <Link
                href="/student/workplace/new"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                เพิ่มสถานที่ฝึกงานใหม่
              </Link>
              <Link
                href="/student/internships"
                className="min-h-[44px] px-4 py-2 rounded-xl border border-line-strong text-ink-primary hover:bg-paper-muted text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                จัดการรอบฝึกงานของฉัน
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <form
        method="GET"
        action="/internships"
        className="bg-paper-surface border border-line rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
      >
        <div className="sm:col-span-5">
          <label className="block text-xs font-medium text-ink-muted mb-1">
            ค้นหาบริษัท / ตำแหน่งงาน
          </label>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="ชื่อบริษัท, ประเภทงาน หรือทักษะ..."
            className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-ink-muted mb-1">
            รูปแบบการทำงาน
          </label>
          <select
            name="work_mode"
            defaultValue={workModeFilter}
            className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand"
          >
            <option value="">ทุกรูปแบบ</option>
            {WORK_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-ink-muted mb-1">
            จังหวัด
          </label>
          <select
            name="province"
            defaultValue={provinceFilter}
            className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand"
          >
            <option value="">ทุกจังหวัด</option>
            {availableProvinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button
            type="submit"
            className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
          >
            ค้นหา
          </button>
          {isFiltered && (
            <Link
              href="/internships"
              title="ล้างตัวกรอง"
              className="min-h-[44px] sm:min-h-0 sm:h-10 px-3 inline-flex items-center justify-center rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary"
            >
              <RotateCcw className="w-4 h-4" />
            </Link>
          )}
        </div>
      </form>

      {/* Internship List */}
      {workplaces.length === 0 ? (
        <div className="bg-paper-surface border border-line rounded-2xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-ink-primary">
            ยังไม่มีข้อมูลสถานที่ฝึกงานจากนักศึกษาของ {uniName}
          </p>
          <p className="text-xs text-ink-secondary max-w-lg mx-auto">
            รายการจะปรากฏเมื่อมีนักศึกษาในมหาวิทยาลัยของคุณเพิ่มข้อมูลหรือบันทึกประวัติการฝึกงานที่สถานประกอบการนั้นเข้าสู่ระบบ
          </p>
          {currentUser.role === "student" && (
            <Link
              href="/student/workplace/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white dark:text-zinc-950 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              เป็นคนแรกที่เพิ่มข้อมูลสถานที่ฝึกงาน
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workplaces.map((wp) => {
            const positions = Array.from(
              new Set(
                wp.internshipRounds
                  .map((r) => r.position)
                  .filter((p): p is string => Boolean(p))
              )
            );
            const internCount = Math.max(
              wp.internshipRounds.length,
              wp._count.selectedByUsers
            );

            return (
              <article
                key={wp.workplaceId}
                className="bg-paper-surface border border-line hover:border-line-strong rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <WorkTypeBadge type={wp.workType} />
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-paper-muted text-ink-secondary border border-line">
                        {getWorkModeLabel(wp.workMode)}
                      </span>
                      {wp.workMode !== "remote" && wp.province && (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                          จ.{wp.province}
                        </span>
                      )}
                    </div>
                    {wp.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-ink-primary">
                        <StarRating rating={wp.rating} />
                        {wp.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-ink-primary">
                      <Link
                        href={`/workplaces/${wp.workplaceId}`}
                        className="hover:underline"
                      >
                        {wp.workplaceName}
                      </Link>
                    </h2>
                    <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
                      {wp.description || "ไม่ได้ระบุรายละเอียดงาน"}
                    </p>
                  </div>

                  {positions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-ink-muted">ตำแหน่งที่รุ่นพี่เคยฝึก:</span>
                      {positions.map((pos) => (
                        <span
                          key={pos}
                          className="px-2 py-0.5 rounded-md bg-brand-subtle text-ink-primary text-xs font-medium"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-ink-secondary font-medium">
                    <Users className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                    นักศึกษาจากสถาบันนี้เคยฝึก/เลือก {internCount} ครั้ง ·{" "}
                    {wp._count.comments} รีวิว
                  </span>
                  <Link
                    href={`/workplaces/${wp.workplaceId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line-strong text-ink-primary hover:bg-paper-muted font-medium transition-colors"
                  >
                    ดูรายละเอียด &amp; เลือกฝึกงาน
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
