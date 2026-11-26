import {
  PrismaClient,
  Role,
  AccountStatus,
  ReportCycle,
  InternshipStatus,
  ReportStatus,
  WorkMode,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PostgreSQL database for EST Platform...");

  await prisma.courseReview.deleteMany();
  await prisma.course.deleteMany();
  await prisma.periodReport.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.internshipRound.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workplace.deleteMany();
  await prisma.major.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.university.deleteMany();

  // Normalized Universities, Faculties, Majors & Courses
  const uniPsu = await prisma.university.create({
    data: { code: "01", name: "มหาวิทยาลัยสงขลานครินทร์", shortName: "ม.อ. (PSU)" },
  });
  const uniTsu = await prisma.university.create({
    data: { code: "02", name: "มหาวิทยาลัยทักษิณ", shortName: "มทษ. (TSU)" },
  });
  const uniKmutt = await prisma.university.create({
    data: {
      code: "03",
      name: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
      shortName: "มจธ. (KMUTT)",
    },
  });

  const facPsuEng = await prisma.faculty.create({
    data: { universityId: uniPsu.universityId, code: "01", name: "คณะวิศวกรรมศาสตร์" },
  });
  const facPsuSci = await prisma.faculty.create({
    data: { universityId: uniPsu.universityId, code: "02", name: "คณะวิทยาศาสตร์" },
  });
  const facTsuSci = await prisma.faculty.create({
    data: {
      universityId: uniTsu.universityId,
      code: "01",
      name: "คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล",
    },
  });
  const facKmuttSit = await prisma.faculty.create({
    data: {
      universityId: uniKmutt.universityId,
      code: "01",
      name: "คณะเทคโนโลยีสารสนเทศ",
    },
  });

  const majPsuCoe = await prisma.major.create({
    data: { facultyId: facPsuEng.facultyId, code: "COE", name: "วิศวกรรมคอมพิวเตอร์" },
  });
  const majPsuCs = await prisma.major.create({
    data: { facultyId: facPsuSci.facultyId, code: "CS", name: "วิทยาการคอมพิวเตอร์" },
  });
  const majTsuIt = await prisma.major.create({
    data: { facultyId: facTsuSci.facultyId, code: "IT", name: "เทคโนโลยีสารสนเทศ" },
  });
  const majKmuttCs = await prisma.major.create({
    data: { facultyId: facKmuttSit.facultyId, code: "CS", name: "วิทยาการคอมพิวเตอร์ (หลักสูตรภาษาอังกฤษ)" },
  });

  const cAlgo = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-211",
      courseName: "โครงสร้างข้อมูลและอัลกอริทึม (Data Structures & Algorithms)",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cWeb = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-311",
      courseName: "การพัฒนาเว็บแอปพลิเคชันสมัยใหม่ (Modern Web Development)",
      yearLevel: 3,
      credits: 3,
    },
  });
  const cDb = await prisma.course.create({
    data: {
      majorId: majPsuCs.majorId,
      courseCode: "344-221",
      courseName: "ระบบฐานข้อมูล (Database Systems)",
      yearLevel: 2,
      credits: 3,
    },
  });
  await prisma.course.createMany({
    data: [
      {
        majorId: majPsuCoe.majorId,
        courseCode: "240-101",
        courseName: "การเขียนโปรแกรมคอมพิวเตอร์เบื้องต้น",
        yearLevel: 1,
        credits: 3,
      },
      {
        majorId: majPsuCoe.majorId,
        courseCode: "240-412",
        courseName: "วิศวกรรมซอฟต์แวร์และการทดสอบระบบ",
        yearLevel: 4,
        credits: 3,
      },
      {
        majorId: majTsuIt.majorId,
        courseCode: "020-205",
        courseName: "การออกแบบประสบการณ์ผู้ใช้ (UX/UI Design)",
        yearLevel: 2,
        credits: 3,
      },
      {
        majorId: majKmuttCs.majorId,
        courseCode: "CSC210",
        courseName: "Object-Oriented Programming",
        yearLevel: 2,
        credits: 3,
      },
    ],
  });

  // Create Admin, Teacher, and a sample Pending Registration
  await prisma.user.createMany({
    data: [
      {
        userId: "admin",
        username: "admin",
        password: "admin",
        role: Role.admin,
        status: AccountStatus.approved,
        userFname: "ผู้ดูแล",
        userLname: "ระบบ",
        userTel: "0812345678",
        institution: "EST Platform",
        academicYear: "2569",
      },
      {
        userId: "teacher",
        username: "teacher",
        password: "teacher",
        role: Role.teacher,
        status: AccountStatus.approved,
        userFname: "อาจารย์",
        userLname: "ที่ปรึกษา",
        userTel: "0823456789",
        institution: "คณะวิศวกรรมศาสตร์และเทคโนโลยี",
        academicYear: "2569",
      },
      {
        userId: "670199",
        username: "670199",
        password: "password123",
        role: Role.student,
        status: AccountStatus.pending,
        userFname: "ธนกร",
        userLname: "รอตรวจสอบ",
        userTel: "0891112233",
        institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้า",
        academicYear: "2569",
        evidenceFile: "/img/1324736204.jpg",
      },
    ],
  });

  // Create workplaces with workMode (onsite / hybrid / remote) and province
  const wp1 = await prisma.workplace.create({
    data: {
      workplaceName: "บริษัท ซอฟต์แวร์โซลูชั่น จำกัด",
      workplaceAddress: "123 ถ.กาญจนวนิช ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.hybrid,
      province: "สงขลา",
      description:
        "พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript และฐานข้อมูล PostgreSQL",
      workTel: "074123456",
      userId: "teacher",
      rating: 4.8,
      show: true,
      map: "https://maps.google.com/?q=7.0086,100.4981",
    },
  });

  const wp2 = await prisma.workplace.create({
    data: {
      workplaceName: "สตูดิโอ ครีเอทีฟ ดีไซน์",
      workplaceAddress: "45/2 ถ.เพชรเกษม อ.เมือง จ.สงขลา 90110",
      workType: "ทำกราฟิก",
      workMode: WorkMode.onsite,
      province: "สงขลา",
      description:
        "ออกแบบสื่อสิ่งพิมพ์ โลโก้ แบนเนอร์โฆษณา และกราฟิกโซเชียลมีเดียด้วย Illustrator & Figma",
      workTel: "074234567",
      userId: "teacher",
      rating: 5.0,
      show: true,
      map: "https://maps.google.com/?q=7.0050,100.4747",
    },
  });

  const wp3 = await prisma.workplace.create({
    data: {
      workplaceName: "เน็ตเวิร์ค แอนด์ ซิสเต็มส์ เซอร์วิส",
      workplaceAddress: "88 ถ.ราษฎร์ยินดี อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ระบบเครือข่าย",
      workMode: WorkMode.onsite,
      province: "สงขลา",
      description:
        "ติดตั้งและดูแลระบบเครือข่ายองค์กร เซิร์ฟเวอร์ ไฟร์วอลล์ MikroTik และระบบ Cloud Infrastructure",
      workTel: "074345678",
      userId: null,
      rating: 4.5,
      show: true,
      map: "https://maps.google.com/?q=7.0012,100.4833",
    },
  });

  const wp4 = await prisma.workplace.create({
    data: {
      workplaceName: "ดิจิทัล เว็บ เอเจนซี่",
      workplaceAddress: "ทำงานแบบ Remote 100% (สำนักงานใหญ่ กรุงเทพมหานคร)",
      workType: "ทำเว็บไซต์",
      workMode: WorkMode.remote,
      province: null,
      description:
        "รับทำเว็บไซต์องค์กร ระบบ E-Commerce ด้วย React, Next.js และออกแบบ UI/UX",
      workTel: "074456789",
      userId: null,
      rating: 4.0,
      show: true,
      map: "https://maps.google.com/?q=7.0035,100.4790",
    },
  });

  await prisma.workplace.create({
    data: {
      workplaceName: "ศูนย์บริการไอที แอนด์ คอมพิวเตอร์แคร์",
      workplaceAddress: "59 ถ.ศรีภูวนารถ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ด้านบริการ",
      workMode: WorkMode.hybrid,
      province: "กรุงเทพมหานคร",
      description:
        "ซ่อมบำรุงคอมพิวเตอร์ โน้ตบุ๊ก ระบบ Helpdesk และให้คำปรึกษาปัญหาไอทีองค์กร",
      workTel: "074567890",
      userId: null,
      rating: 4.2,
      show: true,
      map: "https://maps.google.com/?q=6.9965,100.4752",
    },
  });

  // Approved students linked to workplaces
  await prisma.user.createMany({
    data: [
      {
        userId: "650001",
        username: "650001",
        password: "650001",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "สมชาย",
        userLname: "ใจดี",
        userTel: "0834567890",
        institution: "มหาวิทยาลัยสงขลานครินทร์",
        academicYear: "2569",
        workplaceId: wp1.workplaceId,
      },
      {
        userId: "650002",
        username: "650002",
        password: "650002",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "กานดา",
        userLname: "รักเรียน",
        userTel: "0845678901",
        institution: "มหาวิทยาลัยสงขลานครินทร์",
        academicYear: "2569",
        workplaceId: wp1.workplaceId,
      },
      {
        userId: "650003",
        username: "650003",
        password: "650003",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ปิติ",
        userLname: "พัฒนา",
        userTel: "0856789012",
        institution: "มหาวิทยาลัยทักษิณ",
        academicYear: "2568",
        workplaceId: wp2.workplaceId,
      },
      {
        userId: "650004",
        username: "650004",
        password: "650004",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "วีระ",
        userLname: "สายเน็ต",
        userTel: "0867890123",
        institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
        universityId: uniKmutt.universityId,
        facultyId: facKmuttSit.facultyId,
        majorId: majKmuttCs.majorId,
        academicYear: "2569",
        workplaceId: wp3.workplaceId,
      },
      {
        userId: "6901010001",
        username: "6901010001",
        password: "password123",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ณัฐพล",
        userLname: "รหัสสิบหลัก",
        userTel: "0881234567",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
        workplaceId: wp1.workplaceId,
      },
    ],
  });

  // Sample Course Reviews
  await prisma.courseReview.createMany({
    data: [
      {
        courseId: cAlgo.courseId,
        userId: "650001",
        contentRating: 5,
        workloadRating: 4,
        gradeDifficultyRating: 4,
        commentText:
          "เนื้อหาสำคัญมากสำหรับสัมภาษณ์ฝึกงาน มีโจทย์ Lab ทุกสัปดาห์แต่ทำครบแล้วเข้าใจ Tree/Graph ชัดขึ้นมาก",
        academicYear: "2568",
        semester: "1",
      },
      {
        courseId: cAlgo.courseId,
        userId: "6901010001",
        contentRating: 4,
        workloadRating: 4,
        gradeDifficultyRating: 3,
        commentText:
          "อาจารย์อธิบายละเอียด ข้อสอบกลางภาคออกแนววิเคราะห์ Big-O และเขียน Pseudo-code",
        academicYear: "2568",
        semester: "1",
      },
      {
        courseId: cWeb.courseId,
        userId: "650001",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 2,
        commentText:
          "ได้ทำโปรเจกต์ Next.js + Prisma จริง เก็บเกรดไม่ยากถ้าส่งงานครบและพรีเซนต์เดโมได้ดี",
        academicYear: "2568",
        semester: "2",
      },
      {
        courseId: cDb.courseId,
        userId: "650002",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 3,
        commentText:
          "สอน Normalization และ SQL Query แบบเข้าใจง่าย เอาไปใช้ตอนฝึกงานได้ตรงๆ เลย",
        academicYear: "2568",
        semester: "2",
      },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        userId: "650001",
        workplaceId: wp1.workplaceId,
        rating: 5.0,
        commentText:
          "พี่เลี้ยงดูแลดีมาก สอนงานตั้งแต่พื้นฐานจนขึ้นโปรเจกต์จริงได้ ได้ฝึกเขียนเว็บและจัดการฐานข้อมูลเต็มที่ครับ",
        img: "1324736204.jpg",
        show: true,
      },
      {
        userId: "650002",
        workplaceId: wp1.workplaceId,
        rating: 4.5,
        commentText:
          "บรรยากาศการทำงานเป็นกันเอง มีอุปกรณ์พร้อมให้ฝึกงาน ได้เรียนรู้ระบบงานทีมจริง",
        img: "1332867696.jpg",
        show: true,
      },
      {
        userId: "650003",
        workplaceId: wp2.workplaceId,
        rating: 5.0,
        commentText:
          "ได้ฝึกใช้ Illustrator และ Figma งานจริงของลูกค้า พี่ๆ ให้คำแนะนำเทคนิคการออกแบบดีมาก",
        img: "1842142571.jpg",
        show: true,
      },
      {
        userId: "650004",
        workplaceId: wp3.workplaceId,
        rating: 4.5,
        commentText:
          "ได้ออกหน้างานจริงเดินสาย LAN ตั้งค่า Router และ MikroTik ได้ประสบการณ์ตรงสายงานเครือข่าย",
        img: "1851054153.jpg",
        show: true,
      },
    ],
  });

  // Create multi-round internships for 650001 (Round 1 completed, Round 2 active) and 650002
  const round1 = await prisma.internshipRound.create({
    data: {
      studentId: "650001",
      workplaceId: wp4.workplaceId,
      advisorId: "teacher",
      roundNumber: 1,
      academicYear: "2568",
      semester: "summer",
      position: "Frontend Intern",
      startDate: new Date("2025-04-07T00:00:00.000Z"),
      endDate: new Date("2025-05-30T00:00:00.000Z"),
      reportCycle: ReportCycle.biweekly,
      status: InternshipStatus.completed,
    },
  });

  const round2 = await prisma.internshipRound.create({
    data: {
      studentId: "650001",
      workplaceId: wp1.workplaceId,
      advisorId: "teacher",
      roundNumber: 2,
      academicYear: "2569",
      semester: "1",
      position: "Full-Stack Developer Intern",
      startDate: new Date("2026-11-09T00:00:00.000Z"),
      endDate: new Date("2027-02-26T00:00:00.000Z"),
      reportCycle: ReportCycle.weekly,
      status: InternshipStatus.active,
    },
  });

  const roundOther = await prisma.internshipRound.create({
    data: {
      studentId: "650002",
      workplaceId: wp1.workplaceId,
      advisorId: "teacher",
      roundNumber: 1,
      academicYear: "2569",
      semester: "1",
      position: "QA & Frontend Intern",
      startDate: new Date("2026-11-09T00:00:00.000Z"),
      endDate: new Date("2027-02-26T00:00:00.000Z"),
      reportCycle: ReportCycle.biweekly,
      status: InternshipStatus.active,
    },
  });

  // Daily Logs for Round 1 (completed)
  await prisma.dailyLog.createMany({
    data: [
      {
        roundId: round1.roundId,
        workDate: new Date("2025-04-07T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "รับฟัง Onboarding โครงสร้างโปรเจกต์เว็บไซต์ลูกค้า และตั้งค่าเครื่องพัฒนา",
        knowledgeGained: "เข้าใจขั้นตอนการทำงานแบบ Agile และการใช้ Git Flow ร่วมกับทีม",
        toolsUsed: "Git, VS Code, Figma",
        hoursWorked: 8,
      },
      {
        roundId: round1.roundId,
        workDate: new Date("2025-04-14T00:00:00.000Z"),
        weekNumber: 2,
        tasksAssigned: "ขึ้นหน้า Landing Page และจัด Responsive สำหรับหน้าจอมือถือ",
        knowledgeGained: "ได้เรียนรู้การวาง Layout ด้วย Tailwind CSS Grid และ Flexbox ให้รองรับทุกหน้าจอ",
        toolsUsed: "React, Tailwind CSS, Figma",
        hoursWorked: 8,
      },
    ],
  });

  await prisma.periodReport.create({
    data: {
      roundId: round1.roundId,
      startWeek: 1,
      endWeek: 2,
      summaryText:
        "ในช่วง 2 สัปดาห์แรกได้เรียนรู้กระบวนการทำงานของทีมเอเจนซี่และขึ้นหน้า Landing Page หลักของลูกค้าเสร็จตามกำหนด",
      challenges: "ช่วงแรกยังปรับตัวกับ Git Branching ของทีมอยู่ แต่พี่เลี้ยงช่วยรีวิว PR ทำให้เข้าใจมากขึ้น",
      status: ReportStatus.reviewed,
      submittedAt: new Date("2025-04-18T10:00:00.000Z"),
      teacherFeedback: "บันทึกชัดเจนมาก พัฒนาการด้าน Frontend ดีขึ้นเร็วครับ",
      reviewedById: "teacher",
      reviewedAt: new Date("2025-04-20T09:30:00.000Z"),
    },
  });

  // Daily Logs for Round 2 (active) - Week 1 & Week 2
  await prisma.dailyLog.createMany({
    data: [
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-09T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "ติดตั้ง Docker PostgreSQL, โคลนระบบหลังบ้าน และศึกษา ER Diagram ของบริษัท",
        knowledgeGained: "เข้าใจการออกแบบ Relational Schema และการใช้ Prisma Migration",
        toolsUsed: "Docker, PostgreSQL, Prisma, VS Code",
        hoursWorked: 8,
      },
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-10T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "สร้างหน้า Authentication และ API ตรวจสอบสิทธิ์ผู้ใช้ตาม Role",
        knowledgeGained: "เรียนรู้การจัดการ Session ด้วย HTTP-only Cookie และ JWT",
        toolsUsed: "Next.js, TypeScript, JWT",
        hoursWorked: 8,
      },
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-11T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "ทำ Unit Test สำหรับฟังก์ชันคำนวณคะแนนและตรวจสอบ Input Form",
        knowledgeGained: "ได้ฝึกเขียน Test Case ครอบคลุม Edge Case ก่อนส่ง Code Review",
        toolsUsed: "TypeScript, Vitest, Git",
        hoursWorked: 7.5,
      },
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-16T00:00:00.000Z"),
        weekNumber: 2,
        tasksAssigned: "พัฒนาหน้า Dashboard แสดงตารางข้อมูลพร้อมตัวกรองและค้นหา",
        knowledgeGained: "เข้าใจการทำ Server Components ควบคู่กับ Client State ใน Next.js App Router",
        toolsUsed: "Next.js, Tailwind CSS, Prisma",
        hoursWorked: 8,
      },
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-17T00:00:00.000Z"),
        weekNumber: 2,
        tasksAssigned: "ปรับปรุง Dark Mode และตรวจสอบค่า Contrast ตามมาตรฐาน WCAG 2.1 AA",
        knowledgeGained: "เรียนรู้การใช้ CSS Custom Properties เพื่อคุมโทนสี Light/Dark แบบรวมศูนย์",
        toolsUsed: "Tailwind CSS, Chrome DevTools, Figma",
        hoursWorked: 8,
      },
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-18T00:00:00.000Z"),
        weekNumber: 2,
        tasksAssigned: "แก้บั๊กการแสดงผลบนหน้าจอมือถือ 390px และเชื่อมระบบอัปโหลดไฟล์",
        knowledgeGained: "เข้าใจการออกแบบ Touch Target 44px และการจัดการ Multipart FormData",
        toolsUsed: "Next.js, TypeScript, Chrome DevTools",
        hoursWorked: 8,
      },
    ],
  });

  // Period Reports for Round 2 (Week 1 reviewed, Week 2 submitted waiting for teacher)
  await prisma.periodReport.createMany({
    data: [
      {
        roundId: round2.roundId,
        startWeek: 1,
        endWeek: 1,
        summaryText:
          "สัปดาห์ที่ 1 สามารถตั้งค่าสภาพแวดล้อมพัฒนา (Docker + PostgreSQL) และเริ่มพัฒนาโมดูล Auth พร้อมเขียนเทสต์เบื้องต้นได้ตามแผน",
        challenges: "ติดปัญหาเรื่อง Prisma Relation ช่วงแรก แต่ศึกษาเอกสารและสอบถามพี่เลี้ยงจนแก้ไขได้",
        status: ReportStatus.reviewed,
        submittedAt: new Date("2026-11-13T17:00:00.000Z"),
        teacherFeedback: "ทำได้ดีมากครับ สัปดาห์หน้าลองเน้นเรื่อง Performance และ Responsive เพิ่มเติม",
        reviewedById: "teacher",
        reviewedAt: new Date("2026-11-14T11:00:00.000Z"),
      },
      {
        roundId: round2.roundId,
        startWeek: 2,
        endWeek: 2,
        summaryText:
          "สัปดาห์ที่ 2 พัฒนาหน้า Dashboard พร้อมระบบค้นหา กรองข้อมูล รองรับ Dark Mode และปรับ Responsive บนมือถือเรียบร้อยแล้ว",
        challenges: "ต้องปรับค่า Contrast ของข้อความรองใน Dark Mode หลายรอบเพื่อให้ผ่านเกณฑ์ AA",
        status: ReportStatus.submitted,
        submittedAt: new Date("2026-11-20T16:30:00.000Z"),
      },
    ],
  });

  // Daily Logs & Submitted Biweekly Report for 650002
  await prisma.dailyLog.createMany({
    data: [
      {
        roundId: roundOther.roundId,
        workDate: new Date("2026-11-09T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "เขียน Test Plan สำหรับระบบสมัครสมาชิกและอนุมัติบัญชีผู้ใช้",
        knowledgeGained: "เรียนรู้การออกแบบ Test Scenario ทั้ง Positive และ Negative Case",
        toolsUsed: "Notion, Google Sheets, Postman",
        hoursWorked: 8,
      },
      {
        roundId: roundOther.roundId,
        workDate: new Date("2026-11-16T00:00:00.000Z"),
        weekNumber: 2,
        tasksAssigned: "ทดสอบ API และตรวจ Bug UI ข้ามเบราว์เซอร์ Chrome และ Edge",
        knowledgeGained: "เข้าใจการรายงานบั๊กแบบมี Reproduction Steps และแนบ Log ที่ชัดเจน",
        toolsUsed: "Postman, Chrome DevTools, Jira",
        hoursWorked: 8,
      },
    ],
  });

  await prisma.periodReport.create({
    data: {
      roundId: roundOther.roundId,
      startWeek: 1,
      endWeek: 2,
      summaryText:
        "ช่วง 2 สัปดาห์แรกได้วางแผนทดสอบระบบสมัครสมาชิกและทดลองยิง API ตรวจสอบ Error Response ครบทุก Endpoint หลัก",
      challenges: "อยากขอคำแนะนำอาจารย์เรื่องการเขียน Automated E2E Test เพิ่มเติมในสัปดาห์ถัดไป",
      status: ReportStatus.submitted,
      submittedAt: new Date("2026-11-20T15:00:00.000Z"),
    },
  });

  console.log("EST Platform seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
