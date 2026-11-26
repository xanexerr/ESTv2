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
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-semibold text-ink-primary">เพิ่มสถานประกอบการ</h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            เพิ่มข้อมูลสถานประกอบการใหม่เข้าสู่ระบบโดยผู้ดูแลระบบ
          </p>
        </div>
        <WorkplaceFormClient mode="create" cancelHref="/admin/workplaces" />
      </div>
    </div>
  );
}
