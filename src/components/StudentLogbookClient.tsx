"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  Wrench,
  Sparkles,
  X,
  Building2,
  UserCheck,
  FileEdit,
} from "lucide-react";
import {
  upsertDailyLogAction,
  deleteDailyLogAction,
  savePeriodReportAction,
} from "@/app/internship-actions";

export interface LogbookRound {
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
}

export interface DailyLogItem {
  logId: number;
  roundId: number;
  workDate: string; // YYYY-MM-DD
  weekNumber: number;
  tasksAssigned: string;
  knowledgeGained: string;
  toolsUsed: string;
  hoursWorked: number;
}

export interface PeriodReportItem {
  reportId: number;
  roundId: number;
  startWeek: number;
  endWeek: number;
  summaryText: string;
  challenges: string | null;
  status: "draft" | "submitted" | "reviewed" | "needs_revision";
  submittedAt: string | null;
  teacherFeedback: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

function splitTools(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatThaiDate(iso: string) {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return d.toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReportStatusBadge({ status }: { status: PeriodReportItem["status"] }) {
  switch (status) {
    case "reviewed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          อาจารย์ตรวจแล้ว
        </span>
      );
    case "submitted":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          ส่งแล้ว • รอตรวจ
        </span>
      );
    case "needs_revision":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          ขอให้แก้ไขเพิ่มเติม
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
          <FileEdit className="w-3.5 h-3.5" aria-hidden="true" />
          ฉบับร่าง
        </span>
      );
  }
}

export function StudentLogbookClient({
  rounds,
  selectedRound,
  dailyLogs,
  periodReports,
}: {
  rounds: LogbookRound[];
  selectedRound: LogbookRound;
  dailyLogs: DailyLogItem[];
  periodReports: PeriodReportItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"daily" | "reports">("daily");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  // Daily Log Form State
  const todayIso = new Date().toISOString().slice(0, 10);
  const [workDate, setWorkDate] = useState(todayIso);
  const [hoursWorked, setHoursWorked] = useState("8");
  const [tasksAssigned, setTasksAssigned] = useState("");
  const [knowledgeGained, setKnowledgeGained] = useState("");
  const [toolTags, setToolTags] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Period Report Form State
  const defaultSpan = selectedRound.reportCycle === "biweekly" ? 2 : 1;
  const maxWeekInLogs = dailyLogs.reduce(
    (m, l) => Math.max(m, l.weekNumber),
    1
  );
  const [startWeek, setStartWeek] = useState<number>(
    Math.max(1, maxWeekInLogs - (defaultSpan - 1))
  );
  const [endWeek, setEndWeek] = useState<number>(maxWeekInLogs);
  const [summaryText, setSummaryText] = useState("");
  const [challenges, setChallenges] = useState("");

  const isReadOnly = selectedRound.status !== "active";

  // Group daily logs by weekNumber descending
  const logsByWeek = useMemo(() => {
    const map = new Map<number, DailyLogItem[]>();
    for (const log of dailyLogs) {
      const arr = map.get(log.weekNumber) || [];
      arr.push(log);
      map.set(log.weekNumber, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [dailyLogs]);

  // All unique tools used in this round (for sidebar & quick-add suggestions)
  const roundTools = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of dailyLogs) {
      for (const t of splitTools(log.toolsUsed)) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [dailyLogs]);

  const totalHours = useMemo(
    () => dailyLogs.reduce((sum, l) => sum + l.hoursWorked, 0),
    [dailyLogs]
  );

  // Auto-aggregated daily logs for the selected report week range
  const rangeLogs = useMemo(
    () =>
      dailyLogs
        .filter((l) => l.weekNumber >= startWeek && l.weekNumber <= endWeek)
        .sort((a, b) => a.workDate.localeCompare(b.workDate)),
    [dailyLogs, startWeek, endWeek]
  );

  const rangeTools = useMemo(() => {
    const set = new Set<string>();
    for (const l of rangeLogs) {
      for (const t of splitTools(l.toolsUsed)) set.add(t);
    }
    return Array.from(set);
  }, [rangeLogs]);

  const rangeHours = useMemo(
    () => rangeLogs.reduce((s, l) => s + l.hoursWorked, 0),
    [rangeLogs]
  );

  function addToolTag(value: string) {
    const clean = value.trim();
    if (!clean) return;
    if (!toolTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setToolTags((prev) => [...prev, clean]);
    }
    setToolInput("");
  }

  function removeToolTag(tag: string) {
    setToolTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleLoadLogForEdit(log: DailyLogItem) {
    setWorkDate(log.workDate);
    setHoursWorked(String(log.hoursWorked));
    setTasksAssigned(log.tasksAssigned);
    setKnowledgeGained(log.knowledgeGained);
    setToolTags(splitTools(log.toolsUsed));
    setToolInput("");
    setActiveTab("daily");
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSaveDailyLog(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const mergedTags = toolInput.trim()
      ? [...toolTags, toolInput.trim()]
      : toolTags;
    const fd = new FormData();
    fd.set("round_id", String(selectedRound.roundId));
    fd.set("work_date", workDate);
    fd.set("hours_worked", hoursWorked);
    fd.set("tasks_assigned", tasksAssigned);
    fd.set("knowledge_gained", knowledgeGained);
    fd.set("tools_used", mergedTags.join(", "));

    startTransition(async () => {
      const res = await upsertDailyLogAction(fd);
      setFeedback(res);
      if (res.ok) {
        setTasksAssigned("");
        setKnowledgeGained("");
        setToolTags([]);
        setToolInput("");
        router.refresh();
      }
    });
  }

  function handleDeleteDailyLog(logId: number) {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteDailyLogAction(logId);
      setFeedback(res);
      setConfirmDeleteId(null);
      if (res.ok) router.refresh();
    });
  }

  function handleLoadReportForEdit(rep: PeriodReportItem) {
    setStartWeek(rep.startWeek);
    setEndWeek(rep.endWeek);
    setSummaryText(rep.summaryText);
    setChallenges(rep.challenges || "");
    setActiveTab("reports");
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSaveReport(intent: "draft" | "submitted") {
    setFeedback(null);
    const fd = new FormData();
    fd.set("round_id", String(selectedRound.roundId));
    fd.set("start_week", String(startWeek));
    fd.set("end_week", String(endWeek));
    fd.set("summary_text", summaryText);
    fd.set("challenges", challenges);
    fd.set("intent", intent);

    startTransition(async () => {
      const res = await savePeriodReportAction(fd);
      setFeedback(res);
      if (res.ok) {
        if (intent === "submitted") {
          setSummaryText("");
          setChallenges("");
        }
        router.refresh();
      }
    });
  }

  function handleAutoFillDraft() {
    if (rangeLogs.length === 0) return;
    const bullets = rangeLogs.map(
      (l) => `- (${l.workDate}) ${l.tasksAssigned}`
    );
    const toolsLine =
      rangeTools.length > 0
        ? `\nเครื่องมือที่ใช้หลักๆ: ${rangeTools.join(", ")}`
        : "";
    setSummaryText(
      `สรุปการทำงานสัปดาห์ที่ ${startWeek === endWeek ? startWeek : `${startWeek}–${endWeek}`} (${rangeLogs.length} วัน, ${rangeHours} ชม.):\n${bullets.join("\n")}${toolsLine}`
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Bar: Title + Round Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">
            สมุดบันทึกการทำงานและรายงานสรุป
          </h1>
          <p className="text-sm text-ink-muted">
            บันทึกงานรายวัน ความรู้ และเครื่องมือที่ใช้ เพื่อสรุปส่งอาจารย์ทุก{" "}
            {selectedRound.reportCycle === "biweekly" ? "2 สัปดาห์" : "1 สัปดาห์"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="round_switcher" className="sr-only">
            สลับรอบการฝึกงาน
          </label>
          <select
            id="round_switcher"
            value={selectedRound.roundId}
            onChange={(e) =>
              router.push(`/student/logbook?round=${e.target.value}`)
            }
            className="min-h-[44px] px-3 py-2 rounded-lg bg-paper-surface border border-line-strong text-sm font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {rounds.map((r) => (
              <option key={r.roundId} value={r.roundId}>
                รอบที่ {r.roundNumber} ({r.academicYear}/{r.semester}) —{" "}
                {r.workplace.workplaceName}
                {r.status === "active" ? " [กำลังฝึก]" : " [เสร็จสิ้น]"}
              </option>
            ))}
          </select>
          <Link
            href="/student/internships"
            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-line-strong text-sm font-medium text-ink-secondary hover:text-ink-primary inline-flex items-center transition-colors"
          >
            จัดการรอบฝึกงาน
          </Link>
        </div>
      </div>

      {/* Read-Only Notice for Completed Round */}
      {isReadOnly && (
        <div className="px-4 py-3 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800 text-sm">
          คุณกำลังดูประวัติ <strong>รอบที่ {selectedRound.roundNumber}</strong> ที่ปิดรอบไปแล้ว (โหมดอ่านอย่างเดียว)
        </div>
      )}

      {/* Feedback Banner */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="มุมมองสมุดบันทึก"
            className="inline-flex p-1 rounded-xl bg-paper-muted border border-line w-full sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "daily"}
              onClick={() => setActiveTab("daily")}
              className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-1.5 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "daily"
                  ? "bg-paper-surface text-ink-primary shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              บันทึกประจำวัน ({dailyLogs.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
              className={`flex-1 sm:flex-initial min-h-[40px] px-4 py-1.5 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "reports"
                  ? "bg-paper-surface text-ink-primary shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              รายงานสรุปรอบส่ง ({periodReports.length})
            </button>
          </div>

          {/* TAB 1: DAILY LOGS */}
          {activeTab === "daily" && (
            <div className="space-y-5">
              {!isReadOnly && (
                <form
                  onSubmit={handleSaveDailyLog}
                  className="bg-paper-surface border border-line rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-line">
                    <h2 className="text-base font-semibold text-ink-primary">
                      บันทึกการทำงานประจำวัน
                    </h2>
                    <span className="text-xs text-ink-muted">
                      หากเลือกวันที่เดิมจะอัปเดตบันทึกของวันนั้น
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="work_date"
                        className="block text-xs font-medium text-ink-secondary mb-1"
                      >
                        วันที่ทำงาน <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="work_date"
                        type="date"
                        required
                        value={workDate}
                        onChange={(e) => setWorkDate(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="hours_worked"
                        className="block text-xs font-medium text-ink-secondary mb-1"
                      >
                        ชั่วโมงทำงาน
                      </label>
                      <input
                        id="hours_worked"
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="tasks_assigned"
                      className="block text-xs font-medium text-ink-secondary mb-1"
                    >
                      งานที่ได้รับมอบหมาย <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="tasks_assigned"
                      rows={2}
                      required
                      value={tasksAssigned}
                      onChange={(e) => setTasksAssigned(e.target.value)}
                      placeholder="วันนี้ได้รับมอบหมายให้ทำอะไรบ้าง..."
                      className="w-full px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="knowledge_gained"
                      className="block text-xs font-medium text-ink-secondary mb-1"
                    >
                      ความรู้ / ทักษะที่ได้รับ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="knowledge_gained"
                      rows={2}
                      required
                      value={knowledgeGained}
                      onChange={(e) => setKnowledgeGained(e.target.value)}
                      placeholder="ได้เรียนรู้อะไรใหม่ หรือแก้ปัญหาอะไรได้บ้าง..."
                      className="w-full px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>

                  {/* Tool Tags Input */}
                  <div>
                    <label
                      htmlFor="tools_input"
                      className="block text-xs font-medium text-ink-secondary mb-1"
                    >
                      เครื่องมือ / เทคโนโลยีที่ใช้ (พิมพ์แล้วกด Enter หรือเครื่องหมาย ,)
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-paper-bg border border-line-strong focus-within:ring-2 focus-within:ring-brand/40">
                      {toolTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-subtle text-brand"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeToolTag(tag)}
                            aria-label={`ลบ ${tag}`}
                            className="hover:opacity-75"
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                      <input
                        id="tools_input"
                        type="text"
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addToolTag(toolInput);
                          }
                        }}
                        placeholder={
                          toolTags.length === 0
                            ? "เช่น Next.js, Figma, Docker..."
                            : "เพิ่มเครื่องมือ..."
                        }
                        className="flex-1 min-w-[140px] bg-transparent text-sm text-ink-primary focus:outline-none py-1 px-1"
                      />
                      {toolInput.trim() && (
                        <button
                          type="button"
                          onClick={() => addToolTag(toolInput)}
                          className="px-2 py-1 rounded text-xs font-medium bg-paper-muted text-ink-primary"
                        >
                          + เพิ่ม
                        </button>
                      )}
                    </div>
                    {roundTools.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-ink-muted">ใช้บ่อย:</span>
                        {roundTools.slice(0, 6).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => addToolTag(t)}
                            className="text-[11px] px-2 py-0.5 rounded bg-paper-muted text-ink-secondary hover:text-ink-primary transition-colors"
                          >
                            + {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 inline-flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      {isPending ? "กำลังบันทึก..." : "บันทึกงานประจำวัน"}
                    </button>
                  </div>
                </form>
              )}

              {/* Grouped Daily Logs */}
              {logsByWeek.length === 0 ? (
                <div className="bg-paper-surface border border-line rounded-2xl p-8 text-center text-sm text-ink-muted">
                  ยังไม่มีบันทึกการทำงานประจำวันในรอบนี้
                </div>
              ) : (
                <div className="space-y-4">
                  {logsByWeek.map(([weekNum, logs]) => {
                    const weekHours = logs.reduce((s, l) => s + l.hoursWorked, 0);
                    return (
                      <section
                        key={weekNum}
                        className="bg-paper-surface border border-line rounded-2xl overflow-hidden"
                      >
                        <div className="px-5 py-3 bg-paper-muted/60 border-b border-line flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-ink-primary">
                            สัปดาห์ที่ {weekNum}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-ink-muted tabular-nums">
                            <span>{logs.length} วัน</span>
                            <span>{weekHours} ชั่วโมง</span>
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  setStartWeek(weekNum);
                                  setEndWeek(weekNum);
                                  setActiveTab("reports");
                                }}
                                className="text-brand hover:underline font-medium"
                              >
                                เขียนสรุปสัปดาห์นี้ →
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="divide-y divide-line">
                          {logs
                            .sort((a, b) => b.workDate.localeCompare(a.workDate))
                            .map((log) => {
                              const tags = splitTools(log.toolsUsed);
                              return (
                                <div key={log.logId} className="p-4 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-semibold text-ink-primary tabular-nums">
                                        {formatThaiDate(log.workDate)}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-paper-muted text-ink-secondary tabular-nums">
                                        {log.hoursWorked} ชม.
                                      </span>
                                    </div>
                                    {!isReadOnly && (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleLoadLogForEdit(log)}
                                          className="min-h-[36px] px-2.5 py-1 rounded-md text-xs text-ink-secondary hover:text-ink-primary hover:bg-paper-muted inline-flex items-center gap-1"
                                        >
                                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                          แก้ไข
                                        </button>
                                        {confirmDeleteId === log.logId ? (
                                          <div className="inline-flex items-center gap-1">
                                            <button
                                              type="button"
                                              disabled={isPending}
                                              onClick={() =>
                                                handleDeleteDailyLog(log.logId)
                                              }
                                              className="min-h-[36px] px-2.5 py-1 rounded-md text-xs font-medium bg-red-600 text-white"
                                            >
                                              ยืนยันลบ
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setConfirmDeleteId(null)}
                                              className="min-h-[36px] px-2 py-1 text-xs text-ink-muted"
                                            >
                                              ยกเลิก
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setConfirmDeleteId(log.logId)
                                            }
                                            className="min-h-[36px] px-2 py-1 rounded-md text-xs text-red-600 dark:text-red-400 hover:bg-paper-muted inline-flex items-center"
                                            aria-label="ลบบันทึกประจำวัน"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <div className="text-[11px] font-medium text-ink-muted mb-0.5">
                                        งานที่ได้รับมอบหมาย
                                      </div>
                                      <p className="text-ink-primary whitespace-pre-line">
                                        {log.tasksAssigned}
                                      </p>
                                    </div>
                                    <div>
                                      <div className="text-[11px] font-medium text-ink-muted mb-0.5">
                                        ความรู้ / ทักษะที่ได้รับ
                                      </div>
                                      <p className="text-ink-secondary whitespace-pre-line">
                                        {log.knowledgeGained}
                                      </p>
                                    </div>
                                  </div>

                                  {tags.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <Wrench
                                        className="w-3.5 h-3.5 text-ink-muted"
                                        aria-hidden="true"
                                      />
                                      {tags.map((t) => (
                                        <span
                                          key={t}
                                          className="text-xs px-2 py-0.5 rounded-md bg-paper-muted text-ink-secondary border border-line"
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
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERIOD SUMMARY REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-5">
              {!isReadOnly && (
                <div className="bg-paper-surface border border-line rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-line">
                    <h2 className="text-base font-semibold text-ink-primary">
                      เขียนรายงานสรุปรอบส่งอาจารย์ (ทุก 1–2 สัปดาห์)
                    </h2>
                    <button
                      type="button"
                      disabled={rangeLogs.length === 0}
                      onClick={handleAutoFillDraft}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-subtle text-brand hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-1.5 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      ดึงรายการรายวันมาช่วยร่างสรุป
                    </button>
                  </div>

                  {/* Week Range Selectors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label
                        htmlFor="start_week"
                        className="block text-xs font-medium text-ink-secondary mb-1"
                      >
                        ตั้งแต่สัปดาห์ที่
                      </label>
                      <input
                        id="start_week"
                        type="number"
                        min={1}
                        max={52}
                        value={startWeek}
                        onChange={(e) => {
                          const v = Math.max(1, Number(e.target.value) || 1);
                          setStartWeek(v);
                          if (endWeek < v) setEndWeek(v);
                        }}
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="end_week"
                        className="block text-xs font-medium text-ink-secondary mb-1"
                      >
                        ถึงสัปดาห์ที่
                      </label>
                      <input
                        id="end_week"
                        type="number"
                        min={startWeek}
                        max={startWeek + 3}
                        value={endWeek}
                        onChange={(e) => {
                          const v = Math.max(
                            startWeek,
                            Number(e.target.value) || startWeek
                          );
                          setEndWeek(v);
                        }}
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary tabular-nums"
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <div className="w-full px-3 py-2.5 rounded-lg bg-paper-bg border border-line text-xs text-ink-secondary tabular-nums">
                        พบบันทึกรายวันในช่วงนี้{" "}
                        <strong className="text-ink-primary">
                          {rangeLogs.length}
                        </strong>{" "}
                        วัน ({rangeHours} ชม.) • เครื่องมือ{" "}
                        <strong className="text-ink-primary">
                          {rangeTools.length}
                        </strong>{" "}
                        รายการ
                      </div>
                    </div>
                  </div>

                  {/* Auto-Aggregate Reference Preview */}
                  {rangeLogs.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-paper-bg border border-line space-y-2">
                      <div className="text-xs font-semibold text-ink-primary">
                        ข้อมูลอ้างอิงจากบันทึกประจำวัน (สัปดาห์ที่{" "}
                        {startWeek === endWeek
                          ? startWeek
                          : `${startWeek}–${endWeek}`}
                        )
                      </div>
                      <ul className="space-y-1 text-xs text-ink-secondary">
                        {rangeLogs.map((l) => (
                          <li key={l.logId} className="leading-relaxed">
                            <span className="font-mono text-ink-muted mr-1.5">
                              [{l.workDate}]
                            </span>
                            {l.tasksAssigned}
                          </li>
                        ))}
                      </ul>
                      {rangeTools.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rangeTools.map((t) => (
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
                  )}

                  <div>
                    <label
                      htmlFor="summary_text"
                      className="block text-xs font-medium text-ink-secondary mb-1"
                    >
                      สรุปรวมผลการทำงานและความรู้ที่ได้รับ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="summary_text"
                      rows={4}
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      placeholder="สรุปภาพรวมสิ่งที่ได้ทำ ความก้าวหน้า และทักษะที่พัฒนาขึ้นในช่วงสัปดาห์นี้..."
                      className="w-full px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="challenges"
                      className="block text-xs font-medium text-ink-secondary mb-1"
                    >
                      ปัญหา อุปสรรค หรือสิ่งที่อยากปรึกษาอาจารย์ (ถ้ามี)
                    </label>
                    <textarea
                      id="challenges"
                      rows={2}
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      placeholder="ระบุปัญหาที่พบระหว่างทำงานหรือหัวข้อที่ต้องการคำแนะนำ..."
                      className="w-full px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveReport("draft")}
                      className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium border border-line-strong text-ink-secondary hover:text-ink-primary disabled:opacity-60 transition-colors"
                    >
                      บันทึกร่าง
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveReport("submitted")}
                      className="min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 inline-flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                      {isPending ? "กำลังส่ง..." : "ส่งให้อาจารย์ตรวจ"}
                    </button>
                  </div>
                </div>
              )}

              {/* Reports History List */}
              {periodReports.length === 0 ? (
                <div className="bg-paper-surface border border-line rounded-2xl p-8 text-center text-sm text-ink-muted">
                  ยังไม่มีรายงานสรุปรอบส่งในรอบการฝึกงานนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {periodReports.map((rep) => (
                    <article
                      key={rep.reportId}
                      className="bg-paper-surface border border-line rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-line">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-ink-primary">
                            รายงานสรุปสัปดาห์ที่{" "}
                            {rep.startWeek === rep.endWeek
                              ? rep.startWeek
                              : `${rep.startWeek}–${rep.endWeek}`}
                          </h3>
                          <ReportStatusBadge status={rep.status} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          {rep.submittedAt && (
                            <span className="tabular-nums">
                              ส่งเมื่อ {formatThaiDate(rep.submittedAt)}
                            </span>
                          )}
                          {!isReadOnly && rep.status !== "reviewed" && (
                            <button
                              type="button"
                              onClick={() => handleLoadReportForEdit(rep)}
                              className="min-h-[36px] px-2.5 py-1 rounded-md text-xs font-medium text-brand hover:bg-brand-subtle transition-colors"
                            >
                              {rep.status === "needs_revision"
                                ? "แก้ไขและส่งใหม่"
                                : "แก้ไข"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-ink-primary whitespace-pre-line">
                        {rep.summaryText}
                      </div>

                      {rep.challenges && (
                        <div className="text-xs text-ink-secondary bg-paper-bg border border-line rounded-xl p-3">
                          <span className="font-semibold text-ink-primary">
                            ปัญหา / ข้อปรึกษา:{" "}
                          </span>
                          {rep.challenges}
                        </div>
                      )}

                      {rep.teacherFeedback && (
                        <div
                          className={`rounded-xl p-3.5 text-sm border ${
                            rep.status === "needs_revision"
                              ? "bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200"
                              : "bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200"
                          }`}
                        >
                          <div className="text-xs font-semibold mb-1">
                            ข้อเสนอแนะจากอาจารย์
                            {rep.reviewedByName ? ` (${rep.reviewedByName})` : ""}
                          </div>
                          <p className="whitespace-pre-line">
                            {rep.teacherFeedback}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Compact Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="bg-paper-surface border border-line rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-paper-muted text-ink-primary">
                รอบที่ {selectedRound.roundNumber}
              </span>
              <span className="text-xs text-ink-muted tabular-nums">
                ปี {selectedRound.academicYear} / เทอม {selectedRound.semester}
              </span>
            </div>

            <div>
              <div className="text-xs text-ink-muted mb-0.5">สถานประกอบการ</div>
              <Link
                href={`/workplaces/${selectedRound.workplace.workplaceId}`}
                className="text-sm font-semibold text-ink-primary hover:text-brand inline-flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
                {selectedRound.workplace.workplaceName}
              </Link>
              {selectedRound.position && (
                <div className="text-xs text-ink-secondary mt-0.5">
                  ตำแหน่ง: {selectedRound.position}
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-line text-xs text-ink-secondary space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-ink-muted">
                  <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  อาจารย์ที่ปรึกษา
                </span>
                <span className="font-medium text-ink-primary">
                  {selectedRound.advisor
                    ? `${selectedRound.advisor.userFname} ${selectedRound.advisor.userLname}`.trim()
                    : "ยังไม่ระบุ"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">รอบส่งรายงาน</span>
                <span className="font-medium text-ink-primary">
                  ทุก {selectedRound.reportCycle === "biweekly" ? "2 สัปดาห์" : "1 สัปดาห์"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-line text-center">
              <div className="p-2 rounded-xl bg-paper-bg border border-line">
                <div className="text-base font-semibold text-ink-primary tabular-nums">
                  {dailyLogs.length}
                </div>
                <div className="text-[11px] text-ink-muted">วันบันทึก</div>
              </div>
              <div className="p-2 rounded-xl bg-paper-bg border border-line">
                <div className="text-base font-semibold text-ink-primary tabular-nums">
                  {totalHours}
                </div>
                <div className="text-[11px] text-ink-muted">ชั่วโมง</div>
              </div>
              <div className="p-2 rounded-xl bg-paper-bg border border-line">
                <div className="text-base font-semibold text-ink-primary tabular-nums">
                  {periodReports.filter((r) => r.status === "reviewed").length}/
                  {periodReports.length}
                </div>
                <div className="text-[11px] text-ink-muted">ตรวจแล้ว</div>
              </div>
            </div>

            {roundTools.length > 0 && (
              <div className="pt-2.5 border-t border-line">
                <div className="text-xs font-medium text-ink-muted mb-2">
                  เครื่องมือที่ใช้ในรอบนี้
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {roundTools.slice(0, 12).map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-md bg-paper-muted text-ink-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
