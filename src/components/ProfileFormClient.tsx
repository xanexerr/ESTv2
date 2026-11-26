"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export function ProfileFormClient({
  user,
}: {
  user: {
    userId: string;
    userFname: string;
    userLname: string;
    userTel: string | null;
    password: string;
    role: string;
  };
}) {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(formData);
    setLoading(false);
    setStatus({ ok: res.ok, msg: res.message });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {status && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            status.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {status.ok ? (
            <Check strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          )}
          {status.msg}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          รหัสผู้ใช้
        </label>
        <input
          type="text"
          name="user_id"
          value={user.userId}
          readOnly
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-muted border border-line text-ink-muted font-mono tabular-nums"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            ชื่อ
          </label>
          <input
            type="text"
            name="user_fname"
            defaultValue={user.userFname}
            required
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            นามสกุล
          </label>
          <input
            type="text"
            name="user_lname"
            defaultValue={user.userLname}
            required
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          เบอร์โทรศัพท์
        </label>
        <input
          type="text"
          name="user_tel"
          defaultValue={user.userTel || ""}
          required
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary font-mono tabular-nums focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          รหัสผ่าน
        </label>
        <div className="flex gap-2">
          <input
            type={showPwd ? "text" : "password"}
            name="password"
            defaultValue={user.password}
            required
            className="flex-grow px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-line-strong text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors"
          >
            {showPwd ? (
              <>
                <EyeOff strokeWidth={1.5} className="w-4 h-4" /> ซ่อน
              </>
            ) : (
              <>
                <Eye strokeWidth={1.5} className="w-4 h-4" /> แสดง
              </>
            )}
          </button>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
        <Link
          href={user.role === "admin" ? "/admin/users" : "/"}
          className="py-2.5 px-4 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
