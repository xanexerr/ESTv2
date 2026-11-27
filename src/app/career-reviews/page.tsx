import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WORK_TYPES, getWorkModeLabel } from "@/lib/constants";
import {
  getCurrentUserContext,
  buildUniversityWorkplaceWhere,
} from "@/lib/university-scope";
import {
  WorkTypeBadge,
  WorkTypeCategoryIcon,
  StarRating,
} from "@/components/WorkTypeIcon";
import { SortSelectClient } from "@/components/SortSelectClient";
import {
  Search,
  MapPin,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  GraduationCap,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CareerReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search_query?: string;
    work_type_filter?: string;
    sorting?: string;
    page?: string;
    view?: string;
  }>;
}) {
  const currentUser = await getCurrentUserContext();
  if (!currentUser) {
    redirect("/login");
  }

  const sp = await searchParams;
  const searchQuery = (sp.search_query || "").trim();
  const workTypeFilter = (sp.work_type_filter || "").trim();
  const sorting = sp.sorting || "newest";
  const viewMode = sp.view === "table" ? "table" : "card";
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const limit = 15;

  const scopeWhere = buildUniversityWorkplaceWhere(
    currentUser.universityId,
    currentUser.role
  );

  const andClauses: any[] = [scopeWhere];
  if (workTypeFilter) {
    andClauses.push({ workType: workTypeFilter });
  }
  if (searchQuery) {
    andClauses.push({
      OR: [
        { workplaceName: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { workplaceAddress: { contains: searchQuery, mode: "insensitive" } },
      ],
    });
  }

  const where = { AND: andClauses };

  let orderBy: any = { workplaceId: "desc" };
  if (sorting === "oldest") {
    orderBy = { workplaceId: "asc" };
  } else if (sorting === "highscore") {
    orderBy = [{ rating: "desc" }, { workplaceId: "desc" }];
  } else if (sorting === "popular") {
    orderBy = [{ selectedByUsers: { _count: "desc" } }, { rating: "desc" }];
  }

  const countFilter =
    currentUser.role !== "admin" && currentUser.universityId
      ? {
          selectedByUsers: {
            where: { universityId: currentUser.universityId },
          },
          comments: {
            where: {
              show: true,
              user: { universityId: currentUser.universityId },
            },
          },
        }
      : {
          selectedByUsers: true,
          comments: { where: { show: true } },
        };

  const [totalRows, workplaces] = await Promise.all([
    prisma.workplace.count({ where }),
    prisma.workplace.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: countFilter,
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalRows / limit));
  const isFiltered = searchQuery !== "" || workTypeFilter !== "";

  let topRated: typeof workplaces = [];
  if (!isFiltered && currentPage === 1) {
    topRated = await prisma.workplace.findMany({
      where: scopeWhere,
      orderBy: [{ rating: "desc" }, { workplaceId: "desc" }],
      take: 3,
      include: {
        _count: {
          select: countFilter,
        },
      },
    });
  }

  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      search_query: searchQuery || undefined,
      work_type_filter: workTypeFilter || undefined,
      sorting: sorting !== "newest" ? sorting : undefined,
      view: viewMode !== "card" ? viewMode : undefined,
      page: currentPage > 1 ? currentPage : undefined,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== "") {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return qs ? `/career-reviews?${qs}` : "/career-reviews";
  }

  const uniLabel =
    currentUser.role === "admin"
      ? "ทุกมหาวิทยาลัย (Admin)"
      : currentUser.university?.name || "ไม่ระบุมหาวิทยาลัย";

  return (
    <div className="space-y-5">
      {/* University Scope Context Strip */}
      <div className="bg-paper-surface border border-line rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <GraduationCap className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
          <strong className="text-ink-primary">{uniLabel}</strong>
        </div>
        {currentUser.role === "student" && (
          <Link
            href="/student/workplace/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line-strong text-xs font-medium text-ink-primary hover:bg-paper-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            เพิ่มข้อมูลที่ฝึกงาน
          </Link>
        )}
      </div>

      {/* Compact Header & Search + Top Rated Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 bg-paper-surface border border-line rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
              Career Reviews — รีวิวสายอาชีพและสถานประกอบการ
            </h1>
            <span className="text-xs font-mono tabular-nums text-ink-muted">
              {totalRows} แห่ง
            </span>
          </div>

          <form method="GET" action="/career-reviews" className="space-y-3">
            <input type="hidden" name="view" value={viewMode} />
            {workTypeFilter && (
              <input type="hidden" name="work_type_filter" value={workTypeFilter} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6 relative">
                <Search
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="w-4 h-4 text-ink-muted absolute left-3 top-3.5 sm:top-3"
                />
                <input
                  type="text"
                  name="search_query"
                  defaultValue={searchQuery}
                  aria-label="ค้นหาสถานประกอบการ"
                  placeholder="ค้นหาชื่อบริษัท หรือลักษณะงาน"
                  className="w-full min-h-[44px] sm:min-h-0 sm:h-10 pl-9 pr-3 text-sm bg-paper-bg border border-line-strong rounded-lg text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="sm:col-span-4">
                <SortSelectClient defaultValue={sorting} />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors duration-150"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={buildUrl({ work_type_filter: undefined, page: 1 })}
                className={`inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  workTypeFilter === ""
                    ? "bg-brand text-white dark:text-zinc-950 border-brand"
                    : "bg-paper-bg text-ink-secondary border-line hover:text-ink-primary"
                }`}
              >
                <WorkTypeCategoryIcon type="ทั้งหมด" className="w-4 h-4 flex-shrink-0" />
                ทั้งหมด
              </Link>
              {WORK_TYPES.map((t) => {
                const active = workTypeFilter === t.key;
                return (
                  <Link
                    key={t.key}
                    href={buildUrl({ work_type_filter: t.key, page: 1 })}
                    className={`inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? "bg-brand text-white dark:text-zinc-950 border-brand"
                        : "bg-paper-bg text-ink-secondary border-line hover:text-ink-primary"
                    }`}
                  >
                    <WorkTypeCategoryIcon type={t.key} className="w-4 h-4 flex-shrink-0" />
                    {t.label}
                  </Link>
                );
              })}

              {isFiltered && (
                <Link
                  href="/career-reviews"
                  className="inline-flex items-center gap-1 min-h-[40px] sm:min-h-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary ml-auto"
                >
                  <RotateCcw strokeWidth={1.5} className="w-3.5 h-3.5" />
                  ล้างตัวกรอง
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Compact Top 3 Rated Directory */}
        <div className="lg:col-span-4 bg-paper-surface border border-line rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-line">
            <h2 className="text-xs font-semibold text-ink-primary">
              คะแนนรีวิวสูงสุดในมหาวิทยาลัย
            </h2>
            <span className="text-xs font-mono text-ink-muted">Top 3</span>
          </div>
          {topRated.length === 0 && workplaces.length === 0 ? (
            <div className="py-6 text-center text-xs text-ink-muted">
              ยังไม่มีข้อมูลสถานประกอบการในมหาวิทยาลัยของคุณ
            </div>
          ) : (
            <div className="divide-y divide-line">
              {(topRated.length > 0 ? topRated : workplaces.slice(0, 3)).map(
                (item, idx) => (
                  <Link
                    key={`top-${item.workplaceId}`}
                    href={`/workplaces/${item.workplaceId}`}
                    className="flex items-center justify-between gap-2 py-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-ink-muted tabular-nums">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-medium text-ink-primary group-hover:text-brand truncate transition-colors">
                        {item.workplaceName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-brand flex-shrink-0">
                      {item.rating > 0 ? item.rating.toFixed(1) : "—"}
                    </span>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Toolbar: Results + View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-ink-primary">รายการทั้งหมด</h2>
          {workTypeFilter && <WorkTypeBadge type={workTypeFilter} />}
          {searchQuery && (
            <span className="text-xs text-ink-secondary">
              &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="inline-flex rounded-lg border border-line bg-paper-surface p-0.5">
          <Link
            href={buildUrl({ view: "card" })}
            className={`inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "card"
                ? "bg-paper-muted text-ink-primary font-semibold"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <LayoutGrid strokeWidth={1.5} className="w-3.5 h-3.5" />
            การ์ด
          </Link>
          <Link
            href={buildUrl({ view: "table" })}
            className={`inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "table"
                ? "bg-paper-muted text-ink-primary font-semibold"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <TableIcon strokeWidth={1.5} className="w-3.5 h-3.5" />
            ตาราง
          </Link>
        </div>
      </div>

      {/* Workplaces Grid / Table */}
      {workplaces.length === 0 ? (
        <div className="bg-paper-surface border border-line rounded-xl p-10 text-center space-y-3">
          <p className="text-sm font-medium text-ink-primary">
            {isFiltered
              ? "ไม่พบสถานประกอบการที่ตรงกับเงื่อนไข"
              : "ยังไม่มีนักศึกษาจากมหาวิทยาลัยของคุณเพิ่มข้อมูลหรือรีวิวสถานประกอบการ"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {isFiltered && (
              <Link
                href="/career-reviews"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line-strong text-ink-primary text-xs font-medium"
              >
                <RotateCcw strokeWidth={1.5} className="w-3.5 h-3.5" />
                ล้างตัวกรอง
              </Link>
            )}
            {currentUser.role === "student" && (
              <Link
                href="/student/workplace/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white dark:text-zinc-950 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มสถานประกอบการที่ฉันเคยฝึก
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workplaces.map((row) => (
            <article
              key={row.workplaceId}
              className="bg-paper-surface border border-line hover:border-line-strong rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors duration-150"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-ink-muted tabular-nums">
                    #{String(row.workplaceId).padStart(3, "0")}
                  </span>
                  <WorkTypeBadge type={row.workType} />
                </div>

                <h3 className="text-base font-semibold text-ink-primary leading-snug">
                  <Link
                    href={`/workplaces/${row.workplaceId}`}
                    className="hover:text-brand transition-colors"
                  >
                    {row.workplaceName}
                  </Link>
                </h3>

                <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                  {row.description || "ไม่มีรายละเอียด"}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${
                      row.workMode === "remote"
                        ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800"
                        : row.workMode === "hybrid"
                          ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800"
                          : "bg-paper-muted text-ink-secondary border-line"
                    }`}
                  >
                    {getWorkModeLabel(row.workMode)}
                  </span>
                  {row.workMode !== "remote" && row.province && (
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <MapPin
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className="w-3.5 h-3.5 flex-shrink-0"
                      />
                      จ.{row.province}
                    </span>
                  )}
                </div>

                {row.workplaceAddress && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className="truncate">{row.workplaceAddress}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-line text-xs">
                <div className="flex items-center gap-2.5 text-ink-muted font-mono tabular-nums">
                  {row.rating > 0 ? (
                    <span className="inline-flex items-center gap-1 text-ink-primary font-medium">
                      <StarRating rating={row.rating} />
                      {row.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                  <span>{row._count.comments} รีวิว</span>
                  <span>{row._count.selectedByUsers} คน</span>
                </div>

                <Link
                  href={`/workplaces/${row.workplaceId}`}
                  className="inline-flex items-center gap-1 min-h-[38px] sm:min-h-0 px-2.5 py-1.5 rounded-lg border border-line-strong bg-paper-bg hover:border-brand hover:text-brand font-medium text-ink-primary transition-colors flex-shrink-0"
                >
                  รายละเอียด
                  <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-paper-surface border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-paper-muted text-ink-secondary text-xs font-medium border-b border-line">
                <tr>
                  <th className="py-2.5 px-4 font-mono w-20">รหัส</th>
                  <th className="py-2.5 px-4">ชื่อสถานประกอบการ</th>
                  <th className="py-2.5 px-4">ประเภทงาน</th>
                  <th className="py-2.5 px-4">ลักษณะงาน</th>
                  <th className="py-2.5 px-4 text-right">คะแนน</th>
                  <th className="py-2.5 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {workplaces.map((row) => (
                  <tr
                    key={row.workplaceId}
                    className="hover:bg-paper-bg transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-ink-muted tabular-nums">
                      #{String(row.workplaceId).padStart(3, "0")}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink-primary">
                      {row.workplaceName}
                    </td>
                    <td className="py-3 px-4">
                      <WorkTypeBadge type={row.workType} />
                    </td>
                    <td className="py-3 px-4 text-ink-secondary text-xs max-w-md truncate">
                      {row.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                      {row.rating > 0 ? row.rating.toFixed(1) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/workplaces/${row.workplaceId}`}
                        className="text-brand hover:underline font-medium text-xs"
                      >
                        รายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 pt-1">
          {currentPage > 1 && (
            <Link
              href={buildUrl({ page: currentPage - 1 })}
              aria-label="หน้าก่อนหน้า"
              className="p-2 rounded-lg border border-line bg-paper-surface text-ink-secondary hover:text-ink-primary"
            >
              <ChevronLeft strokeWidth={1.5} className="w-4 h-4" />
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: p })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums border transition-colors ${
                p === currentPage
                  ? "bg-brand text-white dark:text-zinc-950 border-brand font-medium"
                  : "bg-paper-surface text-ink-secondary border-line hover:text-ink-primary"
              }`}
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildUrl({ page: currentPage + 1 })}
              aria-label="หน้าถัดไป"
              className="p-2 rounded-lg border border-line bg-paper-surface text-ink-secondary hover:text-ink-primary"
            >
              <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
