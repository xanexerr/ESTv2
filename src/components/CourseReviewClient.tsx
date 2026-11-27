"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Star,
  Briefcase,
  Award,
  MessageSquare,
  Send,
  Plus,
  CheckCircle2,
  Lock,
  GraduationCap,
  X,
} from "lucide-react";
import {
  submitCourseReviewAction,
  createCourseAction,
  recordPassedCourseAction,
  removePassedCourseAction,
} from "@/app/course-actions";

export interface CourseReviewData {
  reviewId: number;
  userId: string;
  reviewerName: string;
  contentRating: number;
  workloadRating: number;
  gradeDifficultyRating: number;
  commentText: string;
  academicYear: string;
  semester: string;
  createdAt: string;
}

export interface CourseItemData {
  courseId: number;
  courseCode: string;
  courseName: string;
  yearLevel: number;
  credits: number;
  reviews: CourseReviewData[];
}

export interface AcademicTreeNode {
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
      courses: CourseItemData[];
    }[];
  }[];
}

export interface PassedCourseRecord {
  courseId: number;
  grade: string;
  academicYear: string;
  semester: string;
}

export interface CurrentCourseUser {
  userId: string;
  role: "admin" | "teacher" | "student";
  universityId: number | null;
  facultyId: number | null;
  majorId: number | null;
  universityName: string | null;
  facultyName: string | null;
  majorName: string | null;
  passedCourses: PassedCourseRecord[];
}

const PASSING_GRADE_OPTIONS = ["A", "B+", "B", "C+", "C", "D+", "D", "S"] as const;

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function MetricBar({
  label,
  hint,
  value,
  icon,
  barClass,
}: {
  label: string;
  hint: string;
  value: number;
  icon: React.ReactNode;
  barClass: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <div className="p-3.5 rounded-xl bg-paper-bg border border-line space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-secondary inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-ink-primary tabular-nums">
          {value > 0 ? value.toFixed(1) : "—"} / 5.0
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-paper-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[11px] text-ink-muted">{hint}</div>
    </div>
  );
}

function ScorePicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink-primary">{label}</span>
        <span className="text-ink-muted">{hint}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`min-h-[40px] rounded-lg text-sm font-mono font-semibold border transition-colors ${
              value === n
                ? "bg-brand text-white dark:text-zinc-950 border-brand"
                : "bg-paper-bg text-ink-secondary border-line-strong hover:text-ink-primary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CourseReviewClient({
  universities,
  currentUser,
}: {
  universities: AcademicTreeNode[];
  currentUser: CurrentCourseUser | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isStudent = currentUser?.role === "student";

  // Resolve initial selection: default to student's own university/faculty/major if available
  const initialUni =
    (isStudent && currentUser?.universityId
      ? universities.find((u) => u.universityId === currentUser.universityId)
      : null) ||
    universities[0] ||
    null;

  const initialFac =
    (isStudent && currentUser?.facultyId
      ? initialUni?.faculties.find((f) => f.facultyId === currentUser.facultyId)
      : null) ||
    initialUni?.faculties[0] ||
    null;

  const initialMajor =
    (isStudent && currentUser?.majorId
      ? initialFac?.majors.find((m) => m.majorId === currentUser.majorId)
      : null) ||
    initialFac?.majors[0] ||
    null;

  // 5-Level Cascading State: University -> Faculty -> Major -> Year -> Course
  const [uniId, setUniId] = useState<string>(
    initialUni ? String(initialUni.universityId) : ""
  );
  const selectedUni = useMemo(
    () => universities.find((u) => String(u.universityId) === uniId) || null,
    [universities, uniId]
  );

  const [facId, setFacId] = useState<string>(
    initialFac ? String(initialFac.facultyId) : ""
  );
  const selectedFac = useMemo(
    () =>
      selectedUni?.faculties.find((f) => String(f.facultyId) === facId) || null,
    [selectedUni, facId]
  );

  const [majorId, setMajorId] = useState<string>(
    initialMajor ? String(initialMajor.majorId) : ""
  );
  const selectedMajor = useMemo(
    () =>
      selectedFac?.majors.find((m) => String(m.majorId) === majorId) || null,
    [selectedFac, majorId]
  );

  const [yearFilter, setYearFilter] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    const all = selectedMajor?.courses || [];
    if (yearFilter === "all") return all;
    return all.filter((c) => String(c.yearLevel) === yearFilter);
  }, [selectedMajor, yearFilter]);

  const [courseId, setCourseId] = useState<string>(
    initialMajor?.courses[0] ? String(initialMajor.courses[0].courseId) : ""
  );

  const selectedCourse = useMemo(
    () =>
      filteredCourses.find((c) => String(c.courseId) === courseId) ||
      filteredCourses[0] ||
      null,
    [filteredCourses, courseId]
  );

  // Map of passed courses for quick lookup
  const passedCourseMap = useMemo(() => {
    const map = new Map<number, PassedCourseRecord>();
    for (const rec of currentUser?.passedCourses || []) {
      map.set(rec.courseId, rec);
    }
    return map;
  }, [currentUser]);

  const hasStudentAffiliation = Boolean(
    currentUser?.universityId && currentUser?.facultyId && currentUser?.majorId
  );

  const isOwnAcademicScope = Boolean(
    isStudent &&
      hasStudentAffiliation &&
      selectedUni?.universityId === currentUser?.universityId &&
      selectedFac?.facultyId === currentUser?.facultyId &&
      selectedMajor?.majorId === currentUser?.majorId
  );

  const selectedPassedRecord = selectedCourse
    ? passedCourseMap.get(selectedCourse.courseId) || null
    : null;

  const hasExistingUserReview = Boolean(
    selectedCourse &&
      currentUser &&
      selectedCourse.reviews.some((r) => r.userId === currentUser.userId)
  );

  // Passed-course form state
  const [passedGrade, setPassedGrade] = useState<string>("A");
  const [passedYear, setPassedYear] = useState<string>("2568");
  const [passedSemester, setPassedSemester] = useState<string>("1");

  // Review form state
  const [contentRating, setContentRating] = useState(5);
  const [workloadRating, setWorkloadRating] = useState(3);
  const [gradeDifficultyRating, setGradeDifficultyRating] = useState(3);
  const [commentText, setCommentText] = useState("");
  const [academicYear, setAcademicYear] = useState("2569");
  const [semester, setSemester] = useState("1");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  // Add course modal/panel state
  const [showAddCourse, setShowAddCourse] = useState(false);

  function jumpToOwnMajor() {
    if (!currentUser?.universityId || !currentUser?.facultyId || !currentUser?.majorId) {
      return;
    }
    const u = universities.find((x) => x.universityId === currentUser.universityId);
    const f = u?.faculties.find((x) => x.facultyId === currentUser.facultyId);
    const m = f?.majors.find((x) => x.majorId === currentUser.majorId);
    if (!u || !f || !m) return;
    setUniId(String(u.universityId));
    setFacId(String(f.facultyId));
    setMajorId(String(m.majorId));
    setYearFilter("all");
    setCourseId(m.courses[0] ? String(m.courses[0].courseId) : "");
    setFeedback(null);
  }

  function handleUniChange(nextUniId: string) {
    setUniId(nextUniId);
    const u = universities.find((x) => String(x.universityId) === nextUniId);
    const f = u?.faculties[0];
    const m = f?.majors[0];
    setFacId(f ? String(f.facultyId) : "");
    setMajorId(m ? String(m.majorId) : "");
    setYearFilter("all");
    setCourseId(m?.courses[0] ? String(m.courses[0].courseId) : "");
  }

  function handleFacChange(nextFacId: string) {
    setFacId(nextFacId);
    const f = selectedUni?.faculties.find(
      (x) => String(x.facultyId) === nextFacId
    );
    const m = f?.majors[0];
    setMajorId(m ? String(m.majorId) : "");
    setYearFilter("all");
    setCourseId(m?.courses[0] ? String(m.courses[0].courseId) : "");
  }

  function handleMajorChange(nextMajorId: string) {
    setMajorId(nextMajorId);
    const m = selectedFac?.majors.find(
      (x) => String(x.majorId) === nextMajorId
    );
    setYearFilter("all");
    setCourseId(m?.courses[0] ? String(m.courses[0].courseId) : "");
  }

  function handleRecordPassedCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;
    setFeedback(null);
    const fd = new FormData();
    fd.set("course_id", String(selectedCourse.courseId));
    fd.set("grade", passedGrade);
    fd.set("academic_year", passedYear);
    fd.set("semester", passedSemester);

    startTransition(async () => {
      const res = await recordPassedCourseAction(fd);
      setFeedback(res);
      if (res.ok) {
        setAcademicYear(passedYear);
        setSemester(passedSemester);
        router.refresh();
      }
    });
  }

  function handleRemovePassedCourse() {
    if (!selectedCourse) return;
    setFeedback(null);
    const fd = new FormData();
    fd.set("course_id", String(selectedCourse.courseId));

    startTransition(async () => {
      const res = await removePassedCourseAction(fd);
      setFeedback(res);
      if (res.ok) {
        router.refresh();
      }
    });
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;
    setFeedback(null);
    const fd = new FormData();
    fd.set("course_id", String(selectedCourse.courseId));
    fd.set("content_rating", String(contentRating));
    fd.set("workload_rating", String(workloadRating));
    fd.set("grade_difficulty_rating", String(gradeDifficultyRating));
    fd.set("comment_text", commentText);
    fd.set("academic_year", selectedPassedRecord?.academicYear || academicYear);
    fd.set("semester", selectedPassedRecord?.semester || semester);

    startTransition(async () => {
      const res = await submitCourseReviewAction(fd);
      setFeedback(res);
      if (res.ok) {
        setCommentText("");
        router.refresh();
      }
    });
  }

  function handleCreateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedMajor) return;
    setFeedback(null);
    const fd = new FormData(e.currentTarget);
    fd.set("major_id", String(selectedMajor.majorId));
    startTransition(async () => {
      const res = await createCourseAction(fd);
      setFeedback(res);
      if (res.ok) {
        setShowAddCourse(false);
        router.refresh();
      }
    });
  }

  const selectClass =
    "w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm rounded-lg bg-paper-bg border border-line-strong text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  const canAddCourse = Boolean(
    currentUser &&
      selectedMajor &&
      (!isStudent || isOwnAcademicScope)
  );

  const contentAvg = selectedCourse
    ? avg(selectedCourse.reviews.map((r) => r.contentRating))
    : 0;
  const workloadAvg = selectedCourse
    ? avg(selectedCourse.reviews.map((r) => r.workloadRating))
    : 0;
  const gradeAvg = selectedCourse
    ? avg(selectedCourse.reviews.map((r) => r.gradeDifficultyRating))
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight">
            รีวิวรายวิชามหาวิทยาลัย
          </h1>
          <p className="text-sm text-ink-muted">
            เลือกมหาวิทยาลัย → คณะ → สาขา → ชั้นปี → วิชา เพื่อดูรีวิวเนื้อหา ภาระงาน และความยากในการเก็บเกรด
          </p>
        </div>

        {canAddCourse && (
          <button
            type="button"
            onClick={() => setShowAddCourse((p) => !p)}
            className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium border border-line-strong text-ink-primary hover:bg-paper-muted inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {showAddCourse ? "ซ่อนฟอร์มเพิ่มวิชา" : "เพิ่มรายวิชาใหม่"}
          </button>
        )}
      </div>

      {/* Student Academic Affiliation Bar */}
      {isStudent && (
        <div className="bg-paper-surface border border-line rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-ink-secondary">
            <GraduationCap className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
            {hasStudentAffiliation ? (
              <span>
                สังกัดของคุณ:{" "}
                <strong className="text-ink-primary">
                  {currentUser?.universityName} / {currentUser?.facultyName} /{" "}
                  {currentUser?.majorName}
                </strong>{" "}
                · บันทึกผ่านแล้ว{" "}
                <strong className="text-ink-primary tabular-nums">
                  {currentUser?.passedCourses.length || 0}
                </strong>{" "}
                วิชา
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-300">
                บัญชีของคุณยังไม่ได้ผูกข้อมูลมหาวิทยาลัย คณะ และสาขา จึงยังไม่สามารถเขียนรีวิวรายวิชาได้
              </span>
            )}
          </div>

          {hasStudentAffiliation && !isOwnAcademicScope && (
            <button
              type="button"
              onClick={jumpToOwnMajor}
              className="px-3 py-1.5 rounded-lg bg-brand text-white dark:text-zinc-950 font-medium hover:bg-brand-hover transition-colors"
            >
              กลับไปยังสาขาของฉัน
            </button>
          )}
        </div>
      )}

      {/* 5-Level Cascading Filter Bar */}
      <section
        aria-label="ตัวกรองรายวิชา"
        className="bg-paper-surface border border-line rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <div>
          <label
            htmlFor="filter_uni"
            className="block text-xs font-medium text-ink-muted mb-1"
          >
            1. มหาวิทยาลัย
          </label>
          <select
            id="filter_uni"
            value={uniId}
            onChange={(e) => handleUniChange(e.target.value)}
            className={selectClass}
          >
            {universities.map((u) => (
              <option key={u.universityId} value={u.universityId}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter_fac"
            className="block text-xs font-medium text-ink-muted mb-1"
          >
            2. คณะ
          </label>
          <select
            id="filter_fac"
            value={facId}
            onChange={(e) => handleFacChange(e.target.value)}
            className={selectClass}
          >
            {(selectedUni?.faculties || []).map((f) => (
              <option key={f.facultyId} value={f.facultyId}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter_major"
            className="block text-xs font-medium text-ink-muted mb-1"
          >
            3. สาขา
          </label>
          <select
            id="filter_major"
            value={majorId}
            onChange={(e) => handleMajorChange(e.target.value)}
            className={selectClass}
          >
            {(selectedFac?.majors || []).map((m) => (
              <option key={m.majorId} value={m.majorId}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter_year"
            className="block text-xs font-medium text-ink-muted mb-1"
          >
            4. ชั้นปี
          </label>
          <select
            id="filter_year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">ทุกชั้นปี</option>
            <option value="1">ชั้นปีที่ 1</option>
            <option value="2">ชั้นปีที่ 2</option>
            <option value="3">ชั้นปีที่ 3</option>
            <option value="4">ชั้นปีที่ 4</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter_course"
            className="block text-xs font-medium text-ink-muted mb-1"
          >
            5. รายวิชา ({filteredCourses.length})
          </label>
          <select
            id="filter_course"
            value={selectedCourse ? String(selectedCourse.courseId) : ""}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={filteredCourses.length === 0}
            className={selectClass}
          >
            {filteredCourses.length === 0 ? (
              <option value="">ไม่มีรายวิชาในชั้นปีนี้</option>
            ) : (
              filteredCourses.map((c) => {
                const passed = passedCourseMap.get(c.courseId);
                return (
                  <option key={c.courseId} value={c.courseId}>
                    {passed ? "✓ " : ""}
                    {c.courseCode} {c.courseName}
                  </option>
                );
              })
            )}
          </select>
        </div>
      </section>

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

      {/* Optional Add Course Form */}
      {showAddCourse && canAddCourse && selectedMajor && (
        <form
          onSubmit={handleCreateCourse}
          className="bg-paper-surface border border-line rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              รหัสวิชา
            </label>
            <input
              name="course_code"
              required
              placeholder="เช่น 240-315"
              className={selectClass}
            />
          </div>
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              ชื่อรายวิชา
            </label>
            <input
              name="course_name"
              required
              placeholder="ระบุชื่อรายวิชา"
              className={selectClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              ชั้นปี
            </label>
            <select name="year_level" defaultValue="2" className={selectClass}>
              <option value="1">ปี 1</option>
              <option value="2">ปี 2</option>
              <option value="3">ปี 3</option>
              <option value="4">ปี 4</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium"
            >
              บันทึกรายวิชา
            </button>
          </div>
        </form>
      )}

      {/* Selected Course Details + Reviews + Submit Form */}
      {!selectedCourse ? (
        <div className="bg-paper-surface border border-line rounded-2xl p-10 text-center text-sm text-ink-muted">
          ไม่พบรายวิชาที่ตรงกับตัวกรองที่เลือก
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Course Summary + Reviews List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-paper-surface border border-line rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-line">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-brand-subtle text-brand">
                      {selectedCourse.courseCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-paper-muted text-ink-secondary">
                      ชั้นปีที่ {selectedCourse.yearLevel}
                    </span>
                    <span className="text-ink-muted">
                      {selectedCourse.credits} หน่วยกิต
                    </span>
                    {selectedPassedRecord && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        ผ่านแล้ว (เกรด {selectedPassedRecord.grade})
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-ink-primary flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand flex-shrink-0" aria-hidden="true" />
                    {selectedCourse.courseName}
                  </h2>
                </div>
                <span className="text-xs text-ink-muted tabular-nums">
                  {selectedCourse.reviews.length} รีวิว
                </span>
              </div>

              {/* 3-Metric Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricBar
                  label="เนื้อหา"
                  hint="1 พื้นฐาน — 5 เข้มข้น/นำไปใช้ได้จริง"
                  value={contentAvg}
                  icon={<Star className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />}
                  barClass="bg-emerald-500"
                />
                <MetricBar
                  label="ภาระงาน"
                  hint="1 เบา — 5 งาน/โปรเจกต์เยอะ"
                  value={workloadAvg}
                  icon={<Briefcase className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />}
                  barClass="bg-sky-500"
                />
                <MetricBar
                  label="ความยากเก็บเกรด"
                  hint="1 เก็บง่าย — 5 เก็บเกรดยาก"
                  value={gradeAvg}
                  icon={<Award className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />}
                  barClass="bg-amber-500"
                />
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink-primary inline-flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand" aria-hidden="true" />
                ความคิดเห็นจากนักศึกษา ({selectedCourse.reviews.length})
              </h3>

              {selectedCourse.reviews.length === 0 ? (
                <div className="bg-paper-surface border border-line rounded-2xl p-6 text-center text-sm text-ink-muted">
                  ยังไม่มีรีวิวสำหรับรายวิชานี้ เป็นคนแรกที่แบ่งปันประสบการณ์เลย!
                </div>
              ) : (
                selectedCourse.reviews.map((rev) => (
                  <article
                    key={rev.reviewId}
                    className="bg-paper-surface border border-line rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink-primary">
                        {rev.reviewerName}
                      </span>
                      <span className="text-ink-muted tabular-nums">
                        ปี {rev.academicYear} / เทอม {rev.semester}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs font-mono tabular-nums">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        เนื้อหา {rev.contentRating}/5
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        ภาระงาน {rev.workloadRating}/5
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300">
                        ความยากเก็บเกรด {rev.gradeDifficultyRating}/5
                      </span>
                    </div>

                    <p className="text-sm text-ink-secondary whitespace-pre-line leading-relaxed">
                      {rev.commentText}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Right: Write Review Form (5 cols) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20">
            <div className="bg-paper-surface border border-line rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-ink-primary pb-2.5 border-b border-line">
                เขียนรีวิววิชา {selectedCourse.courseCode}
              </h3>

              {!currentUser ? (
                <div className="space-y-3 text-sm text-ink-secondary">
                  <p>เข้าสู่ระบบเพื่อแบ่งปันรีวิวเนื้อหา ภาระงาน และความยากในการเก็บเกรด</p>
                  <Link
                    href="/login"
                    className="w-full min-h-[44px] inline-flex items-center justify-center rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 font-medium transition-colors"
                  >
                    เข้าสู่ระบบเพื่อรีวิว
                  </Link>
                </div>
              ) : isStudent && !hasStudentAffiliation ? (
                <div className="space-y-3 text-sm text-ink-secondary">
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div className="space-y-1 text-xs leading-relaxed">
                      <p className="font-semibold">ยังไม่สามารถเขียนรีวิวได้</p>
                      <p>
                        บัญชีนักศึกษาของคุณยังไม่ได้ระบุมหาวิทยาลัย คณะ และสาขา กรุณาติดต่อผู้ดูแลระบบเพื่ออัปเดตข้อมูลสังกัด
                      </p>
                    </div>
                  </div>
                </div>
              ) : isStudent && !isOwnAcademicScope ? (
                <div className="space-y-3 text-sm text-ink-secondary">
                  <div className="p-4 rounded-xl bg-paper-bg border border-line space-y-2">
                    <div className="flex items-center gap-2 text-ink-primary font-semibold text-sm">
                      <Lock className="w-4 h-4 text-ink-muted flex-shrink-0" aria-hidden="true" />
                      จำกัดสิทธิ์เฉพาะสาขาของตนเอง
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      นักศึกษาสามารถเขียนรีวิวได้เฉพาะรายวิชาใน{" "}
                      <strong className="text-ink-primary">
                        มหาวิทยาลัย คณะ และสาขาของตนเอง
                      </strong>{" "}
                      และต้องเป็นรายวิชาที่เรียนผ่านแล้วเท่านั้น (คุณยังสามารถอ่านรีวิวของทุกสถาบันได้ตามปกติ)
                    </p>
                    <p className="text-xs text-ink-muted">
                      สังกัดของคุณ: {currentUser.universityName} / {currentUser.facultyName} /{" "}
                      {currentUser.majorName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={jumpToOwnMajor}
                    className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium transition-colors"
                  >
                    ไปยังรายวิชาในสาขาของฉัน
                  </button>
                </div>
              ) : isStudent && !selectedPassedRecord ? (
                <form onSubmit={handleRecordPassedCourse} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-paper-bg border border-line space-y-1.5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
                      <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" aria-hidden="true" />
                      ยืนยันว่าเรียนผ่านวิชานี้แล้วก่อนรีวิว
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      สามารถรีวิวได้เฉพาะรายวิชาที่เรียนผ่านแล้วเท่านั้น กรุณาบันทึกเกรดที่ผ่าน (A–D หรือ S) เพื่อปลดล็อกฟอร์มเขียนรีวิวสำหรับวิชา{" "}
                      <span className="font-mono font-semibold text-ink-primary">
                        {selectedCourse.courseCode}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        เกรดที่ผ่าน
                      </label>
                      <select
                        value={passedGrade}
                        onChange={(e) => setPassedGrade(e.target.value)}
                        className={selectClass}
                      >
                        {PASSING_GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        ปีการศึกษา
                      </label>
                      <select
                        value={passedYear}
                        onChange={(e) => setPassedYear(e.target.value)}
                        className={selectClass}
                      >
                        <option value="2569">2569</option>
                        <option value="2568">2568</option>
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        ภาคเรียน
                      </label>
                      <select
                        value={passedSemester}
                        onChange={(e) => setPassedSemester(e.target.value)}
                        className={selectClass}
                      >
                        <option value="1">เทอม 1</option>
                        <option value="2">เทอม 2</option>
                        <option value="summer">ฤดูร้อน</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    {isPending ? "กำลังบันทึก..." : "บันทึกว่าเรียนผ่านวิชานี้แล้ว"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {isStudent && selectedPassedRecord && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        ผ่านวิชานี้แล้ว · เกรด {selectedPassedRecord.grade} (ปี{" "}
                        {selectedPassedRecord.academicYear} เทอม{" "}
                        {selectedPassedRecord.semester})
                      </span>
                      {!hasExistingUserReview && (
                        <button
                          type="button"
                          onClick={handleRemovePassedCourse}
                          disabled={isPending}
                          title="ยกเลิกสถานะเรียนผ่าน"
                          className="p-1 rounded hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}

                  <ScorePicker
                    label="เนื้อหา (Content)"
                    hint="1 น้อย → 5 ดีมาก"
                    value={contentRating}
                    onChange={setContentRating}
                  />
                  <ScorePicker
                    label="ภาระงาน (Workload)"
                    hint="1 เบา → 5 หนักมาก"
                    value={workloadRating}
                    onChange={setWorkloadRating}
                  />
                  <ScorePicker
                    label="ความยากในการเก็บเกรด"
                    hint="1 ง่าย → 5 ยากมาก"
                    value={gradeDifficultyRating}
                    onChange={setGradeDifficultyRating}
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        ปีการศึกษาที่เรียน
                      </label>
                      <select
                        value={selectedPassedRecord?.academicYear || academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        disabled={Boolean(selectedPassedRecord)}
                        className={selectClass}
                      >
                        <option value="2569">2569</option>
                        <option value="2568">2568</option>
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-secondary mb-1">
                        ภาคเรียน
                      </label>
                      <select
                        value={selectedPassedRecord?.semester || semester}
                        onChange={(e) => setSemester(e.target.value)}
                        disabled={Boolean(selectedPassedRecord)}
                        className={selectClass}
                      >
                        <option value="1">เทอม 1</option>
                        <option value="2">เทอม 2</option>
                        <option value="summer">ฤดูร้อน</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="course_comment"
                      className="block text-xs font-medium text-ink-secondary mb-1"
                    >
                      รายละเอียดรีวิว <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="course_comment"
                      rows={3}
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="เล่าแนวข้อสอบ โปรเจกต์ รูปแบบการสอน หรือเทคนิคเก็บเกรด..."
                      className="w-full px-3 py-2 rounded-lg bg-paper-bg border border-line-strong text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 text-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    {isPending ? "กำลังบันทึก..." : "ส่งรีวิวรายวิชา"}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
