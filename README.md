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

## วิธีรันโปรเจกต์ (Quick Start)

### 1. รันฐานข้อมูล PostgreSQL ด้วย Docker
```bash
docker compose up -d postgres
```

### 2. ติดตั้งแพ็กเกจและเตรียมฐานข้อมูล (ครั้งแรกครั้งเดียว)
```bash
npm install
npm run db:setup
```

### 3. รันโหมดพัฒนา (Development Server)
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ `http://localhost:3000`

---

## วิธี Deploy แบบ Full-Stack Docker (PostgreSQL + Next.js Container)

หากต้องการนำไปเปิดหรือ Deploy บนเครื่องอื่นด้วย Docker ทั้งระบบ:
```bash
docker compose --profile fullstack up -d --build
```

---

## บัญชีสำหรับทดสอบระบบ (Demo Accounts)

| บทบาท | ชื่อผู้ใช้ (Username) | รหัสผ่าน (Password) |
| :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `admin` |
| **ครู / อาจารย์ (Teacher)** | `teacher` | `teacher` |
| **นักเรียน / นักศึกษา (Student)** | `650001` | `650001` |
