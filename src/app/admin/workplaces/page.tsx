import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WORK_TYPES } from "@/lib/constants";
import { WorkTypeBadge } from "@/components/WorkTypeIcon";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminWorkplacesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search_query?: string;
    work_type_filter?: string;
  }>;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const sp = await searchParams;
  const searchQuery = (sp.search_query || "").trim();
  const workTypeFilter = (sp.work_type_filter || "").trim();

  const where: any = {};
  if (workTypeFilter) {
    where.workType = workTypeFilter;
  }
  if (searchQuery) {
    where.workplaceName = { contains: searchQuery, mode: "insensitive" };
  }

  const [totalWorkplaces, visibleWorkplaces, workplaces] = await Promise.all([
    prisma.workplace.count(),
    prisma.workplace.count({ where: { show: true } }),
    prisma.workplace.findMany({
      where,
      orderBy: { workplaceId: "desc" },
    }),
  ]);

  const hiddenWorkplaces = totalWorkplaces - visibleWorkplaces;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            จัดการสถานประกอบการ
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            เพิ่ม แก้ไข และกำหนดสถานะการแสดงผลสถานประกอบการในระบบ
          </p>
        </div>

        <Link
          href="/admin/workplaces/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
        >
          <Plus strokeWidth={1.5} className="w-4 h-4" />
          เพิ่มสถานประกอบการ
        </Link>
      </div>

      {/* Quiet Stat Strip (Numbers only, no icon filler) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-paper-surface border border-line rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-line">
        <div className="p-5">
          <div className="text-xs text-ink-muted">สถานประกอบการทั้งหมด</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-primary mt-1">
            {totalWorkplaces}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">กำลังแสดงผล</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-brand mt-1">
            {visibleWorkplaces}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">ซ่อนอยู่</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-secondary mt-1">
            {hiddenWorkplaces}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        method="GET"
        action="/admin/workplaces"
        className="bg-paper-surface rounded-xl border border-line p-3 grid grid-cols-1 md:grid-cols-12 gap-2"
      >
        <div className="md:col-span-3">
          <select
            name="work_type_filter"
            defaultValue={workTypeFilter}
            className="w-full text-sm bg-paper-bg border border-line-strong rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
          >
            <option value="">ประเภทงานทั้งหมด</option>
            {WORK_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-7">
          <input
            type="text"
            name="search_query"
            defaultValue={searchQuery}
            placeholder="ค้นหาชื่อสถานประกอบการ"
            className="w-full text-sm bg-paper-bg border border-line-strong rounded-lg px-3.5 py-2 focus:outline-none focus:border-brand"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
          >
            ค้นหา
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-paper-surface rounded-xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-paper-muted/70 text-ink-secondary text-xs font-medium border-b border-line">
              <tr>
                <th className="py-3 px-4 font-mono w-20">รหัส</th>
                <th className="py-3 px-4">ชื่อสถานประกอบการ</th>
                <th className="py-3 px-4">ประเภทงาน</th>
                <th className="py-3 px-4">รายละเอียด</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {workplaces.map((row) => (
                <tr key={row.workplaceId} className="hover:bg-paper-bg transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-ink-muted tabular-nums">
                    #{String(row.workplaceId).padStart(3, "0")}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-ink-primary">
                    {row.workplaceName}
                  </td>
                  <td className="py-3.5 px-4">
                    <WorkTypeBadge type={row.workType} />
                  </td>
                  <td className="py-3.5 px-4 text-ink-secondary text-xs max-w-md truncate">
                    {row.description}
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
                  <td className="py-3.5 px-4 text-right space-x-3 text-xs font-medium">
                    <Link
                      href={`/workplaces/${row.workplaceId}`}
                      className="text-ink-secondary hover:text-ink-primary"
                    >
                      ดูข้อมูล
                    </Link>
                    <Link
                      href={`/admin/workplaces/${row.workplaceId}`}
                      className="text-brand hover:text-brand-hover"
                    >
                      แก้ไข
                    </Link>
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
