"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UserCheck,
  Building2,
  Users,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminSidebar({
  user,
  pendingCount,
}: {
  user: SessionUser;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    {
      href: "/admin/approvals",
      label: "อนุมัติบัญชี",
      icon: UserCheck,
      badge: pendingCount,
    },
    {
      href: "/admin/workplaces",
      label: "สถานประกอบการ",
      icon: Building2,
      badge: 0,
    },
    {
      href: "/admin/users",
      label: "บัญชีผู้ใช้",
      icon: Users,
      badge: 0,
    },
    {
      href: "/admin/comments",
      label: "ความคิดเห็น",
      icon: MessageSquare,
      badge: 0,
    },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-line flex items-center justify-between">
        <Link href="/admin/approvals" className="flex items-center gap-2.5">
          <span className="px-2.5 h-8 rounded-lg bg-brand text-white dark:text-zinc-950 font-mono font-bold text-xs tracking-wider inline-flex items-center justify-center">
            UNINFO
          </span>
          <span className="text-sm font-semibold text-ink-primary">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="ปิดเมนู"
          className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-ink-secondary hover:bg-paper-muted"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="เมนูผู้ดูแลระบบ" className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between gap-2 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-brand-subtle text-brand font-semibold"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-paper-muted"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-brand text-white dark:text-zinc-950 font-mono text-xs font-semibold tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-line">
          <Link
            href="/my-career"
            className="flex items-center gap-2.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-paper-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            กลับหน้า My Career
          </Link>
        </div>
      </nav>

      {/* Bottom Controls: Theme + User + Logout */}
      <div className="p-3 border-t border-line space-y-2">
        <ThemeToggle />
        <div className="px-3 py-2 rounded-lg bg-paper-bg border border-line text-xs">
          <div className="font-medium text-ink-primary truncate">
            {`${user.userFname} ${user.userLname}`.trim() || user.userId}
          </div>
          <div className="text-ink-muted font-mono">{user.username}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 min-h-[40px] px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar for Admin */}
      <div className="lg:hidden sticky top-0 z-30 h-14 px-4 bg-paper-surface border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนูผู้ดูแลระบบ"
            className="w-11 h-11 -ml-2 inline-flex items-center justify-center rounded-lg text-ink-primary hover:bg-paper-muted"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <span className="text-sm font-semibold text-ink-primary">
            UNINFO Admin
          </span>
        </div>
        <ThemeToggle compact />
      </div>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-line bg-paper-surface sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-paper-surface h-full shadow-xl z-10">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
