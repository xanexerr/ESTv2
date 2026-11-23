import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkplaceFormClient } from "@/components/WorkplaceFormClient";

export default async function TeacherEditWorkplacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const { id } = await params;
  const workplace = await prisma.workplace.findUnique({
    where: { workplaceId: Number(id) },
  });

  if (!workplace) {
    redirect("/teacher/workplaces");
  }

  return (
    <div className="max-w-2xl mx-auto my-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6">
          <h1 className="text-lg font-bold">แก้ไขข้อมูลสถานประกอบการ</h1>
          <p className="text-xs text-white/80 mt-0.5">
            ปรับปรุงรายละเอียดสถานประกอบการที่คุณดูแล
          </p>
        </div>
        <WorkplaceFormClient
          mode="edit"
          initialData={workplace}
          cancelHref="/teacher/workplaces"
          canDelete={true}
        />
      </div>
    </div>
  );
}
