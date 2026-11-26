"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { AlertCircle, CheckCircle2, Upload, Hash } from "lucide-react";

export interface UniversityTreeItem {
  universityId: number;
  code: string;
  name: string;
  shortName: string;
  faculties: {
    facultyId: number;
    code: string;
    name: string;
    majors: {
      majorId: number;
      code: string;
      name: string;
    }[];
  }[];
}

export function RegisterFormClient({
  universities,
}: {
  universities: UniversityTreeItem[];
}) {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [academicYear, setAcademicYear] = useState("2569");
  const [selectedUniId, setSelectedUniId] = useState<string>(
    universities[0] ? String(universities[0].universityId) : ""
  );

  const selectedUni = useMemo(
    () => universities.find((u) => String(u.universityId) === selectedUniId) || null,
    [universities, selectedUniId]
  );

  const [selectedFacId, setSelectedFacId] = useState<string>(
    universities[0]?.faculties[0]
      ? String(universities[0].faculties[0].facultyId)
      : ""
  );

  const selectedFac = useMemo(
    () =>
      selectedUni?.faculties.find(
        (f) => String(f.facultyId) === selectedFacId
      ) || null,
    [selectedUni, selectedFacId]
  );

  const [selectedMajorId, setSelectedMajorId] = useState<string>(
    universities[0]?.faculties[0]?.majors[0]
      ? String(universities[0].faculties[0].majors[0].majorId)
      : ""
  );

  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const yy = academicYear.slice(-2);
  const uu = selectedUni ? selectedUni.code.padStart(2, "0") : "00";
  const ff = selectedFac ? selectedFac.code.padStart(2, "0") : "00";

  function handleUniChange(newUniId: string) {
    setSelectedUniId(newUniId);
    const uni = universities.find((u) => String(u.universityId) === newUniId);
    const firstFac = uni?.faculties[0];
    setSelectedFacId(firstFac ? String(firstFac.facultyId) : "");
    setSelectedMajorId(
      firstFac?.majors[0] ? String(firstFac.majors[0].majorId) : ""
    );
  }

  function handleFacChange(newFacId: string) {
    setSelectedFacId(newFacId);
    const fac = selectedUni?.faculties.find(
      (f) => String(f.facultyId) === newFacId
    );
    setSelectedMajorId(fac?.majors[0] ? String(fac.majors[0].majorId) : "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    formData.set("role", role);
    const res = await registerAction(formData);
    setLoading(false);
    setResult(res);
  }

  const inputClass =
    "w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="max-w-2xl mx-auto my-2">
      <div className="bg-paper-surface rounded-xl border border-line overflow-hidden">
        <div className="p-5 border-b border-line flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-ink-primary">
              สมัครสมาชิก EST
            </h1>
            <p className="text-xs text-ink-secondary mt-0.5">
              เลือกมหาวิทยาลัย คณะ และแนบหลักฐานสถานภาพ ระบบจะสร้างรหัสผู้ใช้ 10 หลักให้อัตโนมัติ
            </p>
          </div>
          <Link
            href="/login"
            className="text-xs font-medium text-brand hover:underline flex-shrink-0"
          >
            มีบัญชีแล้ว? เข้าสู่ระบบ
          </Link>
        </div>

        {result?.ok ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2
                strokeWidth={1.5}
                className="w-5 h-5 flex-shrink-0 mt-0.5"
              />
              <div className="space-y-1 text-sm">
                <div className="font-semibold">ส่งคำขอสมัครสมาชิกสำเร็จ</div>
                <p className="text-xs leading-relaxed">{result.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
              >
                ไปหน้าเข้าสู่ระบบ
              </Link>
              <Link
                href="/"
                className="px-4 py-2 rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
              >
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {result && !result.ok && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle
                  strokeWidth={1.5}
                  className="w-4 h-4 flex-shrink-0"
                />
                {result.message}
              </div>
            )}

            {/* Live 10-Digit User Code Preview */}
            <div className="p-3.5 rounded-xl bg-paper-bg border border-line flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-ink-secondary">
                <Hash className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
                <span>รูปแบบรหัสผู้ใช้ที่จะได้รับ (10 หลัก):</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-semibold tabular-nums">
                <span className="px-1.5 py-0.5 rounded bg-brand-subtle text-brand" title="ปี พ.ศ. 2 หลัก">
                  {yy}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300" title="รหัสมหาวิทยาลัย 2 หลัก">
                  {uu}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300" title="รหัสคณะ 2 หลัก">
                  {ff}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-paper-muted text-ink-muted" title="เลขลำดับอัตโนมัติ 4 หลัก">
                  XXXX
                </span>
              </div>
            </div>

            {/* Role Toggle */}
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1.5">
                บทบาทผู้ใช้งาน
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`min-h-[44px] sm:min-h-0 sm:h-10 rounded-lg text-sm font-medium border transition-colors ${
                    role === "student"
                      ? "bg-brand text-white dark:text-zinc-950 border-brand"
                      : "bg-paper-bg text-ink-secondary border-line-strong hover:text-ink-primary"
                  }`}
                >
                  นักศึกษา
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`min-h-[44px] sm:min-h-0 sm:h-10 rounded-lg text-sm font-medium border transition-colors ${
                    role === "teacher"
                      ? "bg-brand text-white dark:text-zinc-950 border-brand"
                      : "bg-paper-bg text-ink-secondary border-line-strong hover:text-ink-primary"
                  }`}
                >
                  อาจารย์
                </button>
              </div>
            </div>

            {/* Normalized University -> Faculty -> Major */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="reg_university"
                  className="block text-xs font-medium text-ink-secondary mb-1"
                >
                  มหาวิทยาลัย <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg_university"
                  name="university_id"
                  required
                  value={selectedUniId}
                  onChange={(e) => handleUniChange(e.target.value)}
                  className={inputClass}
                >
                  {universities.map((u) => (
                    <option key={u.universityId} value={u.universityId}>
                      [{u.code}] {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reg_faculty"
                  className="block text-xs font-medium text-ink-secondary mb-1"
                >
                  คณะ <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg_faculty"
                  name="faculty_id"
                  required
                  value={selectedFacId}
                  onChange={(e) => handleFacChange(e.target.value)}
                  className={inputClass}
                >
                  {(selectedUni?.faculties || []).map((f) => (
                    <option key={f.facultyId} value={f.facultyId}>
                      [{f.code}] {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label
                  htmlFor="reg_major"
                  className="block text-xs font-medium text-ink-secondary mb-1"
                >
                  สาขาวิชา
                </label>
                <select
                  id="reg_major"
                  name="major_id"
                  value={selectedMajorId}
                  onChange={(e) => setSelectedMajorId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- ไม่ระบุ / อื่นๆ --</option>
                  {(selectedFac?.majors || []).map((m) => (
                    <option key={m.majorId} value={m.majorId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="reg_year"
                  className="block text-xs font-medium text-ink-secondary mb-1"
                >
                  ปีการศึกษา (พ.ศ.)
                </label>
                <select
                  id="reg_year"
                  name="academic_year"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={inputClass}
                >
                  <option value="2569">2569</option>
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                  <option value="2570">2570</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="reg_tel"
                  className="block text-xs font-medium text-ink-secondary mb-1"
                >
                  เบอร์โทรศัพท์
                </label>
                <input
                  id="reg_tel"
                  type="text"
                  name="user_tel"
                  required
                  placeholder="08xxxxxxxx"
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  ชื่อ
                </label>
                <input
                  type="text"
                  name="user_fname"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  นามสกุล
                </label>
                <input
                  type="text"
                  name="user_lname"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={4}
                  placeholder="กำหนดรหัสผ่าน"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Evidence File Upload */}
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                หลักฐานการเรียน / การทำงานในปีการศึกษาปัจจุบันหรือใกล้เคียง
              </label>
              <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-dashed border-line-strong bg-paper-bg hover:bg-paper-muted/60 cursor-pointer transition-colors">
                <Upload
                  strokeWidth={1.5}
                  className="w-5 h-5 text-ink-muted"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-ink-primary">
                  {fileName || "คลิกเพื่อเลือกไฟล์หลักฐาน (JPG, PNG หรือ PDF)"}
                </span>
                <input
                  type="file"
                  name="evidence"
                  required
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name || "")
                  }
                  className="sr-only"
                />
              </label>
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white dark:text-zinc-950 font-medium text-sm transition-colors"
              >
                {loading ? "กำลังส่งคำขอ..." : "ส่งคำขอสมัครสมาชิก"}
              </button>
              <Link
                href="/"
                className="min-h-[44px] sm:min-h-0 sm:h-10 px-4 inline-flex items-center justify-center rounded-lg border border-line-strong text-ink-secondary hover:text-ink-primary text-sm font-medium transition-colors"
              >
                ยกเลิก
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
