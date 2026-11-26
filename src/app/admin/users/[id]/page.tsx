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
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-semibold text-ink-primary">แก้ไขรายละเอียดบัญชีผู้ใช้</h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            จัดการข้อมูลส่วนตัว สถานะสิทธิ์ และรหัสผ่านของผู้ใช้
          </p>
        </div>
        <AdminUserFormClient mode="edit" initialUser={user} />
      </div>
    </div>
  );
}
