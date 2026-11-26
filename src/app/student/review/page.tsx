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
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-semibold text-ink-primary">
            แสดงความคิดเห็นและให้คะแนนรีวิว
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            แบ่งปันประสบการณ์ฝึกงานของคุณเพื่อเป็นข้อมูลให้รุ่นน้อง
          </p>
        </div>
        <ReviewFormClient mode="create" workplaceId={user.workplaceId} />
      </div>
    </div>
  );
}
