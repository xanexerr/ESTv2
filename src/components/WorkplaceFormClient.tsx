"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WORK_TYPES } from "@/lib/constants";
import {
  createWorkplaceAction,
  updateWorkplaceAction,
  deleteWorkplaceAction,
  toggleWorkplaceVisibilityAction,
  submitCommentAction,
  updateCommentAction,
} from "@/app/actions";
import {
  Save,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Send,
  AlertCircle,
  CheckCircle2,
  PenSquare,
} from "lucide-react";

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
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสถานประกอบการนี้?")) return;
    setLoading(true);
    const res = await deleteWorkplaceAction(initialData.workplaceId);
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

      {canToggleShow && initialData && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              สถานะการแสดงผลปัจจุบัน
            </div>
            {initialData.show ? (
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Eye className="w-3.5 h-3.5" /> กำลังแสดงผลบนเว็บไซต์
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                <EyeOff className="w-3.5 h-3.5" /> ซ่อน / ไม่แสดงผล
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleToggleShow}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition ${
              initialData.show
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {initialData.show ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> คลิกเพื่อซ่อนสถานประกอบการ
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> คลิกเพื่อเปิดแสดงผล
              </>
            )}
          </button>
        </div>
      )}

      {mode === "edit" && initialData && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            รหัสสถานประกอบการ
          </label>
          <input
            type="text"
            name="workplace_id"
            value={initialData.workplaceId}
            readOnly
            className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-100 border border-slate-200 text-red-600 font-semibold"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ชื่อบริษัท / สถานประกอบการ
        </label>
        <input
          type="text"
          name="workplace_name"
          defaultValue={initialData?.workplaceName || ""}
          required
          placeholder="ระบุชื่อบริษัทหรือหน่วยงาน"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ประเภทงาน
          </label>
          <select
            name="work_type"
            defaultValue={initialData?.workType || "เขียนโปรแกรม"}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-ssp-primary"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            เบอร์โทรติดต่อ
          </label>
          <input
            type="text"
            name="work_tel"
            defaultValue={initialData?.workTel || ""}
            required
            placeholder="เช่น 074123456 หรือ 0812345678"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ลักษณะงาน
        </label>
        <input
          type="text"
          name="description"
          defaultValue={initialData?.description || ""}
          required
          placeholder="อธิบายลักษณะงานที่ปฏิบัติโดยสังเขป"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ที่อยู่สถานประกอบการ
        </label>
        <textarea
          name="workplace_address"
          rows={3}
          defaultValue={initialData?.workplaceAddress || ""}
          required
          placeholder="ระบุบ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ลิงก์แผนที่ (Google Maps URL)
        </label>
        <input
          type="text"
          name="map"
          defaultValue={initialData?.map || ""}
          placeholder="https://maps.google.com/..."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark disabled:opacity-60 text-white font-semibold text-sm transition"
        >
          <Save className="w-4 h-4" />
          {loading
            ? "กำลังบันทึก..."
            : mode === "create"
            ? "เพิ่มสถานประกอบการ"
            : "บันทึกการเปลี่ยนแปลง"}
        </button>

        {extraFooter}

        {canDelete && initialData && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition"
          >
            <Trash2 className="w-4 h-4" /> ลบสถานประกอบการ
          </button>
        )}

        <Link
          href={cancelHref}
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
        >
          ยกเลิก
        </Link>
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
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            status.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {status.msg}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          ให้คะแนนสถานประกอบการ (1 - 5 ดาว)
        </label>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRate(star)}
                className="focus:outline-none transition transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rate
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300 fill-slate-100"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="px-3 py-1 rounded-full bg-ssp-amber text-slate-900 font-bold text-xs">
            {rate} ดาว
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          ความคิดเห็น / รีวิวการฝึกงาน :
        </label>
        <textarea
          name="comment"
          rows={4}
          maxLength={250}
          defaultValue={initialComment}
          required
          placeholder="เล่าบรรยากาศการทำงาน พี่เลี้ยง หรือสิ่งที่ได้เรียนรู้ (สูงสุด 250 ตัวอักษร)"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-ssp-primary"
        />
      </div>

      {existingImgUrl && !preview && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            รูปภาพปัจจุบัน :
          </label>
          <img
            src={existingImgUrl}
            alt="Current review"
            className="h-32 rounded-xl border border-slate-200 object-cover"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
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
          className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ssp-light file:text-ssp-primary hover:file:bg-ssp-primary/20"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 max-h-48 rounded-xl border border-slate-200 object-cover"
          />
        )}
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ssp-primary hover:bg-ssp-dark disabled:opacity-60 text-white font-semibold text-sm transition"
        >
          {mode === "create" ? (
            <>
              <Send className="w-4 h-4" /> ยืนยันการส่งความคิดเห็น
            </>
          ) : (
            <>
              <PenSquare className="w-4 h-4" /> บันทึกการแก้ไขความคิดเห็น
            </>
          )}
        </button>

        <Link
          href="/student/workplace"
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
