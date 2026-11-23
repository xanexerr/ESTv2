"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionUser } from "@/lib/auth";
import { getRoleLabel } from "@/lib/constants";
import { logoutAction } from "@/app/actions";
import {
  Compass,
  Users,
  Building2,
  MessageSquare,
  Briefcase,
  UserCheck,
  Headset,
  UserPen,
  LogOut,
  LogIn,
  GraduationCap,
} from "lucide-react";

export function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-ssp-light text-ssp-primary font-semibold"
        : "text-slate-600 hover:text-ssp-primary hover:bg-ssp-light/60"
    }`;

  const initial = user
    ? (user.userFname || user.userId).charAt(0).toUpperCase()
    : "";

  return (
    <>
      {/* Top Brand Header */}
      <header className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white py-3 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/img/logo_ithtc.png"
              alt="IT HTC Logo"
              className="w-11 h-11 rounded-xl bg-white p-1 object-contain shadow-md"
            />
            <div>
              <p className="font-bold text-lg leading-tight tracking-tight">
                ระบบรวบรวมสถานประกอบการฝึกงาน
              </p>
              <p className="text-xs text-white/80">
                แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่ (HTC Internship Portal)
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2.5 bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 pl-1.5 pr-3.5 py-1 rounded-full text-sm transition"
              >
                <span className="w-7 h-7 rounded-full bg-ssp-amber text-slate-900 font-bold text-xs flex items-center justify-center">
                  {initial}
                </span>
                <span className="font-medium">
                  {`${user.userFname} ${user.userLname}`.trim() || user.userId}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-ssp-amber text-slate-900">
                  {getRoleLabel(user.role)}
                </span>
              </Link>
            ) : (
              <span className="hidden md:inline-flex items-center gap-2 bg-white/95 text-slate-800 text-xs font-medium px-3.5 py-1.5 rounded-full shadow-sm">
                <GraduationCap className="w-4 h-4 text-ssp-primary" />
                สำหรับนักเรียน นักศึกษา ฝึกประสบการณ์วิชาชีพ
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <Link href="/" className={navLinkClass("/")}>
              <Compass className="w-4 h-4" /> หน้าแรก
            </Link>

            {user?.role === "admin" && (
              <>
                <Link href="/admin/users" className={navLinkClass("/admin/users")}>
                  <Users className="w-4 h-4" /> จัดการบัญชีผู้ใช้
                </Link>
                <Link
                  href="/admin/workplaces"
                  className={navLinkClass("/admin/workplaces")}
                >
                  <Building2 className="w-4 h-4" /> จัดการสถานประกอบการ
                </Link>
                <Link
                  href="/admin/comments"
                  className={navLinkClass("/admin/comments")}
                >
                  <MessageSquare className="w-4 h-4" /> จัดการความคิดเห็น
                </Link>
              </>
            )}

            {user?.role === "teacher" && (
              <Link
                href="/teacher/workplaces"
                className={navLinkClass("/teacher/workplaces")}
              >
                <Briefcase className="w-4 h-4" /> จัดการสถานประกอบการของฉัน
              </Link>
            )}

            {user?.role === "student" && (
              <Link
                href="/student/workplace"
                className={navLinkClass("/student/workplace")}
              >
                <UserCheck className="w-4 h-4" /> สถานประกอบการของคุณ
              </Link>
            )}

            <Link href="/about" className={navLinkClass("/about")}>
              <Headset className="w-4 h-4" /> ติดต่อแอดมิน
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/profile" className={navLinkClass("/profile")}>
                  <UserPen className="w-4 h-4" /> ข้อมูลส่วนตัว
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-ssp-primary hover:bg-ssp-dark text-white shadow-sm transition"
              >
                <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export function Footer({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="mt-auto">
      {!isLoggedIn && (
        <div className="bg-ssp-cream border-t border-amber-200/70 py-2.5 px-4 text-center text-xs text-slate-600">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-2">
            <span>ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?</span>
            <a
              href="https://forms.gle/MJ74K2imzm8DAvkp6"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ssp-primary hover:underline"
            >
              ลงทะเบียนใช้งานระบบ
            </a>
            <span className="text-slate-400">|</span>
            <Link href="/about" className="font-semibold text-slate-700 hover:underline">
              ติดต่อทีมงานผู้พัฒนา
            </Link>
          </div>
        </div>
      )}
      <footer className="bg-gradient-to-r from-ssp-dark to-ssp-primary text-white/90 py-5 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="font-medium">
            &copy; วิทยาลัยเทคนิคหาดใหญ่ (Hat Yai Technical College) — แผนกเทคโนโลยีสารสนเทศ
          </div>
          <div className="text-xs text-white/75">
            ระบบรวบรวมสถานประกอบการสำหรับนักเรียน นักศึกษา ฝึกประสบการณ์วิชาชีพ (Next.js + PostgreSQL)
          </div>
        </div>
      </footer>
    </div>
  );
}
