import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WORK_TYPES } from "@/lib/constants";
import { WorkTypeBadge } from "@/components/WorkTypeIcon";
import {
  Building2,
  PlusCircle,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

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
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-ssp-primary" />
            เมนูแก้ไขข้อมูลสถานประกอบการ (Workplace Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการรายชื่อสถานประกอบการ สถานะการแสดงผล และรายละเอียดทั้งหมดในระบบ
          </p>
        </div>

        <Link
          href="/admin/workplaces/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ssp-primary hover:bg-ssp-dark text-white text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> เพิ่มสถานประกอบการ
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-ssp-light text-ssp-primary flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">สถานประกอบการทั้งหมด</div>
            <div className="text-2xl font-bold text-slate-800">
              {totalWorkplaces}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">กำลังแสดงผลบนเว็บไซต์</div>
            <div className="text-2xl font-bold text-slate-800">
              {visibleWorkplaces}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500">ซ่อน / ไม่แสดงผล</div>
            <div className="text-2xl font-bold text-slate-800">
              {hiddenWorkplaces}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <form
          method="GET"
          action="/admin/workplaces"
          className="grid grid-cols-1 md:grid-cols-12 gap-2"
        >
          <div className="md:col-span-3">
            <select
              name="work_type_filter"
              defaultValue={workTypeFilter}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-ssp-primary"
            >
              <option value="">ประเภทงานทั้งหมด</option>
              {WORK_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  ประเภทงาน{t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-7">
            <input
              type="text"
              name="search_query"
              defaultValue={searchQuery}
              placeholder="ค้นหาสถานประกอบการ...."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 focus:outline-none focus:border-ssp-primary"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-ssp-primary hover:bg-ssp-dark text-white text-sm font-semibold transition"
            >
              <Search className="w-4 h-4" /> ค้นหา
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-20">รหัส</th>
                <th className="py-3.5 px-4">ชื่อสถานประกอบการ</th>
                <th className="py-3.5 px-4 text-center">ประเภทงาน</th>
                <th className="py-3.5 px-4">รายละเอียด</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {workplaces.map((row) => (
                <tr key={row.workplaceId} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                    #{row.workplaceId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.workplaceName}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <WorkTypeBadge type={row.workType} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-md">
                    {row.description}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.show ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        แสดง
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        ไม่แสดง
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/workplaces/${row.workplaceId}`}
                        className="px-3 py-1 rounded-full border border-ssp-primary text-ssp-primary hover:bg-ssp-light text-xs font-semibold transition"
                      >
                        รายละเอียด
                      </Link>
                      <Link
                        href={`/admin/workplaces/${row.workplaceId}`}
                        className="px-3 py-1 rounded-full bg-ssp-amber hover:bg-ssp-amberDark text-slate-900 text-xs font-semibold transition"
                      >
                        แก้ไขข้อมูล
                      </Link>
                    </div>
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
