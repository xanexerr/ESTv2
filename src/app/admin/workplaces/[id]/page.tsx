import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkplaceFormClient } from "@/components/WorkplaceFormClient";

export default async function AdminEditWorkplacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;
  const workplace = await prisma.workplace.findUnique({
    where: { workplaceId: Number(id) },
  });

  if (!workplace) {
    redirect("/admin/workplaces");
  }

  return (
    <div className="max-w-2xl mx-auto my-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6">
          <h1 className="text-lg font-bold">แก้ไขรายละเอียดสถานประกอบการ</h1>
          <p className="text-xs text-white/80 mt-0.5">
            จัดการข้อมูลและสถานะการแสดงผลบนหน้าเว็บไซต์
          </p>
        </div>
        <WorkplaceFormClient
          mode="edit"
          initialData={workplace}
          cancelHref="/admin/workplaces"
          canToggleShow={true}
          canDelete={true}
        />
      </div>
    </div>
  );
}
