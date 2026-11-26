import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminUserFormClient } from "@/components/AdminUserClient";

export default async function AdminNewUserPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "admin" && session.role !== "teacher")) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl mx-auto my-4">
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-semibold text-ink-primary">ระบบเพิ่มสมาชิกใหม่</h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            รหัสผ่านเริ่มต้นจะถูกตั้งค่าให้ตรงกับรหัสประจำตัวของผู้ใช้
          </p>
        </div>
        <AdminUserFormClient mode="create" />
      </div>
    </div>
  );
}
