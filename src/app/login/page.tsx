"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions";
import { User, Lock, LogIn, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);
    setLoading(false);

    if (res.ok) {
      router.push(res.redirectTo || "/");
      router.refresh();
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="my-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="md:col-span-5 hidden md:flex flex-col justify-between p-7 bg-gradient-to-br from-ssp-dark to-ssp-primary text-white">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-ssp-amber/20 text-ssp-amber mb-3">
              HTC Internship System
            </span>
            <h2 className="text-xl font-bold leading-snug mb-2">
              ยินดีต้อนรับสู่ระบบสถานประกอบการ
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              สำหรับนักเรียน นักศึกษา อาจารย์ และผู้ดูแลระบบ แผนกวิชาเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่
            </p>
          </div>

          <div className="my-4">
            <img
              src="/img/login_banner.png"
              alt="Login Banner"
              className="rounded-xl shadow-md w-full max-h-40 object-cover"
            />
          </div>

          <div className="text-xs text-white/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-ssp-amber flex-shrink-0" />
            เข้าสู่ระบบด้วยรหัสประจำตัวนักเรียนหรือชื่อผู้ใช้
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-7 sm:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ssp-primary">
              เข้าสู่ระบบ (Sign In)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              กรอกชื่อบัญชีผู้ใช้และรหัสผ่านของคุณเพื่อเข้าใช้งาน
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                ชื่อบัญชีผู้ใช้ / รหัสประจำตัว
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  autoFocus
                  placeholder="เช่น 650001, teacher, หรือ admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </button>

              <Link
                href="/"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
              >
                ยกเลิกและกลับหน้าแรก
              </Link>
            </div>
          </form>

          {/* Quick Demo Accounts Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
            <div className="font-semibold text-slate-700 mb-1.5">
              บัญชีสำหรับทดสอบระบบ:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="font-semibold text-slate-700">Admin</div>
                <div>user: <code>admin</code></div>
                <div>pass: <code>admin</code></div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="font-semibold text-slate-700">Teacher</div>
                <div>user: <code>teacher</code></div>
                <div>pass: <code>teacher</code></div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="font-semibold text-slate-700">Student</div>
                <div>user: <code>650001</code></div>
                <div>pass: <code>650001</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
