import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeImagePath } from "@/lib/constants";
import { ReviewFormClient } from "@/components/WorkplaceFormClient";

export default async function StudentEditReviewPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const [user, comment] = await Promise.all([
    prisma.user.findUnique({ where: { userId: session.userId } }),
    prisma.comment.findFirst({ where: { userId: session.userId } }),
  ]);

  if (!comment) {
    redirect("/student/review");
  }

  const workplaceId = user?.workplaceId || comment.workplaceId;

  return (
    <div className="max-w-xl mx-auto my-4">
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line">
          <h1 className="text-lg font-semibold text-ink-primary">แก้ไขความคิดเห็นของคุณ</h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            ปรับปรุงข้อความรีวิวหรืออัปเดตรูปภาพประกอบการฝึกงาน
          </p>
        </div>
        <ReviewFormClient
          mode="edit"
          workplaceId={workplaceId}
          initialRating={comment.rating}
          initialComment={comment.commentText}
          existingImgUrl={normalizeImagePath(comment.img)}
        />
      </div>
    </div>
  );
}
