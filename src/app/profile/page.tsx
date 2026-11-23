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

  const initial = (user.userFname || user.userId).charAt(0).toUpperCase();

  return (
    <div className="max-w-xl mx-auto my-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white p-6 flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-ssp-amber text-slate-900 font-bold text-xl flex items-center justify-center" style={{ width: 52, height: 52 }}>
            {initial}
          </div>
          <div>
            <h1 className="text-lg font-bold">แก้ไขข้อมูลส่วนตัว</h1>
            <p className="text-xs text-white/80">
              สถานะบัญชี : {getRoleLabel(user.role)}
            </p>
          </div>
        </div>

        <ProfileFormClient user={user} />
      </div>
    </div>
  );
}
