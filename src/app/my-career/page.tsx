import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRoleLabel } from "@/lib/constants";
import { getCurrentUserContext } from "@/lib/university-scope";
import {
  Building2,
  BookOpen,
  ClipboardList,
  Plus,
  UserCheck,
  Users,
  MessageSquare,
  FileCheck,
  UserCog,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

function HubCard({
  href,
  icon,
  title,
  description,
  stat,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stat?: string;
}) {
  return (
    <Link
      href={href}
      className="bg-paper-surface border border-line hover:border-line-strong rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors group"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-paper-muted text-ink-primary inline-flex items-center justify-center">
            {icon}
          </div>
          {stat && (
            <span className="px-2.5 py-0.5 rounded-full bg-paper-muted text-ink-primary font-mono text-xs font-semibold tabular-nums">
              {stat}
            </span>
          )}
        </div>
        <h2 className="text-base font-semibold text-ink-primary group-hover:underline">
          {title}
        </h2>
        <p className="text-xs text-ink-secondary leading-relaxed">{description}</p>
      </div>
      <div className="inline-flex items-center gap-1 text-xs font-medium text-brand">
        เปิดใช้งาน
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
    </Link>
  );
}

export default async function MyCareerPage() {
  const user = await getCurrentUserContext();
  if (!user) {
    redirect("/login");
  }

  // Gather role-specific summaries
  let studentStats = {
    rounds: 0,
    logs: 0,
    passedCourses: 0,
    hasWorkplace: Boolean(user.workplaceId),
    hasComment: false,
  };
  let teacherStats = {
    pendingReports: 0,
    myWorkplaces: 0,
  };
  let adminStats = {
    pendingUsers: 0,
    totalWorkplaces: 0,
    totalUsers: 0,
    totalComments: 0,
  };

  if (user.role === "student") {
    const [roundsCount, logsCount, passedCount, commentCount] =
      await Promise.all([
        prisma.internshipRound.count({ where: { studentId: user.userId } }),
        prisma.dailyLog.count({
          where: { round: { studentId: user.userId } },
        }),
        prisma.studentPassedCourse.count({ where: { userId: user.userId } }),
        prisma.comment.count({ where: { userId: user.userId } }),
      ]);
    studentStats = {
      rounds: roundsCount,
      logs: logsCount,
      passedCourses: passedCount,
      hasWorkplace: Boolean(user.workplaceId),
      hasComment: commentCount > 0,
    };
  } else if (user.role === "teacher") {
    const [pendingReports, myWorkplaces] = await Promise.all([
      prisma.periodReport.count({
        where: {
          status: "submitted",
          round: { OR: [{ advisorId: user.userId }, { advisorId: null }] },
        },
      }),
      prisma.workplace.count({ where: { userId: user.userId } }),
    ]);
    teacherStats = { pendingReports, myWorkplaces };
  } else if (user.role === "admin") {
    const [pendingUsers, totalWorkplaces, totalUsers, totalComments] =
      await Promise.all([
        prisma.user.count({ where: { status: "pending" } }),
        prisma.workplace.count(),
        prisma.user.count(),
        prisma.comment.count(),
      ]);
    adminStats = { pendingUsers, totalWorkplaces, totalUsers, totalComments };
  }

  return (
    <div className="space-y-6">
      {/* User Identity Banner */}
      <section className="bg-paper-surface border border-line rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand text-white dark:text-zinc-950 text-xs font-semibold">
            {getRoleLabel(user.role)}
          </div>
          <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">
            {user.userFname} {user.userLname} - {user.userId}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
            <GraduationCap className="w-4 h-4 text-brand" aria-hidden="true" />
            {user.university ? (
              <span>
                {[user.faculty?.name, user.major?.name, user.university.name]
                  .filter(Boolean)
                  .join(" ")}
              </span>
            ) : (
              <span>
                {user.role === "admin"
                  ? "ผู้ดูแลระบบส่วนกลาง (ทุกมหาวิทยาลัย)"
                  : "ยังไม่ได้ระบุสังกัด"}
              </span>
            )}
          </div>
        </div>

        <Link
          href="/profile"
          className="min-h-[44px] px-4 py-2 rounded-xl border border-line-strong text-ink-primary hover:bg-paper-muted text-sm font-medium inline-flex items-center gap-2 transition-colors"
        >
          <UserCog className="w-4 h-4" aria-hidden="true" />
          แก้ไขข้อมูลส่วนตัว
        </Link>
      </section>

      {/* Role-Specific (Non-Universal) Functions */}
      {user.role === "student" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-primary">
            เครื่องมือการฝึกงานและการเรียนของฉัน (Student Workspace)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HubCard
              href="/student/internships"
              icon={<Building2 className="w-5 h-5" />}
              title="รอบการฝึกงานของฉัน"
              description="สร้างรอบฝึกงานใหม่ สลับรอบฝึกงาน และกำหนดอาจารย์ที่ปรึกษาและรอบส่งรายงาน"
              stat={`${studentStats.rounds} รอบ`}
            />
            <HubCard
              href="/student/logbook"
              icon={<ClipboardList className="w-5 h-5" />}
              title="บันทึกงานรายวัน & ส่งรายงาน"
              description="จด Daily Logbook รายวันและสรุปส่งรายงานประจำรอบสัปดาห์ให้อาจารย์ตรวจ"
              stat={`${studentStats.logs} วัน`}
            />
            <HubCard
              href="/student/workplace"
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="สถานประกอบการของฉัน"
              description="ดูหรือแก้ไขข้อมูลสถานประกอบการที่คุณเลือกไว้ รวมถึงเขียน/แก้ไขรีวิวบริษัท"
              stat={studentStats.hasWorkplace ? "เลือกแล้ว" : "ยังไม่เลือก"}
            />
            <HubCard
              href="/student/workplace/new"
              icon={<Plus className="w-5 h-5" />}
              title="เพิ่มสถานที่ฝึกงานใหม่"
              description="เพิ่มบริษัทที่คุณไปฝึกงานเข้าสู่ระบบ เพื่อให้เพื่อนร่วมมหาวิทยาลัยเห็นใน Internships"
            />
            <HubCard
              href={studentStats.hasComment ? "/student/review/edit" : "/student/review"}
              icon={<MessageSquare className="w-5 h-5" />}
              title={studentStats.hasComment ? "แก้ไขรีวิวบริษัทของฉัน" : "เขียนรีวิวบริษัทที่ฝึกงาน"}
              description="แบ่งปันประสบการณ์จริงและให้คะแนนสถานประกอบการสำหรับรุ่นน้องในมหาวิทยาลัย"
            />
            <HubCard
              href="/courses"
              icon={<BookOpen className="w-5 h-5" />}
              title="วิชาที่เรียนผ่าน & รีวิวรายวิชา"
              description="จัดการรายวิชาในสาขาที่คุณสอบผ่านแล้วและเขียนรีวิวเนื้อหา ภาระงาน ความยากเก็บเกรด"
              stat={`ผ่าน ${studentStats.passedCourses} วิชา`}
            />
          </div>
        </section>
      )}

      {user.role === "teacher" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-primary">
            เครื่องมือสำหรับอาจารย์ที่ปรึกษา (Teacher Workspace)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HubCard
              href="/teacher/reports"
              icon={<FileCheck className="w-5 h-5" />}
              title="ตรวจรายงานฝึกงานนักศึกษา"
              description="ตรวจรายงานรอบสัปดาห์ อ่าน Daily Logbook ประกอบ และให้ข้อเสนอแนะ"
              stat={`รอตรวจ ${teacherStats.pendingReports}`}
            />
            <HubCard
              href="/teacher/workplaces"
              icon={<Building2 className="w-5 h-5" />}
              title="สถานประกอบการที่ฉันดูแล"
              description="เพิ่มและอัปเดตข้อมูลสถานประกอบการแนะนำสำหรับนักศึกษาในสถาบัน"
              stat={`${teacherStats.myWorkplaces} แห่ง`}
            />
            <HubCard
              href="/teacher/workplaces/new"
              icon={<Plus className="w-5 h-5" />}
              title="เพิ่มสถานประกอบการแนะนำ"
              description="เพิ่มข้อมูลบริษัทใหม่พร้อมรูปแบบ Onsite / Hybrid / Remote และจังหวัด"
            />
          </div>
        </section>
      )}

      {user.role === "admin" && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-primary">
            ศูนย์ควบคุมระบบผู้ดูแล (Admin Console)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HubCard
              href="/admin/approvals"
              icon={<UserCheck className="w-5 h-5" />}
              title="อนุมัติบัญชีผู้ใช้งาน"
              description="ตรวจสอบหลักฐานบัตรนักศึกษา/อาจารย์ และอนุมัติหรือปฏิเสธคำขอสมัคร"
              stat={`รอตรวจ ${adminStats.pendingUsers}`}
            />
            <HubCard
              href="/admin/workplaces"
              icon={<Building2 className="w-5 h-5" />}
              title="จัดการสถานประกอบการ"
              description="เพิ่ม แก้ไข หรือเปิด/ปิดการแสดงผลสถานประกอบการทั้งหมดในระบบ"
              stat={`${adminStats.totalWorkplaces} แห่ง`}
            />
            <HubCard
              href="/admin/users"
              icon={<Users className="w-5 h-5" />}
              title="จัดการบัญชีผู้ใช้"
              description="ดูรายชื่อ สร้าง แก้ไข หรือลบบัญชีผู้ใช้ทั้งหมดทุกมหาวิทยาลัย"
              stat={`${adminStats.totalUsers} บัญชี`}
            />
            <HubCard
              href="/admin/comments"
              icon={<MessageSquare className="w-5 h-5" />}
              title="จัดการความคิดเห็น"
              description="ตรวจสอบและเปิด/ซ่อนความคิดเห็นและรีวิวที่ไม่เหมาะสม"
              stat={`${adminStats.totalComments} รีวิว`}
            />
          </div>
        </section>
      )}
    </div>
  );
}
