"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions";
import { AlertCircle } from "lucide-react";

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
    <div className="max-w-md mx-auto my-8">
      <div className="bg-paper-surface rounded-2xl border border-line p-7 space-y-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand text-white dark:text-zinc-950 font-mono text-xs font-bold tracking-wider">
            UNINFO
          </div>
          <h1 className="text-xl font-semibold text-ink-primary">เข้าสู่ระบบ UNINFO</h1>
          <p className="text-xs text-ink-secondary">
            เข้าสู่ระบบเพื่อดูรีวิวสายอาชีพ สถานที่ฝึกงาน และรีวิวรายวิชาในมหาวิทยาลัยของคุณ
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-ink-secondary mb-1"
            >
              ชื่อผู้ใช้ / รหัสประจำตัว
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              autoFocus
              placeholder="650001, teacher หรือ admin"
              className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-ink-secondary mb-1"
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              placeholder="กรอกรหัสผ่าน"
              className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white dark:text-zinc-950 font-medium text-sm transition-colors"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="pt-4 border-t border-line flex items-center justify-between text-xs">
          <span className="text-ink-muted">ยังไม่มีบัญชีผู้ใช้งาน?</span>
          <Link href="/register" className="font-medium text-brand hover:underline">
            สมัครสมาชิกพร้อมแนบหลักฐาน
          </Link>
        </div>

        <div className="pt-3 border-t border-line text-xs text-ink-muted">
          <div className="font-medium text-ink-secondary mb-1.5">บัญชีทดสอบ</div>
          <div className="grid grid-cols-3 gap-2 font-mono">
            <div className="p-2 rounded-lg bg-paper-bg border border-line">
              <div className="font-sans font-medium text-ink-primary">Admin</div>
              <div>admin / admin</div>
            </div>
            <div className="p-2 rounded-lg bg-paper-bg border border-line">
              <div className="font-sans font-medium text-ink-primary">Teacher</div>
              <div>teacher / teacher</div>
            </div>
            <div className="p-2 rounded-lg bg-paper-bg border border-line">
              <div className="font-sans font-medium text-ink-primary">Student</div>
              <div>650001 / 650001</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
