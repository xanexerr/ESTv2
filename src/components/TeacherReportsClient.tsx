"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  Wrench,
  User,
  MessageSquare,
} from "lucide-react";
import { teacherReviewPeriodReportAction } from "@/app/internship-actions";

export interface TeacherDailyLogItem {
  logId: number;
  workDate: string;
  weekNumber: number;
  tasksAssigned: string;
  knowledgeGained: string;
  toolsUsed: string;
  hoursWorked: number;
}

export interface TeacherReportItem {
  reportId: number;
  startWeek: number;
  endWeek: number;
  summaryText: string;
  challenges: string | null;
  status: "draft" | "submitted" | "reviewed" | "needs_revision";
  submittedAt: string | null;
  teacherFeedback: string | null;
  reviewedAt: string | null;
  round: {
    roundId: number;
    roundNumber: number;
    academicYear: string;
    semester: string;
    position: string | null;
    reportCycle: "weekly" | "biweekly";
    workplaceName: string;
    studentId: string;
    studentName: string;
    studentInstitution: string | null;
  };
  dailyLogs: TeacherDailyLogItem[];
}

function splitTools(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatThaiDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: TeacherReportItem["status"] }) {
  switch (status) {
    case "submitted":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          รอตรวจ
        </span>
      );
    case "needs_revision":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          ขอแก้ไข
        </span>
      );
    case "reviewed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          ตรวจแล้ว
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
          ฉบับร่าง
        </span>
      );
  }
}

export function TeacherReportsClient({
  reports,
}: {
  reports: TeacherReportItem[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<
    "all" | "submitted" | "needs_revision" | "reviewed"
  >("all");
  const [selectedId, setSelectedId] = useState<number | null>(
    reports.find((r) => r.status === "submitted")?.reportId ??
      reports[0]?.reportId ??
      null
  );
  const [feedbackInput, setFeedbackInput] = useState<string>(
    () =>
      reports.find(
        (r) =>
          r.reportId ===
          (reports.find((x) => x.status === "submitted")?.reportId ??
            reports[0]?.reportId)
      )?.teacherFeedback || ""
  );
  const [actionMsg, setActionMsg] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    return {
      all: reports.length,
      submitted: reports.filter((r) => r.status === "submitted").length,
      needs_revision: reports.filter((r) => r.status === "needs_revision")
        .length,
      reviewed: reports.filter((r) => r.status === "reviewed").length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const selectedReport =
    filteredReports.find((r) => r.reportId === selectedId) ||
    filteredReports[0] ||
    null;

  function handleSelectReport(rep: TeacherReportItem) {
    setSelectedId(rep.reportId);
    setFeedbackInput(rep.teacherFeedback || "");
    setActionMsg(null);
  }

  function handleDecision(decision: "reviewed" | "needs_revision") {
    if (!selectedReport) return;
    setActionMsg(null);
    const fd = new FormData();
    fd.set("report_id", String(selectedReport.reportId));
    fd.set("decision", decision);
    fd.set("teacher_feedback", feedbackInput);

    startTransition(async () => {
      const res = await teacherReviewPeriodReportAction(fd);
      setActionMsg(res);
      if (res.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header + Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">
            ตรวจรายงานการฝึกงานนักศึกษา
          </h1>
          <p className="text-sm text-ink-muted">
            ตรวจสอบรายงานสรุปรอบ 1–2 สัปดาห์ควบคู่บันทึกการทำงานรายวันของนักศึกษาในความดูแล
          </p>
        </div>

        <div
          role="tablist"
          aria-label="กรองสถานะรายงาน"
          className="inline-flex flex-wrap gap-1.5"
        >
          {(
            [
              { key: "all", label: `ทั้งหมด (${counts.all})` },
              { key: "submitted", label: `รอตรวจ (${counts.submitted})` },
              {
                key: "needs_revision",
                label: `ขอแก้ไข (${counts.needs_revision})`,
              },
              { key: "reviewed", label: `ตรวจแล้ว (${counts.reviewed})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              onClick={() => {
                setFilter(tab.key);
                setActionMsg(null);
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === tab.key
                  ? "bg-brand text-white dark:text-zinc-950 border-brand"
                  : "bg-paper-surface text-ink-secondary border-line-strong hover:text-ink-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-paper-surface border border-line rounded-2xl p-10 text-center text-sm text-ink-muted">
          ไม่มีรายงานในสถานะที่เลือก
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Queue (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            {filteredReports.map((rep) => {
              const isSelected = selectedReport?.reportId === rep.reportId;
              return (
                <button
                  key={rep.reportId}
                  type="button"
                  onClick={() => handleSelectReport(rep)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors space-y-2 ${
                    isSelected
                      ? "bg-paper-surface border-brand ring-1 ring-brand/30"
                      : "bg-paper-surface border-line hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-primary truncate">
                      {rep.round.studentName}
                    </span>
                    <StatusBadge status={rep.status} />
                  </div>
                  <div className="text-xs text-ink-secondary truncate">
                    {rep.round.workplaceName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
                    <span>
                      รอบ {rep.round.roundNumber} • สัปดาห์{" "}
                      {rep.startWeek === rep.endWeek
                        ? rep.startWeek
                        : `${rep.startWeek}–${rep.endWeek}`}
                    </span>
                    <span>{formatThaiDate(rep.submittedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail & Review Panel (8 cols) */}
          {selectedReport && (
            <div className="lg:col-span-8 bg-paper-surface border border-line rounded-2xl overflow-hidden">
              {/* Student & Round Header */}
              <div className="p-5 border-b border-line space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-paper-muted text-ink-primary tabular-nums">
                      รอบที่ {selectedReport.round.roundNumber}
                    </span>
                    <h2 className="text-base font-semibold text-ink-primary">
                      รายงานสรุปสัปดาห์ที่{" "}
                      {selectedReport.startWeek === selectedReport.endWeek
                        ? selectedReport.startWeek
                        : `${selectedReport.startWeek}–${selectedReport.endWeek}`}
                    </h2>
                    <StatusBadge status={selectedReport.status} />
                  </div>
                  <span className="text-xs text-ink-muted tabular-nums">
                    ส่งเมื่อ {formatThaiDate(selectedReport.submittedAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                    <strong className="font-medium text-ink-primary">
                      {selectedReport.round.studentName}
                    </strong>{" "}
                    ({selectedReport.round.studentId})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                    {selectedReport.round.workplaceName}
                    {selectedReport.round.position
                      ? ` • ${selectedReport.round.position}`
                      : ""}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Summary & Challenges */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
                      สรุปรวมประจำรอบสัปดาห์
                    </h3>
                    <div className="p-4 rounded-xl bg-paper-bg border border-line text-sm text-ink-primary whitespace-pre-line leading-relaxed">
                      {selectedReport.summaryText}
                    </div>
                  </div>

                  {selectedReport.challenges && (
                    <div>
                      <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5">
                        ปัญหา / ข้อปรึกษาจากนักศึกษา
                      </h3>
                      <div className="p-3.5 rounded-xl bg-paper-bg border border-line text-sm text-ink-secondary whitespace-pre-line">
                        {selectedReport.challenges}
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Logs in this Period */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wide inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      บันทึกการทำงานรายวันในช่วงนี้ ({selectedReport.dailyLogs.length} วัน)
                    </h3>
                    <span className="text-xs text-ink-muted tabular-nums">
                      รวม{" "}
                      {selectedReport.dailyLogs.reduce(
                        (s, l) => s + l.hoursWorked,
                        0
                      )}{" "}
                      ชั่วโมง
                    </span>
                  </div>

                  {selectedReport.dailyLogs.length === 0 ? (
                    <div className="p-4 rounded-xl bg-paper-bg border border-line text-xs text-ink-muted">
                      ไม่มีบันทึกประจำวันในช่วงสัปดาห์นี้
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedReport.dailyLogs.map((log) => {
                        const tags = splitTools(log.toolsUsed);
                        return (
                          <div
                            key={log.logId}
                            className="p-3.5 rounded-xl bg-paper-bg border border-line space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-ink-primary tabular-nums">
                                {formatThaiDate(log.workDate)} (สัปดาห์{" "}
                                {log.weekNumber})
                              </span>
                              <span className="text-ink-muted tabular-nums">
                                {log.hoursWorked} ชม.
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-ink-muted">งานที่ได้รับ: </span>
                                <span className="text-ink-primary">
                                  {log.tasksAssigned}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-muted">ความรู้ที่ได้: </span>
                                <span className="text-ink-secondary">
                                  {log.knowledgeGained}
                                </span>
                              </div>
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                <Wrench
                                  className="w-3 h-3 text-ink-muted"
                                  aria-hidden="true"
                                />
                                {tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[11px] px-2 py-0.5 rounded bg-paper-muted text-ink-secondary"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <div className="pt-4 border-t border-line space-y-3">
                  <label
                    htmlFor="teacher_feedback"
                    className="text-xs font-semibold text-ink-primary inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                    ข้อเสนอแนะจากอาจารย์ที่ปรึกษา
                  </label>
                  <textarea
                    id="teacher_feedback"
                    rows={3}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="พิมพ์คำแนะนำ ชื่นชม หรือสิ่งที่ต้องการให้นักศึกษาแก้ไขเพิ่มเติม..."
                    className="w-full px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />

                  {actionMsg && (
                    <div
                      role="status"
                      className={`px-3.5 py-2.5 rounded-xl text-xs border ${
                        actionMsg.ok
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
                          : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
                      }`}
                    >
                      {actionMsg.message}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDecision("needs_revision")}
                      className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium border border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 disabled:opacity-60 transition-colors"
                    >
                      ส่งกลับแก้ไข
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDecision("reviewed")}
                      className="min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 inline-flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      {isPending ? "กำลังบันทึก..." : "รับทราบ / ตรวจผ่าน"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
