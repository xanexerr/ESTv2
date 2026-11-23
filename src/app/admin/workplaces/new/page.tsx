import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { WorkplaceFormClient } from "@/components/WorkplaceFormClient";

export default async function AdminNewWorkplacePage() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto my-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6">
          <h1 className="text-lg font-bold">เพิ่มสถานประกอบการ</h1>
          <p className="text-xs text-white/80 mt-0.5">
            เพิ่มข้อมูลสถานประกอบการใหม่เข้าสู่ระบบโดยผู้ดูแลระบบ
          </p>
        </div>
        <WorkplaceFormClient mode="create" cancelHref="/admin/workplaces" />
      </div>
    </div>
  );
}
