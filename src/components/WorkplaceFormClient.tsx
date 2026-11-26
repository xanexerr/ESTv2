"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WORK_TYPES, WORK_MODES, THAI_PROVINCES, WorkModeValue } from "@/lib/constants";
import {
  createWorkplaceAction,
  updateWorkplaceAction,
  deleteWorkplaceAction,
  toggleWorkplaceVisibilityAction,
  submitCommentAction,
  updateCommentAction,
} from "@/app/actions";
import { Star, AlertCircle, Check } from "lucide-react";

export function WorkplaceFormClient({
  mode,
  initialData,
  cancelHref,
  canToggleShow = false,
  canDelete = false,
  extraFooter,
}: {
  mode: "create" | "edit";
  initialData?: {
    workplaceId: number;
    workplaceName: string;
    workType: string;
    workMode?: WorkModeValue;
    province?: string | null;
    workTel: string | null;
    description: string | null;
    workplaceAddress: string;
    map: string | null;
    show: boolean;
  };
  cancelHref: string;
  canToggleShow?: boolean;
  canDelete?: boolean;
  extraFooter?: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [workMode, setWorkMode] = useState<WorkModeValue>(
    initialData?.workMode || "onsite"
  );
  const [province, setProvince] = useState<string>(
    initialData?.province || "สงขลา"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    const res =
      mode === "create"
        ? await createWorkplaceAction(formData)
        : await updateWorkplaceAction(formData);
    setLoading(false);

    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      setStatus({ ok: res.ok, msg: res.message });
    }
  }

  async function handleToggleShow() {
    if (!initialData) return;
    setLoading(true);
    const res = await toggleWorkplaceVisibilityAction(initialData.workplaceId);
    setLoading(false);
    setStatus({ ok: res.ok, msg: res.message });
    router.refresh();
  }

  async function handleDelete() {
    if (!initialData) return;
    setLoading(true);
    const res = await deleteWorkplaceAction(initialData.workplaceId);
    setLoading(false);
    setConfirmingDelete(false);
    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      setStatus({ ok: res.ok, msg: res.message });
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

      {canToggleShow && initialData && (
        <div className="p-4 rounded-xl bg-paper-bg border border-line flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="text-xs text-ink-muted">สถานะการแสดงผลปัจจุบัน</div>
            <div className="text-sm font-medium text-ink-primary mt-0.5">
              {initialData.show ? "กำลังแสดงผลบนเว็บไซต์" : "ซ่อน / ไม่แสดงผล"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleShow}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg border border-line-strong bg-paper-surface hover:bg-paper-muted text-xs font-medium text-ink-primary transition-colors"
          >
            {initialData.show ? "เปลี่ยนเป็นซ่อน" : "เปลี่ยนเป็นแสดงผล"}
          </button>
        </div>
      )}

      {mode === "edit" && initialData && (
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            รหัสสถานประกอบการ
          </label>
          <input
            type="text"
            name="workplace_id"
            value={initialData.workplaceId}
            readOnly
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-muted border border-line text-ink-muted font-mono tabular-nums"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          ชื่อบริษัท / สถานประกอบการ
        </label>
        <input
          type="text"
          name="workplace_name"
          defaultValue={initialData?.workplaceName || ""}
          required
          placeholder="ระบุชื่อบริษัทหรือหน่วยงาน"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            ประเภทงาน
          </label>
          <select
            name="work_type"
            defaultValue={initialData?.workType || "เขียนโปรแกรม"}
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {WORK_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            เบอร์โทรติดต่อ
          </label>
          <input
            type="text"
            name="work_tel"
            defaultValue={initialData?.workTel || ""}
            required
            placeholder="074123456"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary font-mono tabular-nums focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Work Mode (Onsite / Hybrid / Remote) + Conditional Province */}
      <div className="space-y-3 p-4 rounded-xl bg-paper-bg border border-line">
        <div>
          <span className="block text-xs font-medium text-ink-secondary mb-2">
            รูปแบบสถานที่ทำงาน <span className="text-red-500">*</span>
          </span>
          <input type="hidden" name="work_mode" value={workMode} />
          <div className="grid grid-cols-3 gap-2">
            {WORK_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setWorkMode(m.value)}
                aria-pressed={workMode === m.value}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  workMode === m.value
                    ? "bg-brand text-white dark:text-zinc-950 border-brand"
                    : "bg-paper-surface text-ink-secondary border-line-strong hover:text-ink-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {(workMode === "onsite" || workMode === "hybrid") && (
          <div>
            <label
              htmlFor="wp_province"
              className="block text-xs font-medium text-ink-secondary mb-1"
            >
              จังหวัดที่ตั้งสถานประกอบการ <span className="text-red-500">*</span>
            </label>
            <select
              id="wp_province"
              name="province"
              required
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3.5 py-2 text-sm rounded-lg bg-paper-surface border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              <option value="">-- เลือกจังหวัด --</option>
              {THAI_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          ลักษณะงาน
        </label>
        <input
          type="text"
          name="description"
          defaultValue={initialData?.description || ""}
          required
          placeholder="อธิบายลักษณะงานที่ปฏิบัติโดยสังเขป"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          ที่อยู่สถานประกอบการ
        </label>
        <textarea
          name="workplace_address"
          rows={3}
          defaultValue={initialData?.workplaceAddress || ""}
          required
          placeholder="ระบุบ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          ลิงก์แผนที่ (Google Maps URL)
        </label>
        <input
          type="text"
          name="map"
          defaultValue={initialData?.map || ""}
          placeholder="https://maps.google.com"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {loading
            ? "กำลังบันทึก..."
            : mode === "create"
            ? "เพิ่มสถานประกอบการ"
            : "บันทึกการเปลี่ยนแปลง"}
        </button>

        {extraFooter}

        <div className="flex flex-wrap items-center gap-2">
          {canDelete && initialData && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={loading}
              className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-medium text-sm transition-colors"
            >
              ลบสถานประกอบการ
            </button>
          )}

          {canDelete && initialData && confirmingDelete && (
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
            href={cancelHref}
            className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 inline-flex items-center justify-center px-4 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </div>
    </form>
  );
}

export function ReviewFormClient({
  mode,
  workplaceId,
  initialRating = 5,
  initialComment = "",
  existingImgUrl = null,
}: {
  mode: "create" | "edit";
  workplaceId: number;
  initialRating?: number;
  initialComment?: string;
  existingImgUrl?: string | null;
}) {
  const router = useRouter();
  const [rate, setRate] = useState<number>(initialRating || 5);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    formData.set("rate", String(rate));
    const res =
      mode === "create"
        ? await submitCommentAction(formData)
        : await updateCommentAction(formData);
    setLoading(false);

    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      setStatus({ ok: res.ok, msg: res.message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input type="hidden" name="workplace_id" value={workplaceId} />

      {status && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            status.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <AlertCircle strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          {status.msg}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1.5">
          ให้คะแนนสถานประกอบการ (1–5 ดาว)
        </label>
        <div className="p-3.5 rounded-xl bg-paper-bg border border-line flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRate(star)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
              >
                <Star
                  strokeWidth={1.5}
                  className={`w-6 h-6 transition-colors ${
                    star <= rate
                      ? "text-amber-500 fill-amber-500"
                      : "text-zinc-300 fill-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="font-mono text-xs font-medium text-ink-primary tabular-nums">
            {rate}.0 / 5.0
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          ความคิดเห็น
        </label>
        <textarea
          name="comment"
          rows={4}
          maxLength={250}
          defaultValue={initialComment}
          required
          placeholder="เล่าบรรยากาศการทำงาน พี่เลี้ยง หรือสิ่งที่ได้เรียนรู้ (สูงสุด 250 ตัวอักษร)"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {existingImgUrl && !preview && (
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1">
            รูปภาพปัจจุบัน
          </label>
          <img
            src={existingImgUrl}
            alt="ภาพรีวิวปัจจุบัน"
            className="h-32 rounded-lg border border-line object-cover"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1">
          {mode === "create"
            ? "เพิ่มรูปภาพบรรยากาศฝึกงาน (ไม่บังคับ)"
            : "เปลี่ยนรูปภาพใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"}
        </label>
        <input
          type="file"
          name="img"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreview(URL.createObjectURL(file));
            } else {
              setPreview(null);
            }
          }}
          className="w-full text-xs text-ink-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-line-strong file:text-xs file:font-medium file:bg-paper-muted file:text-ink-primary hover:file:bg-zinc-200"
        />
        {preview && (
          <img
            src={preview}
            alt="ตัวอย่างรูปภาพ"
            className="mt-3 max-h-48 rounded-lg border border-line object-cover"
          />
        )}
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {loading
            ? "กำลังบันทึก..."
            : mode === "create"
            ? "ส่งความคิดเห็น"
            : "บันทึกการแก้ไข"}
        </button>

        <Link
          href="/student/workplace"
          className="py-2.5 px-4 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
