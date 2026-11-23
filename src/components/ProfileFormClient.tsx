"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions";
import { Eye, EyeOff, Save, CheckCircle2, AlertCircle } from "lucide-react";

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
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            status.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {status.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          {status.msg}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          รหัสผู้ใช้ (ไม่สามารถแก้ไขได้)
        </label>
        <input
          type="text"
          name="user_id"
          value={user.userId}
          readOnly
          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อ
          </label>
          <input
            type="text"
            name="user_fname"
            defaultValue={user.userFname}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            นามสกุล
          </label>
          <input
            type="text"
            name="user_lname"
            defaultValue={user.userLname}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          เบอร์โทรศัพท์
        </label>
        <input
          type="text"
          name="user_tel"
          defaultValue={user.userTel || ""}
          required
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          รหัสผ่าน
        </label>
        <div className="flex gap-2">
          <input
            type={showPwd ? "text" : "password"}
            name="password"
            defaultValue={user.password}
            required
            className="flex-grow px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {showPwd ? (
              <>
                <EyeOff className="w-4 h-4" /> ซ่อน
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> แสดง
              </>
            )}
          </button>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark disabled:opacity-60 text-white font-semibold text-sm transition"
        >
          <Save className="w-4 h-4" />
          {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
        <Link
          href={user.role === "admin" ? "/admin/users" : "/"}
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
