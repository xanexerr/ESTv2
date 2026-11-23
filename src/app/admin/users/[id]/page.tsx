import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUserFormClient } from "@/components/AdminUserClient";

export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { userId: decodeURIComponent(id) },
  });

  if (!user) {
    redirect("/admin/users");
  }

  return (
    <div className="max-w-xl mx-auto my-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6">
          <h1 className="text-lg font-bold">แก้ไขรายละเอียดบัญชีผู้ใช้</h1>
          <p className="text-xs text-white/80 mt-0.5">
            จัดการข้อมูลส่วนตัว สถานะสิทธิ์ และรหัสผ่านของผู้ใช้
          </p>
        </div>
        <AdminUserFormClient mode="edit" initialUser={user} />
      </div>
    </div>
  );
}
