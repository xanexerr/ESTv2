"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  adminCreateUserAction,
  adminUpdateUserAction,
  adminDeleteUserAction,
  toggleCommentVisibilityAction,
} from "@/app/actions";
import { Save, Trash2, UserPlus, AlertCircle } from "lucide-react";

export function AdminUserFormClient({
  mode,
  initialUser,
}: {
  mode: "create" | "edit";
  initialUser?: {
    userId: string;
    userFname: string;
    userLname: string;
    userTel: string | null;
    role: string;
    password: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res =
      mode === "create"
        ? await adminCreateUserAction(formData)
        : await adminUpdateUserAction(formData);
    setLoading(false);

    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      setError(res.message);
    }
  }

  async function handleDelete() {
    if (!initialUser) return;
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบัญชีผู้ใช้นี้?")) return;
    setLoading(true);
    const res = await adminDeleteUserAction(initialUser.userId);
    setLoading(false);
    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      setError(res.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {mode === "edit" && initialUser && (
        <input type="hidden" name="old_user_id" value={initialUser.userId} />
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          รหัสผู้ใช้ / รหัสประจำตัว
        </label>
        <input
          type="text"
          name={mode === "create" ? "username" : "user_id"}
          defaultValue={initialUser?.userId || ""}
          required
          placeholder="เช่น รหัสนักศึกษา 65xxxx หรือชื่อผู้ใช้"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
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
            defaultValue={initialUser?.userFname || ""}
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
            defaultValue={initialUser?.userLname || ""}
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
          defaultValue={initialUser?.userTel || ""}
          required
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          สถานะ / ประเภทบัญชี
        </label>
        <select
          name={mode === "create" ? "user_type" : "role"}
          defaultValue={initialUser?.role || "student"}
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-ssp-primary"
        >
          <option value="student">นักเรียน นักศึกษา</option>
          <option value="teacher">ครู / อาจารย์</option>
          <option value="admin">ผู้ดูแลระบบ</option>
        </select>
      </div>

      {mode === "edit" && initialUser && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            รหัสผ่าน
          </label>
          <input
            type="password"
            name="password"
            defaultValue={initialUser.password}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
          />
        </div>
      )}

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark disabled:opacity-60 text-white font-semibold text-sm transition"
        >
          {mode === "create" ? (
            <>
              <UserPlus className="w-4 h-4" /> เพิ่มสมาชิก
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง
            </>
          )}
        </button>

        {mode === "edit" && initialUser && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition"
          >
            <Trash2 className="w-4 h-4" /> ลบบัญชีผู้ใช้
          </button>
        )}

        <Link
          href="/admin/users"
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}

export function ToggleCommentButton({ commentId }: { commentId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleCommentVisibilityAction(commentId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-3 py-1 rounded-full bg-ssp-amber hover:bg-ssp-amberDark disabled:opacity-60 text-slate-900 text-xs font-semibold transition"
    >
      {loading ? "..." : "แก้ไขสถานะ"}
    </button>
  );
}
