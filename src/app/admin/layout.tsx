import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const pendingCount = await prisma.user.count({
    where: { status: "pending" },
  });

  return (
    <div className="-mx-4 sm:-mx-6 -my-5 min-h-screen flex flex-col lg:flex-row bg-paper-bg">
      <AdminSidebar user={session} pendingCount={pendingCount} />
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
