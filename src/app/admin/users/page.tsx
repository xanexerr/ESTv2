import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";

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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            จัดการบัญชีผู้ใช้
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            จัดการบัญชีนักศึกษา ครู และผู้ดูแลระบบ
          </p>
        </div>

        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
        >
          <Plus strokeWidth={1.5} className="w-4 h-4" />
          เพิ่มบัญชีผู้ใช้
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 bg-paper-surface border border-line rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-line">
        <div className="p-5">
          <div className="text-xs text-ink-muted">บัญชีทั้งหมด</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-primary mt-1">
            {totalUsers}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">นักศึกษา</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-brand mt-1">
            {studentCount}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">ครู / อาจารย์</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-primary mt-1">
            {teacherCount}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-ink-muted">ผู้ดูแลระบบ</div>
          <div className="text-2xl font-mono font-semibold tabular-nums text-ink-primary mt-1">
            {adminCount}
          </div>
        </div>
      </div>

      <form
        method="GET"
        action="/admin/users"
        className="bg-paper-surface rounded-xl border border-line p-3 grid grid-cols-1 md:grid-cols-12 gap-2"
      >
        <div className="md:col-span-10">
          <input
            type="text"
            name="search_query"
            defaultValue={searchQuery}
            placeholder="ค้นหารหัสผู้ใช้, ชื่อผู้ใช้, หรือชื่อ-นามสกุล"
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

      <div className="bg-paper-surface rounded-xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-paper-muted/70 text-ink-secondary text-xs font-medium border-b border-line">
              <tr>
                <th className="py-3 px-4 font-mono">รหัสผู้ใช้</th>
                <th className="py-3 px-4">ชื่อผู้ใช้</th>
                <th className="py-3 px-4">ชื่อ</th>
                <th className="py-3 px-4">นามสกุล</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((row) => (
                <tr key={row.userId} className="hover:bg-paper-bg transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-ink-primary tabular-nums">
                    {row.userId}
                  </td>
                  <td className="py-3.5 px-4 text-ink-secondary">{row.username}</td>
                  <td className="py-3.5 px-4 text-ink-primary">{row.userFname}</td>
                  <td className="py-3.5 px-4 text-ink-primary">{row.userLname}</td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper-muted text-ink-secondary font-medium border border-line">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            row.role === "admin"
                              ? "#136F73"
                              : row.role === "teacher"
                              ? "#D97706"
                              : "#2563EB",
                        }}
                      />
                      {row.role === "student"
                        ? "นักศึกษา"
                        : row.role === "admin"
                        ? "ผู้ดูแลระบบ"
                        : "ครู"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/users/${encodeURIComponent(row.userId)}`}
                      className="text-brand hover:text-brand-hover font-medium text-xs"
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
