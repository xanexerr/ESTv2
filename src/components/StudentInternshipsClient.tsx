"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  Repeat,
} from "lucide-react";
import {
  createInternshipRoundAction,
  updateInternshipRoundStatusAction,
} from "@/app/internship-actions";

export interface RoundSummaryItem {
  roundId: number;
  roundNumber: number;
  academicYear: string;
  semester: string;
  position: string | null;
  startDate: string;
  endDate: string | null;
  reportCycle: "weekly" | "biweekly";
  status: "active" | "completed" | "cancelled";
  workplace: {
    workplaceId: number;
    workplaceName: string;
    workType: string;
  };
  advisor: {
    userId: string;
    userFname: string;
    userLname: string;
  } | null;
  logCount: number;
  reportCount: number;
}

export interface WorkplaceOption {
  workplaceId: number;
  workplaceName: string;
  workType: string;
}

export interface AdvisorOption {
  userId: string;
  userFname: string;
  userLname: string;
  institution: string | null;
}

const SEMESTER_LABELS: Record<string, string> = {
  "1": "ภาคเรียนที่ 1",
  "2": "ภาคเรียนที่ 2",
  summer: "ภาคฤดูร้อน",
};

function formatThaiDate(iso: string | null) {
  if (!iso) return "ไม่ระบุ";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: RoundSummaryItem["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        กำลังฝึกงาน
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        เสร็จสิ้นแล้ว
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
      ยกเลิก
    </span>
  );
}

export function StudentInternshipsClient({
  rounds,
  workplaces,
  advisors,
  defaultAcademicYear,
}: {
  rounds: RoundSummaryItem[];
  workplaces: WorkplaceOption[];
  advisors: AdvisorOption[];
  defaultAcademicYear: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(rounds.length === 0);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );
  const [confirmCompleteId, setConfirmCompleteId] = useState<number | null>(null);
  const [selectedWpId, setSelectedWpId] = useState<string>(
    workplaces[0] ? String(workplaces[0].workplaceId) : ""
  );

  const visitedWorkplaceIds = new Set(rounds.map((r) => r.workplace.workplaceId));
  const isRepeatWorkplace =
    selectedWpId !== "" && visitedWorkplaceIds.has(Number(selectedWpId));
  const hasActiveRound = rounds.some((r) => r.status === "active");

  const todayIso = new Date().toISOString().slice(0, 10);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createInternshipRoundAction(formData);
      setFeedback(res);
      if (res.ok) {
        setShowForm(false);
        router.refresh();
      }
    });
  }

  function handleStatusChange(
    roundId: number,
    nextStatus: "active" | "completed" | "cancelled"
  ) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateInternshipRoundStatusAction(roundId, nextStatus);
      setFeedback(res);
      setConfirmCompleteId(null);
      if (res.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">
            รอบการฝึกงานของฉัน
          </h1>
          <p className="text-sm text-ink-muted">
            จัดการประวัติการฝึกงานหลายรอบ (ที่เดิมหรือที่ใหม่) และสลับเข้าสมุดบันทึกงานแต่ละรอบ
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setFeedback(null);
          }}
          className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 inline-flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {showForm ? "ซ่อนฟอร์ม" : "เริ่มรอบฝึกงานใหม่"}
        </button>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`px-4 py-3 rounded-xl text-sm border ${
            feedback.ok
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* New Internship Round Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-paper-surface border border-line rounded-2xl p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
            <h2 className="text-base font-semibold text-ink-primary">
              เปิดรอบการฝึกงานใหม่ (รอบที่{" "}
              {rounds.reduce((m, r) => Math.max(m, r.roundNumber), 0) + 1})
            </h2>
            {hasActiveRound && (
              <span className="text-xs text-ink-muted">
                รอบที่กำลังฝึกงานอยู่จะถูกปิดเป็น &ldquo;เสร็จสิ้นแล้ว&rdquo; อัตโนมัติ
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="workplace_id"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                สถานประกอบการ <span className="text-red-500">*</span>
              </label>
              <select
                id="workplace_id"
                name="workplace_id"
                required
                value={selectedWpId}
                onChange={(e) => setSelectedWpId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {workplaces.map((wp) => (
                  <option key={wp.workplaceId} value={wp.workplaceId}>
                    {wp.workplaceName} ({wp.workType})
                    {visitedWorkplaceIds.has(wp.workplaceId)
                      ? " — เคยฝึกงานที่นี่แล้ว"
                      : ""}
                  </option>
                ))}
              </select>
              {isRepeatWorkplace && (
                <p className="mt-1.5 text-xs text-brand inline-flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
                  ฝึกงานซ้ำที่สถานประกอบการเดิม — ระบบจะแยกรอบและสมุดบันทึกออกจากรอบก่อนหน้าให้อัตโนมัติ
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="advisor_id"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                อาจารย์ที่ปรึกษาประจำรอบ
              </label>
              <select
                id="advisor_id"
                name="advisor_id"
                defaultValue={advisors[0]?.userId || ""}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">-- ยังไม่ระบุอาจารย์ที่ปรึกษา --</option>
                {advisors.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {`${t.userFname} ${t.userLname}`.trim()}
                    {t.institution ? ` (${t.institution})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="position"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                ตำแหน่ง / หน้าที่ฝึกงาน
              </label>
              <input
                id="position"
                name="position"
                type="text"
                placeholder="เช่น Full-Stack Intern, UX/UI Intern"
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div>
              <label
                htmlFor="academic_year"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                ปีการศึกษา <span className="text-red-500">*</span>
              </label>
              <input
                id="academic_year"
                name="academic_year"
                type="text"
                required
                defaultValue={defaultAcademicYear || "2569"}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div>
              <label
                htmlFor="semester"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                ภาคเรียน <span className="text-red-500">*</span>
              </label>
              <select
                id="semester"
                name="semester"
                required
                defaultValue="1"
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="summer">ภาคฤดูร้อน</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="start_date"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                วันเริ่มฝึกงาน <span className="text-red-500">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={todayIso}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div>
              <label
                htmlFor="end_date"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                วันสิ้นสุดฝึกงาน (ถ้าทราบ)
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div className="md:col-span-2">
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                รอบการส่งรายงานสรุปให้อาจารย์
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-line-strong bg-paper-bg cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    name="report_cycle"
                    value="weekly"
                    defaultChecked
                    className="accent-[var(--brand)]"
                  />
                  <div>
                    <div className="text-sm font-medium text-ink-primary">
                      ทุก 1 สัปดาห์ (Weekly)
                    </div>
                    <div className="text-xs text-ink-muted">
                      สรุปรวมส่งอาจารย์ทุกสิ้นสัปดาห์
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-line-strong bg-paper-bg cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    name="report_cycle"
                    value="biweekly"
                    className="accent-[var(--brand)]"
                  />
                  <div>
                    <div className="text-sm font-medium text-ink-primary">
                      ทุก 2 สัปดาห์ (Bi-weekly)
                    </div>
                    <div className="text-xs text-ink-muted">
                      สรุปรวม 2 สัปดาห์ส่งอาจารย์ครั้งละ 1 ฉบับ
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium border border-line-strong text-ink-secondary hover:text-ink-primary transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 disabled:opacity-60 transition-colors"
            >
              {isPending ? "กำลังบันทึก..." : "ยืนยันเริ่มรอบฝึกงาน"}
            </button>
          </div>
        </form>
      )}

      {/* Rounds List */}
      {rounds.length === 0 ? (
        <div className="bg-paper-surface border border-line rounded-2xl p-8 text-center">
          <p className="text-sm text-ink-secondary mb-3">
            ยังไม่มีประวัติรอบการฝึกงาน เริ่มสร้างรอบแรกเพื่อใช้งานสมุดบันทึกประจำวัน
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white dark:text-zinc-950"
          >
            เริ่มรอบฝึกงานแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rounds.map((r) => (
            <div
              key={r.roundId}
              className={`bg-paper-surface border rounded-2xl p-5 transition-colors ${
                r.status === "active"
                  ? "border-brand/50"
                  : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-line">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-paper-muted text-ink-primary tabular-nums">
                      รอบที่ {r.roundNumber}
                    </span>
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-ink-muted tabular-nums">
                      ปีการศึกษา {r.academicYear} •{" "}
                      {SEMESTER_LABELS[r.semester] || r.semester}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-paper-muted text-ink-secondary">
                      ส่งรายงานทุก {r.reportCycle === "biweekly" ? "2 สัปดาห์" : "1 สัปดาห์"}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-ink-primary flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
                    <Link
                      href={`/workplaces/${r.workplace.workplaceId}`}
                      className="hover:underline"
                    >
                      {r.workplace.workplaceName}
                    </Link>
                  </h2>
                  {r.position && (
                    <p className="text-sm text-ink-secondary">
                      ตำแหน่ง: {r.position}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/student/logbook?round=${r.roundId}`}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    {r.status === "active" ? "บันทึกงาน / ส่งรายงาน" : "ดูบันทึกย้อนหลัง"}
                  </Link>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                    {formatThaiDate(r.startDate)} – {formatThaiDate(r.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                    อาจารย์ที่ปรึกษา:{" "}
                    <strong className="font-medium text-ink-primary">
                      {r.advisor
                        ? `${r.advisor.userFname} ${r.advisor.userLname}`.trim()
                        : "ยังไม่ระบุ"}
                    </strong>
                  </span>
                  <span className="tabular-nums">
                    บันทึกประจำวัน{" "}
                    <strong className="text-ink-primary">{r.logCount}</strong> วัน •
                    รายงานสรุป{" "}
                    <strong className="text-ink-primary">{r.reportCount}</strong> ฉบับ
                  </span>
                </div>

                {/* Inline two-step status action */}
                <div className="flex items-center gap-2">
                  {r.status === "active" &&
                    (confirmCompleteId === r.roundId ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-ink-muted">ยืนยันปิดรอบนี้?</span>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusChange(r.roundId, "completed")}
                          className="min-h-[36px] px-2.5 py-1 rounded-md text-xs font-medium bg-sky-600 text-white hover:bg-sky-700"
                        >
                          ยืนยันเสร็จสิ้น
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCompleteId(null)}
                          className="min-h-[36px] px-2 py-1 rounded-md text-xs text-ink-muted hover:text-ink-primary"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmCompleteId(r.roundId)}
                        className="min-h-[36px] px-2.5 py-1 rounded-md text-xs font-medium border border-line-strong text-ink-secondary hover:text-ink-primary transition-colors"
                      >
                        ปิดรอบเป็นเสร็จสิ้น
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
