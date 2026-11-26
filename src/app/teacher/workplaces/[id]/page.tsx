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
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-semibold text-ink-primary">แก้ไขข้อมูลสถานประกอบการ</h1>
          <p className="text-xs text-ink-secondary mt-0.5">
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
