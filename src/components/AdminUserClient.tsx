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
import { AlertCircle } from "lucide-react";

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
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
    setLoading(true);
    const res = await adminDeleteUserAction(initialUser.userId);
    setLoading(false);
    setConfirmingDelete(false);
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
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {mode === "edit" && initialUser && (
        <input type="hidden" name="old_user_id" value={initialUser.userId} />
      )}

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          รหัสผู้ใช้ / รหัสประจำตัว
        </label>
        <input
          type="text"
          name={mode === "create" ? "username" : "user_id"}
          defaultValue={initialUser?.userId || ""}
          required
          placeholder="เช่น 650001"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary font-mono focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            defaultValue={initialUser?.userFname || ""}
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
            defaultValue={initialUser?.userLname || ""}
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
          defaultValue={initialUser?.userTel || ""}
          required
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary font-mono tabular-nums focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          สถานะบัญชี
        </label>
        <select
          name={mode === "create" ? "user_type" : "role"}
          defaultValue={initialUser?.role || "student"}
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="student">นักศึกษา</option>
          <option value="teacher">ครู / อาจารย์</option>
          <option value="admin">ผู้ดูแลระบบ</option>
        </select>
      </div>

      {mode === "edit" && initialUser && (
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            รหัสผ่าน
          </label>
          <input
            type="password"
            name="password"
            defaultValue={initialUser.password}
            required
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      )}

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {loading
            ? "กำลังบันทึก..."
            : mode === "create"
            ? "เพิ่มสมาชิก"
            : "บันทึกการเปลี่ยนแปลง"}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {mode === "edit" && initialUser && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={loading}
              className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-medium text-sm transition-colors"
            >
              ลบบัญชีผู้ใช้
            </button>
          )}

          {mode === "edit" && initialUser && confirmingDelete && (
            <div className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
              >
                {loading ? "กำลังลบ..." : "ยืนยันการลบ"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={loading}
                className="min-h-[44px] sm:min-h-0 sm:h-10 px-3 rounded-lg border border-line-strong text-ink-secondary text-sm font-medium"
              >
                ไม่ลบ
              </button>
            </div>
          )}

          <Link
            href="/admin/users"
            className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 inline-flex items-center justify-center px-4 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
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
      className="text-brand hover:text-brand-hover disabled:opacity-50 text-xs font-medium transition-colors"
    >
      {loading ? "..." : "สลับสถานะ"}
    </button>
  );
}
