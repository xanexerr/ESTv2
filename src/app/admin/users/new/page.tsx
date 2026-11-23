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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6">
          <h1 className="text-lg font-bold">ระบบเพิ่มสมาชิกใหม่</h1>
          <p className="text-xs text-white/80 mt-0.5">
            รหัสผ่านเริ่มต้นจะถูกตั้งค่าให้ตรงกับรหัสประจำตัวของผู้ใช้
          </p>
        </div>
        <AdminUserFormClient mode="create" />
      </div>
    </div>
  );
}
