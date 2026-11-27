# UNINFO — University Internship, Career Reviews & Class Review Platform

แพลตฟอร์มรวบรวมข้อมูลสถานประกอบการฝึกงาน รีวิวสายอาชีพ รีวิวรายวิชา และระบบบันทึกการฝึกงานสำหรับนักศึกษา อาจารย์ และผู้ดูแลระบบระดับมหาวิทยาลัย  
*(พัฒนาด้วย **Next.js 15 App Router + TypeScript + Tailwind CSS + Prisma ORM + PostgreSQL Docker**)*

---

## โครงสร้างโปรเจกต์ (Project Structure)

```text
d:\Project\EstV2
├── docker/entrypoint.sh           # สคริปต์ sync Prisma schema และ auto-seed เมื่อฐานข้อมูลว่าง
├── docker-compose.yml             # Docker Compose สำหรับ PostgreSQL 16 และ Next.js Web Container
├── Dockerfile                     # Multi-stage Dockerfile สำหรับ Deploy ระบบแบบ Standalone
├── figma-plugin/                  # สคริปต์สร้างหน้าจอ Design System, Wireframes 16:9 และ Hi-Fi UI ใน Figma
├── prisma/
│   ├── schema.prisma              # โครงสร้างฐานข้อมูล PostgreSQL (University, Course, CourseReview, StudentPassedCourse, Workplace, User, InternshipRound, DailyLog, PeriodReport, Comment)
│   └── seed.ts                    # ข้อมูลตัวอย่าง 5 มหาวิทยาลัย, 20 รายวิชา, 16 สถานประกอบการ, 24 รีวิวรายวิชา
├── public/img/                    # รูปภาพรีวิวสถานประกอบการ
├── scripts/
│   ├── deploy.ps1                 # สคริปต์ pull -> build -> healthcheck -> prune สำหรับ Auto-Deploy
│   ├── auto-deploy-watch.ps1      # Watcher ตรวจจับ push/merge ใหม่เข้า main อัตโนมัติ
│   ├── install-auto-deploy-task.ps1 # ติดตั้ง Watcher เป็น Windows Scheduled Task
│   └── webhook-server.mjs         # Webhook server รองรับ GitHub push event
├── src/
│   ├── middleware.ts              # Auth-First Route Guard (บังคับเข้าสู่ระบบก่อนใช้งาน)
│   ├── app/
│   │   ├── actions.ts             # Server Actions หลัก (Auth, Workplaces, Users, Comments)
│   │   ├── course-actions.ts      # Server Actions รีวิวรายวิชา, บันทึกวิชาที่ผ่าน และ Privacy Toggle
│   │   ├── internship-actions.ts  # Server Actions รอบฝึกงาน, Daily Logbook และ Period Report
│   │   ├── login/ & register/     # หน้าเข้าสู่ระบบ และสมัครสมาชิก (เลือกมหาลัย + แนบหลักฐาน รอ Admin อนุมัติ)
│   │   ├── career-reviews/        # Career Reviews เฉพาะมหาวิทยาลัยของตนเอง พร้อมตัวกรองไอคอน
│   │   ├── internships/           # แหล่งรวบรวมสถานประกอบการที่รุ่นพี่ในมหาวิทยาลัยเคยไปฝึกงาน
│   │   ├── courses/               # Class Review (เฉพาะมหาลัย, รีวิวได้เฉพาะสาขาตนที่เรียนผ่าน, เปิด/ปิดชื่อและเกรดได้)
│   │   ├── my-career/             # ศูนย์รวมฟังก์ชันเฉพาะบทบาท (Student / Teacher / Admin / Profile)
│   │   ├── workplaces/[id]/       # รายละเอียดสถานประกอบการ รีวิว และแกลเลอรีรูปภาพ
│   │   ├── student/, teacher/, admin/ # พื้นที่ทำงานตามบทบาท
│   │   └── api/                   # REST APIs (/api/health, /api/universities, /api/courses, /api/workplaces)
│   ├── components/                # UI Components (Enlarged UNINFO Navbar, Forms, CourseReviewClient, AdminSidebar)
│   └── lib/                       # Prisma Client, JWT Auth Session, University Scope Helper, Constants
└── legacy-php/                    # โค้ด PHP เดิมที่เก็บสำรองไว้
```

---

## วิธีรันแบบ Production ด้วย Docker ทั้งระบบ (แนะนำ)

ระบบทั้งหมด (Next.js Standalone + PostgreSQL 16 + Auto `prisma db push` + Healthcheck) อยู่ใน Docker Compose เรียบร้อยแล้ว:

```bash
# 1. (ครั้งแรก) คัดลอกไฟล์สภาพแวดล้อม (ปรับค่าได้ตามต้องการ)
cp .env.example .env

# 2. บิลด์และเปิดระบบทั้งหมด (PostgreSQL + Web App)
npm run docker:up
# หรือ: docker compose up -d --build
```

- เข้าใช้งานได้ที่ `http://localhost:3000` (ระบบจะพาไปหน้า `/login` ก่อนเข้าใช้งาน)
- ตรวจสอบสถานะระบบและฐานข้อมูลได้ที่ `http://localhost:3000/api/health`
- เมื่อเปิด Container ครั้งแรก `entrypoint.sh` จะรัน `prisma db push` ให้อัตโนมัติ และหากฐานข้อมูลยังว่างอยู่ (`AUTO_SEED=true`) จะรัน `seed.ts` ให้โดยอัตโนมัติ (ไม่ลบข้อมูลเดิมที่มีอยู่แล้ว)
- ดู Log ของเว็บ: `npm run docker:logs` / หยุดระบบ: `npm run docker:down`

---

## ระบบ Auto-Deploy อัตโนมัติเมื่อมีการ Push / Merge เข้า `main`

รองรับ 2 รูปแบบ (ใช้เครื่องนี้ได้เลย ไม่ต้องมี Cloud Server):

### แบบที่ 1: Pull-based Auto-Deploy Watcher (แนะนำ — ไม่ต้องเปิด Port ออกเน็ต)
สคริปต์จะตรวจสอบ `origin/main` ทุก 30 วินาที เมื่อพบ commit ใหม่จากการ push หรือ merge จะ `git pull` -> `docker compose up -d --build` -> ตรวจ `/api/health` -> ลบ image เก่าให้อัตโนมัติ:

```bash
# รันแบบเปิดหน้าต่าง Terminal ค้างไว้
npm run deploy:watch

# หรือติดตั้งเป็น Windows Scheduled Task ให้ทำงานเบื้องหลังอัตโนมัติทุกครั้งที่เปิดเครื่อง
pwsh -File scripts/install-auto-deploy-task.ps1

# ถอนการติดตั้ง Scheduled Task
pwsh -File scripts/install-auto-deploy-task.ps1 -Uninstall
```

### แบบที่ 2: GitHub Webhook Listener (Push-triggered ทันที)
รันเซิร์ฟเวอร์รับ Webhook ที่พอร์ต `9000` (ตั้งค่า `WEBHOOK_SECRET` ใน `.env` แล้วชี้ GitHub Webhook มาที่ `POST /webhook`):

```bash
npm run deploy:webhook
```

### สั่ง Deploy ด้วยตนเองทันที
```bash
npm run deploy        # ดึง origin/main และ deploy เฉพาะเมื่อมี commit ใหม่
npm run deploy:force  # บังคับ rebuild & redeploy ทันที
```
ดูประวัติการ Deploy ได้ที่ `deploy-logs/deploy.log`

---

## วิธีรันโหมดพัฒนา (Local Dev)

```bash
docker compose up -d postgres
npm install
npm run db:setup
npm run dev
```

---

## บัญชีสำหรับทดสอบระบบ (Demo Accounts)

| บทบาท | ชื่อผู้ใช้ (Username) | รหัสผ่าน (Password) | สังกัดตัวอย่าง |
| :--- | :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin` | ส่วนกลาง (ทุกมหาวิทยาลัย) |
| **อาจารย์ที่ปรึกษา (Teacher)** | `teacher` | `teacher` | ม.อ. / คณะวิศวกรรมศาสตร์ |
| **นักศึกษา ม.อ. (Student)** | `650001` | `650001` | ม.อ. / คณะวิศวกรรมศาสตร์ / วิศวกรรมคอมพิวเตอร์ |
| **นักศึกษา มทษ. (Student)** | `650003` | `650003` | มทษ. / เทคโนโลยีสารสนเทศ |
| **นักศึกษา มจธ. (Student)** | `650004` | `650004` | มจธ. / วิทยาการคอมพิวเตอร์ |

---

## Development Log

| วันที่ | สิ่งที่ update | developer |
| :--- | :--- | :--- |
| 2026-11-23 | ย้ายและออกแบบระบบใหม่จาก PHP เดิมเป็น Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM และ PostgreSQL Docker | xanexerr |
| 2026-11-27 | เพิ่ม Dark Mode, ระบบรอบการฝึกงานหลายรอบ, Daily Logbook & Period Report, ระบบรีวิวรายวิชา, รหัสผู้ใช้ 10 หลัก, Work Mode / จังหวัด และชุดทดสอบ QA | xanexerr |
| 2026-11-27 | ปรับธีมเป็น Monochrome Black & White และเปลี่ยนฟอนต์หลักเป็น Anuphan | xanexerr |
| 2026-11-27 | ทำ Full-Stack Docker (Production Dockerfile, Entrypoint auto `db push`/seed, `/api/health`) และระบบ Local Auto-Deploy (Watcher, Task Scheduler, Webhook) | xanexerr |
| 2026-11-27 | เพิ่มสิทธิ์รีวิวรายวิชาสำหรับนักศึกษาให้รีวิวได้เฉพาะมหาวิทยาลัย คณะ สาขาของตนเอง และต้องเป็นวิชาที่เรียนผ่านแล้ว (`StudentPassedCourse`) พร้อมซิงก์ Figma Generator | xanexerr |
| 2026-11-28 | รีแบรนด์เป็น **UNINFO**: ปรับ Flow เป็น Auth-First (`middleware.ts`), ลบหน้า `/about` และ Footer, ขยาย Navbar เหลือ 4 เมนู (`Career Reviews`, `Internships`, `Class Review`, `My Career`) | xanexerr |
| 2026-11-28 | เพิ่มการแยกข้อมูลตามมหาวิทยาลัย: `Internships` และ `Career Reviews` แสดงเฉพาะสถานที่ที่นักศึกษาในมหาวิทยาลัยนั้นเคยฝึกงานหรือเพิ่มข้อมูลไว้ พร้อมเปลี่ยนตัวกรองหมวดหมู่เป็นไอคอน | xanexerr |
| 2026-11-28 | ขยายสเกล Font ให้ใหญ่ขึ้น, ปรับหน้า `/workplaces/[id]`, `/my-career`, และปรับหน้า `/courses` (1 วิชารีวิวได้หลายคน, เปิด/ปิดชื่อและเกรดได้, กล่องขั้นตอนสีฟ้า, แถบกรองไร้ตัวเลข) | xanexerr |
| 2026-11-28 | เพิ่ม Sample Data ชุดใหญ่ (5 มหาวิทยาลัย, 20 รายวิชา, 23 ผู้ใช้, 16 สถานประกอบการ, 24 รีวิวรายวิชา, 15 รีวิวบริษัท, รอบฝึกงานและ Logbook) และเพิ่ม Development Log | xanexerr |
