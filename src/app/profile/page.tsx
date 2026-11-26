import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRoleLabel } from "@/lib/constants";
import { ProfileFormClient } from "@/components/ProfileFormClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { userId: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl mx-auto my-4">
      <div className="bg-paper-surface rounded-2xl border border-line overflow-hidden">
        <div className="p-6 border-b border-line flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-ink-primary">
              แก้ไขข้อมูลส่วนตัว
            </h1>
            <p className="text-xs text-ink-secondary mt-0.5">
              สถานะบัญชี: {getRoleLabel(user.role)}
            </p>
          </div>
          <span className="font-mono text-xs text-ink-muted tabular-nums">
            {user.userId}
          </span>
        </div>

        <ProfileFormClient user={user} />
      </div>
    </div>
  );
}
