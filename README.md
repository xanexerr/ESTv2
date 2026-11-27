# HTC-Est-For-Internship (Next.js 15 + PostgreSQL + Docker)

ระบบรวบรวมสถานประกอบการวิชาชีพ สำหรับนักเรียน นักศึกษา ฝึกประสบการณ์วิชาชีพ แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่  
*(Restructured & Redesigned ด้วย **Next.js App Router + TypeScript + Tailwind CSS + Prisma ORM + PostgreSQL Docker** โดยอ้างอิง Design System จาก SeniorStepPass)*

---

## โครงสร้างโปรเจกต์ (Project Structure)

```text
d:\Project\EstV2
├── docker-compose.yml       # Docker Compose สำหรับ PostgreSQL 16 และ Next.js Web Container
├── Dockerfile               # Multi-stage Dockerfile สำหรับ Deploy ระบบแบบ Standalone
├── prisma/
│   ├── schema.prisma        # โครงสร้างฐานข้อมูล PostgreSQL (Workplace, User, Comment)
│   └── seed.ts              # สคริปต์สร้างข้อมูลเริ่มต้น (Users, Workplaces, Reviews)
├── public/img/              # รูปภาพโลโก้ แบนเนอร์ และรูปภาพรีวิวจากนักศึกษา
├── src/
│   ├── app/                 # Next.js App Router Pages & Server Actions
│   │   ├── actions.ts       # Server Actions ทั้งหมด (Auth, Workplaces, Users, Comments)
│   │   ├── page.tsx         # หน้าแรก (Discovery, Search, Filter, Top 3 Highlights)
│   │   ├── workplaces/[id]/ # หน้ารายละเอียดสถานประกอบการ + แกลเลอรี + รีวิว
│   │   ├── login/           # หน้าเข้าสู่ระบบ
│   │   ├── profile/         # หน้าแก้ไขข้อมูลส่วนตัว
│   │   ├── about/           # หน้าติดต่อแอดมิน / ทีมผู้พัฒนา
│   │   ├── student/         # ระบบจัดการสถานประกอบการและรีวิวของนักศึกษา
│   │   ├── teacher/         # ระบบจัดการสถานประกอบการของครู
│   │   └── admin/           # ระบบจัดการผู้ใช้ สถานประกอบการ และความคิดเห็นของแอดมิน
│   ├── components/          # Reusable UI Components (Navbar, Forms, Cards, Lightbox)
│   └── lib/                 # Prisma Client, JWT Auth Session, Constants
└── legacy-php/              # โค้ด PHP เดิมที่เก็บสำรองไว้
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

- เข้าใช้งานได้ที่ `http://localhost:3000`
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
รันเซิร์ฟเวอร์รับ Webhook ที่พอร์ต `9000` (ตั้งค่า `WEBHOOK_SECRET` ใน `.env` แล้วชี้ GitHub Webhook มาที่ `POST /webhook` ผ่าน Cloudflare Tunnel / ngrok / LAN):

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

| บทบาท | ชื่อผู้ใช้ (Username) | รหัสผ่าน (Password) |
| :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin` |
| **ครู / อาจารย์ (Teacher)** | `teacher` | `teacher` |
| **นักเรียน / นักศึกษา (Student)** | `650001` | `650001` |
