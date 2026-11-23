import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  UserPlus,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search_query?: string }>;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const sp = await searchParams;
  const searchQuery = (sp.search_query || "").trim();

  const where: any = {};
  if (searchQuery) {
    where.OR = [
      { userId: { contains: searchQuery, mode: "insensitive" } },
      { username: { contains: searchQuery, mode: "insensitive" } },
      { userFname: { contains: searchQuery, mode: "insensitive" } },
      { userLname: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [totalUsers, studentCount, teacherCount, adminCount, users] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "teacher" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.findMany({
        where,
        orderBy: { userId: "desc" },
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-ssp-primary" />
            ข้อมูลผู้ใช้ทั้งหมด (User Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการบัญชีผู้ใช้งาน นักเรียน ครู และผู้ดูแลระบบ
          </p>
        </div>

        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ssp-primary hover:bg-ssp-dark text-white text-xs font-semibold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" /> เพิ่มบัญชีผู้ใช้
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-ssp-light text-ssp-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">บัญชีทั้งหมด</div>
            <div className="text-xl font-bold text-slate-800">{totalUsers}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">นักเรียน / นักศึกษา</div>
            <div className="text-xl font-bold text-slate-800">
              {studentCount}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">ครู / อาจารย์</div>
            <div className="text-xl font-bold text-slate-800">
              {teacherCount}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">ผู้ดูแลระบบ</div>
            <div className="text-xl font-bold text-slate-800">{adminCount}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <form
          method="GET"
          action="/admin/users"
          className="grid grid-cols-1 md:grid-cols-12 gap-2"
        >
          <div className="md:col-span-10">
            <input
              type="text"
              name="search_query"
              defaultValue={searchQuery}
              placeholder="ค้นหารหัสผู้ใช้, ชื่อผู้ใช้, หรือชื่อ-นามสกุล..."
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">รหัสผู้ใช้</th>
                <th className="py-3.5 px-4">ชื่อผู้ใช้</th>
                <th className="py-3.5 px-4">ชื่อ</th>
                <th className="py-3.5 px-4">นามสกุล</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((row) => (
                <tr key={row.userId} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.userId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.username}</td>
                  <td className="py-3.5 px-4 text-slate-800">
                    {row.userFname}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">
                    {row.userLname}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.role === "student" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        นักเรียน นักศึกษา
                      </span>
                    ) : row.role === "admin" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ผู้ดูแลระบบ
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        ครู
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/admin/users/${encodeURIComponent(row.userId)}`}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-ssp-amber hover:bg-ssp-amberDark text-slate-900 text-xs font-semibold transition"
                    >
                      แก้ไขข้อมูล
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
