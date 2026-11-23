import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewFormClient } from "@/components/WorkplaceFormClient";

export default async function StudentAddReviewPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { userId: session.userId },
  });

  if (!user?.workplaceId) {
    redirect("/student/workplace");
  }

  return (
    <div className="max-w-xl mx-auto my-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6">
          <h1 className="text-lg font-bold">
            แสดงความคิดเห็นและให้คะแนนรีวิว
          </h1>
          <p className="text-xs text-white/80 mt-0.5">
            แบ่งปันประสบการณ์ฝึกงานของคุณเพื่อเป็นข้อมูลให้รุ่นน้อง
          </p>
        </div>
        <ReviewFormClient mode="create" workplaceId={user.workplaceId} />
      </div>
    </div>
  );
}
