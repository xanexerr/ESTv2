import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WORK_TYPES, getWorkTypeMeta } from "@/lib/constants";
import { WorkTypeIcon, WorkTypeBadge, StarRating } from "@/components/WorkTypeIcon";
import {
  Search,
  Award,
  Flame,
  Building2,
  MapPin,
  MessageSquare,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({
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
  const sp = await searchParams;
  const searchQuery = (sp.search_query || "").trim();
  const workTypeFilter = (sp.work_type_filter || "").trim();
  const sorting = sp.sorting || "newest";
  const viewMode = sp.view === "table" ? "table" : "card";
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const limit = 15;

  // Build Prisma where filter
  const where: any = { show: true };
  if (workTypeFilter) {
    where.workType = workTypeFilter;
  }
  if (searchQuery) {
    where.OR = [
      { workplaceName: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { workplaceAddress: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // Determine ordering
  let orderBy: any = { workplaceId: "desc" };
  if (sorting === "oldest") {
    orderBy = { workplaceId: "asc" };
  } else if (sorting === "highscore") {
    orderBy = [{ rating: "desc" }, { workplaceId: "desc" }];
  } else if (sorting === "popular") {
    orderBy = [{ selectedByUsers: { _count: "desc" } }, { rating: "desc" }];
  }

  const [totalRows, workplaces] = await Promise.all([
    prisma.workplace.count({ where }),
    prisma.workplace.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            selectedByUsers: true,
            comments: { where: { show: true } },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalRows / limit));
  const isFiltered = searchQuery !== "" || workTypeFilter !== "";

  // Fetch Top 3 Most Recommended & Top 3 Most Popular when not filtered
  let topRated: typeof workplaces = [];
  let topPopular: typeof workplaces = [];
  if (!isFiltered && currentPage === 1) {
    [topRated, topPopular] = await Promise.all([
      prisma.workplace.findMany({
        where: { show: true },
        orderBy: [{ rating: "desc" }, { workplaceId: "desc" }],
        take: 3,
        include: {
          _count: {
            select: {
              selectedByUsers: true,
              comments: { where: { show: true } },
            },
          },
        },
      }),
      prisma.workplace.findMany({
        where: { show: true },
        orderBy: [
          { selectedByUsers: { _count: "desc" } },
          { rating: "desc" },
        ],
        take: 3,
        include: {
          _count: {
            select: {
              selectedByUsers: true,
              comments: { where: { show: true } },
            },
          },
        },
      }),
    ]);
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
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner & Search Bar */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ssp-dark via-ssp-primary to-teal-600 text-white p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ssp-amber/20 text-ssp-amber border border-ssp-amber/40 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> HTC Internship Discovery
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ค้นหาสถานประกอบการฝึกประสบการณ์วิชาชีพ
            </h1>
            <p className="text-sm text-white/80 mt-1">
              รวบรวมข้อมูลสถานที่ฝึกงาน รีวิวจากรุ่นพี่ และคะแนนประเมินสำหรับนักศึกษาแผนกเทคโนโลยีสารสนเทศ
            </p>
          </div>
          <div className="text-sm text-white/80">
            พบสถานประกอบการทั้งหมด{" "}
            <strong className="text-white text-lg font-bold">{totalRows}</strong> แห่ง
          </div>
        </div>

        {/* Search & Filter Form */}
        <form method="GET" action="/" className="bg-white rounded-xl p-2 shadow-xl text-slate-800">
          <input type="hidden" name="view" value={viewMode} />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <div className="md:col-span-5 flex items-center gap-2 px-3 py-1.5">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                name="search_query"
                defaultValue={searchQuery}
                placeholder="ค้นหาชื่อสถานประกอบการ, ลักษณะงาน, หรือพื้นที่..."
                className="w-full text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="md:col-span-3">
              <select
                name="work_type_filter"
                defaultValue={workTypeFilter}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-ssp-primary"
              >
                <option value="">ประเภทงาน : ทั้งหมด</option>
                {WORK_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    ประเภทงาน : {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                name="sorting"
                defaultValue={sorting}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-ssp-primary"
              >
                <option value="newest">เรียงจากที่เพิ่มล่าสุด</option>
                <option value="oldest">เรียงจากที่เพิ่มนานสุด</option>
                <option value="highscore">เรียงจากคะแนนรีวิว</option>
                <option value="popular">เรียงจากความนิยม</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-ssp-primary hover:bg-ssp-dark text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition shadow-sm"
              >
                <Search className="w-4 h-4" /> ค้นหา
              </button>
            </div>
          </div>
        </form>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Link
            href={buildUrl({ work_type_filter: undefined, page: 1 })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
              workTypeFilter === ""
                ? "bg-ssp-amber text-slate-900 border-ssp-amber font-semibold shadow-sm"
                : "bg-white/15 text-white border-white/25 hover:bg-white/25"
            }`}
          >
            ทั้งหมด
          </Link>
          {WORK_TYPES.map((t) => (
            <Link
              key={t.key}
              href={buildUrl({ work_type_filter: t.key, page: 1 })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                workTypeFilter === t.key
                  ? "bg-ssp-amber text-slate-900 border-ssp-amber font-semibold shadow-sm"
                  : "bg-white/15 text-white border-white/25 hover:bg-white/25"
              }`}
            >
              <WorkTypeIcon type={t.key} className="w-3.5 h-3.5" />
              {t.label}
            </Link>
          ))}

          {isFiltered && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/90 hover:bg-red-600 text-white ml-auto transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> ล้างตัวกรอง
            </Link>
          )}
        </div>
      </section>

      {/* Top 3 Highlights (SeniorStepPass Style: Most Recommended & Most Selected) */}
      {!isFiltered && currentPage === 1 && (topRated.length > 0 || topPopular.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Most Recommended */}
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-b from-white to-ssp-cream/40 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-ssp-primary to-teal-600 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-ssp-amber" /> แนะนำสูงสุด (Most Recommended)
              </span>
              <span className="text-xs font-semibold bg-white text-slate-800 px-2.5 py-0.5 rounded-full">
                Top 3 คะแนนรีวิว
              </span>
            </div>
            <div className="p-3 divide-y divide-slate-200/70">
              {topRated.map((item, idx) => (
                <Link
                  key={item.workplaceId}
                  href={`/workplaces/${item.workplaceId}`}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/80 transition group"
                >
                  <span
                    className={`w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0 ${
                      idx === 0
                        ? "bg-amber-500 shadow-sm"
                        : idx === 1
                        ? "bg-slate-500"
                        : "bg-amber-700"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-sm text-slate-800 truncate group-hover:text-ssp-primary">
                      {item.workplaceName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <WorkTypeBadge type={item.workType} />
                      <span className="text-xs text-slate-600 inline-flex items-center gap-1">
                        <StarRating rating={item.rating} />
                        <strong className="ml-0.5">{item.rating.toFixed(1)}</strong>
                        <span className="text-slate-400">
                          ({item._count.comments} รีวิว)
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-ssp-primary inline-flex items-center gap-1 flex-shrink-0">
                    ดูข้อมูล <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Most Selected */}
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-b from-white to-ssp-cream/40 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-ssp-primary to-teal-600 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-ssp-amber" /> ยอดนิยม (Most Selected)
              </span>
              <span className="text-xs font-semibold bg-white text-slate-800 px-2.5 py-0.5 rounded-full">
                Top 3 นักศึกษาเลือก
              </span>
            </div>
            <div className="p-3 divide-y divide-slate-200/70">
              {topPopular.map((item, idx) => (
                <Link
                  key={item.workplaceId}
                  href={`/workplaces/${item.workplaceId}`}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/80 transition group"
                >
                  <span
                    className={`w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0 ${
                      idx === 0
                        ? "bg-amber-500 shadow-sm"
                        : idx === 1
                        ? "bg-slate-500"
                        : "bg-amber-700"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-sm text-slate-800 truncate group-hover:text-ssp-primary">
                      {item.workplaceName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <WorkTypeBadge type={item.workType} />
                      <span className="text-xs text-slate-600 inline-flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-ssp-primary" />
                        <strong>{item._count.selectedByUsers}</strong> คนเลือก
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-ssp-primary inline-flex items-center gap-1 flex-shrink-0">
                    ดูข้อมูล <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* List Header & View Switcher */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-ssp-primary" />
          <h2 className="text-lg font-bold text-slate-800">รายชื่อสถานประกอบการ</h2>
          {workTypeFilter && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ssp-primary text-white">
              {workTypeFilter}
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              ค้นหา: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
          <Link
            href={buildUrl({ view: "card" })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              viewMode === "card"
                ? "bg-ssp-primary text-white"
                : "text-slate-600 hover:text-ssp-primary"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> การ์ด
          </Link>
          <Link
            href={buildUrl({ view: "table" })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              viewMode === "table"
                ? "bg-ssp-primary text-white"
                : "text-slate-600 hover:text-ssp-primary"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" /> ตาราง
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {workplaces.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-red-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-red-600">ไม่พบสถานประกอบการ!</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            ไม่พบข้อมูลที่ตรงกับคำค้นหาหรือตัวกรองที่คุณเลือก
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ssp-primary text-white text-sm font-semibold hover:bg-ssp-dark transition"
          >
            <RotateCcw className="w-4 h-4" /> แสดงสถานประกอบการทั้งหมด
          </Link>
        </div>
      ) : viewMode === "card" ? (
        /* Modern Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workplaces.map((row) => {
            const meta = getWorkTypeMeta(row.workType);
            return (
              <div
                key={row.workplaceId}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-ssp-primary/40 transition flex flex-col justify-between"
              >
                <div className="flex gap-3.5">
                  <div
                    className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 52,
                      height: 52,
                      background: meta.bg,
                      color: meta.color,
                    }}
                  >
                    <WorkTypeIcon type={row.workType} className="w-6 h-6" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/workplaces/${row.workplaceId}`}
                        className="font-bold text-base text-slate-800 hover:text-ssp-primary truncate"
                      >
                        {row.workplaceName}
                      </Link>
                      <WorkTypeBadge type={row.workType} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                      {row.description || "ไม่มีรายละเอียดลักษณะงาน"}
                    </p>
                    {row.workplaceAddress && (
                      <div className="text-xs text-slate-400 mt-2 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-ssp-primary flex-shrink-0" />
                        <span className="truncate">{row.workplaceAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {row.rating > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <StarRating rating={row.rating} />
                        <strong className="text-slate-700">
                          {row.rating.toFixed(1)}
                        </strong>
                      </span>
                    ) : (
                      <span>ยังไม่มีคะแนน</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {row._count.comments} รีวิว
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {row._count.selectedByUsers} คน
                    </span>
                  </div>

                  <Link
                    href={`/workplaces/${row.workplaceId}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-ssp-primary hover:bg-ssp-dark text-white text-xs font-semibold transition"
                  >
                    รายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">ชื่อสถานประกอบการ</th>
                  <th className="py-3.5 px-4">ประเภทงาน</th>
                  <th className="py-3.5 px-4">ลักษณะงาน</th>
                  <th className="py-3.5 px-4 text-center">คะแนนรีวิว</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workplaces.map((row) => (
                  <tr key={row.workplaceId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {row.workplaceName}
                    </td>
                    <td className="py-3.5 px-4">
                      <WorkTypeBadge type={row.workType} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md">
                      {row.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.rating > 0 ? (
                        <div className="inline-flex flex-col items-center">
                          <StarRating rating={row.rating} />
                          <span className="text-xs text-slate-500 mt-0.5">
                            {row.rating.toFixed(1)} / 5.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">ยังไม่มีคะแนน</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/workplaces/${row.workplaceId}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-ssp-primary hover:bg-ssp-dark text-white text-xs font-semibold transition"
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
        <div className="flex justify-center items-center gap-1 pt-2">
          {currentPage > 1 && (
            <Link
              href={buildUrl({ page: currentPage - 1 })}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-ssp-primary hover:text-ssp-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: p })}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition ${
                p === currentPage
                  ? "bg-ssp-primary text-white border-ssp-primary"
                  : "bg-white text-slate-700 border-slate-200 hover:border-ssp-primary"
              }`}
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildUrl({ page: currentPage + 1 })}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-ssp-primary hover:text-ssp-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
