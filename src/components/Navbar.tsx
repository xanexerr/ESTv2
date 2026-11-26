"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { getRoleLabel } from "@/lib/constants";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Admin routes render their own dedicated Left Sidebar layout
  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function handleLogout() {
    await logoutAction();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `whitespace-nowrap px-3 py-2 min-h-[44px] md:min-h-0 md:py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
      isActive(href)
        ? "bg-paper-muted text-ink-primary font-semibold"
        : "text-ink-secondary hover:text-ink-primary hover:bg-paper-muted/70"
    }`;

  const navItems = [
    { href: "/", label: "สถานประกอบการ", show: true },
    { href: "/courses", label: "รีวิวรายวิชา", show: true },
    {
      href: "/admin/approvals",
      label: "จัดการระบบ (Admin)",
      show: user?.role === "admin",
    },
    {
      href: "/teacher/reports",
      label: "ตรวจรายงานฝึกงาน",
      show: user?.role === "teacher",
    },
    {
      href: "/teacher/workplaces",
      label: "สถานประกอบการของฉัน",
      show: user?.role === "teacher",
    },
    {
      href: "/student/internships",
      label: "รอบฝึกงาน",
      show: user?.role === "student",
    },
    {
      href: "/student/logbook",
      label: "บันทึกงาน",
      show: user?.role === "student",
    },
    {
      href: "/student/workplace",
      label: "สถานประกอบการของฉัน",
      show: user?.role === "student",
    },
    { href: "/about", label: "ติดต่อ", show: true },
  ].filter((item) => item.show);

  return (
    <header className="sticky top-0 z-40 bg-paper-surface border-b border-line">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: EST Brand + Nav */}
        <div className="flex items-center gap-5 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 min-h-[44px] md:min-h-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span className="w-7 h-7 rounded-md bg-brand text-white dark:text-zinc-950 font-mono font-semibold text-xs inline-flex items-center justify-center">
              EST
            </span>
            <span className="text-sm font-semibold text-ink-primary tracking-tight">
              EST
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="เมนูหลัก">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Theme Toggle + Auth Controls + Mobile Menu Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle compact />

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/profile" className={linkClass("/profile")}>
                  <span>
                    {`${user.userFname} ${user.userLname}`.trim() || user.userId}
                  </span>
                  <span className="ml-1.5 text-xs text-ink-muted">
                    ({getRoleLabel(user.role)})
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-ink-secondary hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg transition-colors duration-150"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors duration-150"
                >
                  สมัครสมาชิก
                </Link>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 transition-colors duration-150"
                >
                  เข้าสู่ระบบ
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={mobileOpen}
            className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-lg text-ink-primary hover:bg-paper-muted transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="เมนูมือถือ"
          className="md:hidden border-t border-line bg-paper-surface px-4 py-3 space-y-1"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={linkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-line space-y-1">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={linkClass("/profile")}
                >
                  ข้อมูลส่วนตัว (
                  {`${user.userFname} ${user.userLname}`.trim() || user.userId})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-paper-muted transition-colors"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-lg text-sm font-medium border border-line-strong text-ink-primary"
                >
                  สมัครสมาชิก
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-lg text-sm font-medium bg-brand text-white dark:text-zinc-950"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-line bg-paper-surface py-4 text-xs text-ink-muted">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>EST — แพลตฟอร์มรวบรวมสถานประกอบการฝึกงานสำหรับมหาวิทยาลัย</div>
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <Link
              href="/register"
              className="text-ink-secondary hover:text-ink-primary transition-colors"
            >
              สมัครสมาชิก
            </Link>
          )}
          <Link
            href="/about"
            className="text-ink-secondary hover:text-ink-primary transition-colors"
          >
            ติดต่อผู้ดูแลระบบ
          </Link>
        </div>
      </div>
    </footer>
  );
}
