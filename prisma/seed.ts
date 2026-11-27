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
  console.log("Seeding PostgreSQL database for UNINFO Platform (Expanded Dataset)...");

  await prisma.courseReview.deleteMany();
  await prisma.studentPassedCourse.deleteMany();
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

  // =========================================================================
  // 1. Universities, Faculties, Majors & Courses
  // =========================================================================
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
  const uniCu = await prisma.university.create({
    data: { code: "04", name: "จุฬาลงกรณ์มหาวิทยาลัย", shortName: "จุฬาฯ (CU)" },
  });
  const uniKmitl = await prisma.university.create({
    data: {
      code: "05",
      name: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
      shortName: "สจล. (KMITL)",
    },
  });

  // Faculties
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
  const facCuEng = await prisma.faculty.create({
    data: { universityId: uniCu.universityId, code: "01", name: "คณะวิศวกรรมศาสตร์" },
  });
  const facKmitlIt = await prisma.faculty.create({
    data: { universityId: uniKmitl.universityId, code: "01", name: "คณะเทคโนโลยีสารสนเทศ" },
  });

  // Majors
  const majPsuCoe = await prisma.major.create({
    data: { facultyId: facPsuEng.facultyId, code: "COE", name: "วิศวกรรมคอมพิวเตอร์" },
  });
  const majPsuIe = await prisma.major.create({
    data: { facultyId: facPsuEng.facultyId, code: "IE", name: "วิศวกรรมอุตสาหการ" },
  });
  const majPsuCs = await prisma.major.create({
    data: { facultyId: facPsuSci.facultyId, code: "CS", name: "วิทยาการคอมพิวเตอร์" },
  });
  const majPsuIt = await prisma.major.create({
    data: { facultyId: facPsuSci.facultyId, code: "IT", name: "เทคโนโลยีสารสนเทศ" },
  });
  const majTsuIt = await prisma.major.create({
    data: { facultyId: facTsuSci.facultyId, code: "IT", name: "เทคโนโลยีสารสนเทศ" },
  });
  const majTsuCs = await prisma.major.create({
    data: { facultyId: facTsuSci.facultyId, code: "CS", name: "วิทยาการคอมพิวเตอร์" },
  });
  const majKmuttCs = await prisma.major.create({
    data: {
      facultyId: facKmuttSit.facultyId,
      code: "CS",
      name: "วิทยาการคอมพิวเตอร์ (หลักสูตรภาษาอังกฤษ)",
    },
  });
  const majKmuttDsi = await prisma.major.create({
    data: { facultyId: facKmuttSit.facultyId, code: "DSI", name: "นวัตกรรมบริการดิจิทัล" },
  });
  const majCuCp = await prisma.major.create({
    data: { facultyId: facCuEng.facultyId, code: "CP", name: "วิศวกรรมคอมพิวเตอร์" },
  });
  const majKmitlIt = await prisma.major.create({
    data: { facultyId: facKmitlIt.facultyId, code: "IT", name: "เทคโนโลยีสารสนเทศ" },
  });

  // Courses
  const cIntro = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-101",
      courseName: "การเขียนโปรแกรมคอมพิวเตอร์เบื้องต้น",
      yearLevel: 1,
      credits: 3,
    },
  });
  const cDiscrete = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-104",
      courseName: "คณิตศาสตร์ดิสครีตสำหรับวิศวกรรมคอมพิวเตอร์",
      yearLevel: 1,
      credits: 3,
    },
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
  const cNet = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-214",
      courseName: "เครือข่ายคอมพิวเตอร์และความปลอดภัย (Computer Networks)",
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
  const cAi = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-322",
      courseName: "ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง (AI & Machine Learning)",
      yearLevel: 3,
      credits: 3,
    },
  });
  const cSe = await prisma.course.create({
    data: {
      majorId: majPsuCoe.majorId,
      courseCode: "240-412",
      courseName: "วิศวกรรมซอฟต์แวร์และการทดสอบระบบ",
      yearLevel: 4,
      credits: 3,
    },
  });
  const cIeOps = await prisma.course.create({
    data: {
      majorId: majPsuIe.majorId,
      courseCode: "220-215",
      courseName: "การวิจัยดำเนินงานและการวิเคราะห์ระบบงาน",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cCsIntro = await prisma.course.create({
    data: {
      majorId: majPsuCs.majorId,
      courseCode: "344-111",
      courseName: "หลักการเขียนโปรแกรมเชิงวัตถุ (OOP)",
      yearLevel: 1,
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
  const cCloud = await prisma.course.create({
    data: {
      majorId: majPsuCs.majorId,
      courseCode: "344-341",
      courseName: "คลาวด์คอมพิวติ้งและ DevOps",
      yearLevel: 3,
      credits: 3,
    },
  });
  const cPsuItUx = await prisma.course.create({
    data: {
      majorId: majPsuIt.majorId,
      courseCode: "345-212",
      courseName: "การออกแบบส่วนติดต่อผู้ใช้และประสบการณ์ผู้ใช้",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cUx = await prisma.course.create({
    data: {
      majorId: majTsuIt.majorId,
      courseCode: "020-205",
      courseName: "การออกแบบประสบการณ์ผู้ใช้ (UX/UI Design)",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cTsuWeb = await prisma.course.create({
    data: {
      majorId: majTsuIt.majorId,
      courseCode: "020-308",
      courseName: "การพัฒนาเว็บแบบ Full-Stack",
      yearLevel: 3,
      credits: 3,
    },
  });
  const cTsuCs = await prisma.course.create({
    data: {
      majorId: majTsuCs.majorId,
      courseCode: "021-201",
      courseName: "อัลกอริทึมและการวิเคราะห์ความซับซ้อน",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cOop = await prisma.course.create({
    data: {
      majorId: majKmuttCs.majorId,
      courseCode: "CSC210",
      courseName: "Object-Oriented Programming",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cKmuttSec = await prisma.course.create({
    data: {
      majorId: majKmuttCs.majorId,
      courseCode: "CSC340",
      courseName: "Network & Cyber Security Fundamentals",
      yearLevel: 3,
      credits: 3,
    },
  });
  const cKmuttDsi = await prisma.course.create({
    data: {
      majorId: majKmuttDsi.majorId,
      courseCode: "INT204",
      courseName: "Service Innovation & Product Design",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cCuAlgo = await prisma.course.create({
    data: {
      majorId: majCuCp.majorId,
      courseCode: "2110-211",
      courseName: "Intro to Data Structures",
      yearLevel: 2,
      credits: 3,
    },
  });
  const cKmitlWeb = await prisma.course.create({
    data: {
      majorId: majKmitlIt.majorId,
      courseCode: "0601-201",
      courseName: "Web Technology & Cloud Deployment",
      yearLevel: 2,
      credits: 3,
    },
  });

  // =========================================================================
  // 2. Admin, Teachers & Pending Registrations
  // =========================================================================
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
        institution: "UNINFO Platform",
        academicYear: "2569",
      },
      {
        userId: "teacher",
        username: "teacher",
        password: "teacher",
        role: Role.teacher,
        status: AccountStatus.approved,
        userFname: "อาจารย์ปิยะ",
        userLname: "ที่ปรึกษา",
        userTel: "0823456789",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
      },
      {
        userId: "teacher_psu_sci",
        username: "teacher_psu_sci",
        password: "teacher",
        role: Role.teacher,
        status: AccountStatus.approved,
        userFname: "อาจารย์สุภาวดี",
        userLname: "วิทยาการ",
        userTel: "0823456790",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิทยาศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuSci.facultyId,
        majorId: majPsuCs.majorId,
        academicYear: "2569",
      },
      {
        userId: "teacher_tsu",
        username: "teacher_tsu",
        password: "teacher",
        role: Role.teacher,
        status: AccountStatus.approved,
        userFname: "อาจารย์วรพจน์",
        userLname: "ทักษิณ",
        userTel: "0823456791",
        institution: "มหาวิทยาลัยทักษิณ / คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล",
        universityId: uniTsu.universityId,
        facultyId: facTsuSci.facultyId,
        majorId: majTsuIt.majorId,
        academicYear: "2569",
      },
      {
        userId: "teacher_kmutt",
        username: "teacher_kmutt",
        password: "teacher",
        role: Role.teacher,
        status: AccountStatus.approved,
        userFname: "อาจารย์ดนัย",
        userLname: "บางมด",
        userTel: "0823456792",
        institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี / คณะเทคโนโลยีสารสนเทศ",
        universityId: uniKmutt.universityId,
        facultyId: facKmuttSit.facultyId,
        majorId: majKmuttCs.majorId,
        academicYear: "2569",
      },
      // Pending approval queue
      {
        userId: "670199",
        username: "670199",
        password: "password123",
        role: Role.student,
        status: AccountStatus.pending,
        userFname: "ธนกร",
        userLname: "รอตรวจสอบ",
        userTel: "0891112233",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
        evidenceFile: "/img/1324736204.jpg",
      },
      {
        userId: "6901010002",
        username: "6901010002",
        password: "password123",
        role: Role.student,
        status: AccountStatus.pending,
        userFname: "ภัทรพล",
        userLname: "ยืนยันตัวตน",
        userTel: "0892223344",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
        evidenceFile: "/img/1332867696.jpg",
      },
      {
        userId: "6903010001",
        username: "6903010001",
        password: "password123",
        role: Role.teacher,
        status: AccountStatus.pending,
        userFname: "อาจารย์พิมพ์ชนก",
        userLname: "สมัครใหม่",
        userTel: "0893334455",
        institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี / คณะเทคโนโลยีสารสนเทศ",
        universityId: uniKmutt.universityId,
        facultyId: facKmuttSit.facultyId,
        majorId: majKmuttDsi.majorId,
        academicYear: "2569",
        evidenceFile: "/img/1842142571.jpg",
      },
    ],
  });

  // =========================================================================
  // 3. Workplaces (16 Companies covering all 5 Work Types & 3 Work Modes)
  // =========================================================================
  const wp1 = await prisma.workplace.create({
    data: {
      workplaceName: "บริษัท ซอฟต์แวร์โซลูชั่น จำกัด",
      workplaceAddress: "123 ถ.กาญจนวนิช ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.hybrid,
      province: "สงขลา",
      description:
        "พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript และฐานข้อมูล PostgreSQL พร้อมระบบ CI/CD",
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
      userId: "teacher_tsu",
      rating: 4.9,
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
      userId: "teacher_kmutt",
      rating: 4.6,
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
        "รับทำเว็บไซต์องค์กร ระบบ E-Commerce ด้วย React, Next.js, Tailwind CSS และออกแบบ UI/UX",
      workTel: "024456789",
      userId: null,
      rating: 4.5,
      show: true,
      map: "https://maps.google.com/?q=13.7563,100.5018",
    },
  });

  const wp5 = await prisma.workplace.create({
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

  // Additional PSU Workplaces across all 5 workTypes & provinces
  const wp6 = await prisma.workplace.create({
    data: {
      workplaceName: "บลูโอเชี่ยน คลาวด์ เน็ตเวิร์ค",
      workplaceAddress: "210 อุทยานวิทยาศาสตร์ ม.อ. ต.ทุ่งใหญ่ อ.หาดใหญ่ จ.สงขลา",
      workType: "ระบบเครือข่าย",
      workMode: WorkMode.onsite,
      province: "สงขลา",
      description:
        "ดูแลระบบ Data Center, Linux Server, Docker/Kubernetes และระบบ Monitoring สำหรับองค์กรภาคใต้",
      workTel: "074889900",
      userId: null,
      rating: 4.7,
      show: true,
      map: "https://maps.google.com/?q=6.9990,100.5120",
    },
  });

  const wp7 = await prisma.workplace.create({
    data: {
      workplaceName: "ไบรท์ พิกเซล ครีเอทีฟ สตูดิโอ",
      workplaceAddress: "99 อาคารสีลมคอมเพล็กซ์ เขตบางรัก กรุงเทพมหานคร 10500",
      workType: "ทำกราฟิก",
      workMode: WorkMode.hybrid,
      province: "กรุงเทพมหานคร",
      description:
        "ออกแบบ Visual Design, Brand Identity, Motion Graphic และต้นแบบ UI บน Figma สำหรับแอปพลิเคชัน",
      workTel: "026311223",
      userId: null,
      rating: 4.4,
      show: true,
      map: "https://maps.google.com/?q=13.7285,100.5350",
    },
  });

  const wp8 = await prisma.workplace.create({
    data: {
      workplaceName: "เซาท์เทิร์น ไอที เซอร์วิส แอนด์ ซัพพอร์ต",
      workplaceAddress: "33/4 ถ.ศุภสารรังสรรค์ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ด้านบริการ",
      workMode: WorkMode.onsite,
      province: "สงขลา",
      description:
        "ดูแลระบบ IT Support โรงพยาบาลและสถาบันการศึกษา ติดตั้ง POS และแก้ไขปัญหาระบบหน้างาน",
      workTel: "074223344",
      userId: null,
      rating: 4.3,
      show: true,
      map: "https://maps.google.com/?q=7.0072,100.4795",
    },
  });

  const wp9 = await prisma.workplace.create({
    data: {
      workplaceName: "เอเพ็กซ์ เอไอ แล็บส์ (ประเทศไทย)",
      workplaceAddress: "ทำงานแบบ Remote 100% (ทีมวิศวกรซอฟต์แวร์กระจายทั่วประเทศ)",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.remote,
      province: null,
      description:
        "พัฒนาระบบ AI Chatbot, LLM Pipeline ด้วย Python FastAPI, TypeScript และ Vector Database",
      workTel: "021122334",
      userId: null,
      rating: 4.9,
      show: true,
      map: "https://maps.google.com/?q=13.7465,100.5345",
    },
  });

  const wp10 = await prisma.workplace.create({
    data: {
      workplaceName: "ฟินเทค อินโนเวชั่น กรุ๊ป",
      workplaceAddress: "77 ถ.รัชดาภิเษก เขตห้วยขวาง กรุงเทพมหานคร 10310",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.hybrid,
      province: "กรุงเทพมหานคร",
      description:
        "พัฒนาบริการ Mobile Banking API และ Microservices ด้วย Go, Node.js, PostgreSQL และ Kafka",
      workTel: "029988776",
      userId: null,
      rating: 4.6,
      show: true,
      map: "https://maps.google.com/?q=13.7650,100.5700",
    },
  });

  const wp11 = await prisma.workplace.create({
    data: {
      workplaceName: "อันดามัน ดิจิทัล เว็บ สตูดิโอ",
      workplaceAddress: "145 ถ.เยาวราช ต.ตลาดใหญ่ อ.เมือง จ.ภูเก็ต 83000",
      workType: "ทำเว็บไซต์",
      workMode: WorkMode.onsite,
      province: "ภูเก็ต",
      description:
        "สร้างเว็บไซต์โรงแรม ระบบจองห้องพักออนไลน์ และ SEO Performance Optimization ด้วย Next.js",
      workTel: "076211334",
      userId: null,
      rating: 4.5,
      show: true,
      map: "https://maps.google.com/?q=7.8804,98.3923",
    },
  });

  // TSU-only Workplaces
  const wp12 = await prisma.workplace.create({
    data: {
      workplaceName: "ทักษิณ ซอฟต์เวิร์คส์",
      workplaceAddress: "12 ถ.ราเมศวร์ ต.คูหาสวรรค์ อ.เมือง จ.พัทลุง 93000",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.onsite,
      province: "พัทลุง",
      description:
        "พัฒนาระบบ ERP สำหรับสหกรณ์การเกษตรและโรงงานแปรรูปภาคใต้ด้วย Laravel และ Vue.js",
      workTel: "074612345",
      userId: null,
      rating: 4.5,
      show: true,
      map: "https://maps.google.com/?q=7.6167,100.0740",
    },
  });

  const wp13 = await prisma.workplace.create({
    data: {
      workplaceName: "โค้ดคราฟต์ รีโมท สตูดิโอ",
      workplaceAddress: "ทำงานแบบ Remote 100%",
      workType: "ทำเว็บไซต์",
      workMode: WorkMode.remote,
      province: null,
      description:
        "ออกแบบและพัฒนา Landing Page และ Web Application สำหรับลูกค้า SME ทั่วประเทศ",
      workTel: "0819988776",
      userId: null,
      rating: 4.7,
      show: true,
      map: "https://maps.google.com/?q=7.1756,100.6143",
    },
  });

  // KMUTT-only Workplaces
  const wp14 = await prisma.workplace.create({
    data: {
      workplaceName: "สยาม ไซเบอร์ ซิเคียวริตี้",
      workplaceAddress: "25 อาคารสาทรซิตี้ เขตสาทร กรุงเทพมหานคร 10120",
      workType: "ระบบเครือข่าย",
      workMode: WorkMode.hybrid,
      province: "กรุงเทพมหานคร",
      description:
        "ทดสอบเจาะระบบ (Pentest), Security Operations Center (SOC) และตรวจสอบช่องโหว่เว็บแอป",
      workTel: "026778899",
      userId: null,
      rating: 4.8,
      show: true,
      map: "https://maps.google.com/?q=13.7220,100.5310",
    },
  });

  const wp15 = await prisma.workplace.create({
    data: {
      workplaceName: "กสิกร เทคโนโลยี พาร์ทเนอร์",
      workplaceAddress: "400/22 ถ.พหลโยธิน เขตพญาไท กรุงเทพมหานคร 10400",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.hybrid,
      province: "กรุงเทพมหานคร",
      description:
        "พัฒนาแพลตฟอร์ม Cloud Native, Automated Testing และ Financial Microservices",
      workTel: "028889900",
      userId: null,
      rating: 4.9,
      show: true,
      map: "https://maps.google.com/?q=13.7820,100.5460",
    },
  });

  // CU-only Workplace
  const wp16 = await prisma.workplace.create({
    data: {
      workplaceName: "จามจุรี ดิจิทัล เวนเจอร์",
      workplaceAddress: "101 ถ.พญาไท เขตปทุมวัน กรุงเทพมหานคร 10330",
      workType: "เขียนโปรแกรม",
      workMode: WorkMode.hybrid,
      province: "กรุงเทพมหานคร",
      description:
        "วิจัยและพัฒนา Deep Tech Product, Data Engineering และ Distributed Systems",
      workTel: "022150888",
      userId: null,
      rating: 4.8,
      show: true,
      map: "https://maps.google.com/?q=13.7384,100.5320",
    },
  });

  // =========================================================================
  // 4. Approved Students across Universities
  // =========================================================================
  await prisma.user.createMany({
    data: [
      // PSU Students (COE & CS & IT & IE)
      {
        userId: "650001",
        username: "650001",
        password: "650001",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "สมชาย",
        userLname: "ใจดี",
        userTel: "0834567890",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
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
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิทยาศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuSci.facultyId,
        majorId: majPsuCs.majorId,
        academicYear: "2569",
        workplaceId: wp1.workplaceId,
      },
      {
        userId: "650005",
        username: "650005",
        password: "650005",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "สุธิดา",
        userLname: "มุ่งมั่น",
        userTel: "0876543210",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
        workplaceId: wp9.workplaceId,
      },
      {
        userId: "650006",
        username: "650006",
        password: "650006",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ภูริพัฒน์",
        userLname: "สายระบบ",
        userTel: "0861112233",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
        workplaceId: wp6.workplaceId,
      },
      {
        userId: "650007",
        username: "650007",
        password: "650007",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "พิมพ์มาดา",
        userLname: "ศิลป์ดี",
        userTel: "0862223344",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิทยาศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuSci.facultyId,
        majorId: majPsuIt.majorId,
        academicYear: "2569",
        workplaceId: wp7.workplaceId,
      },
      {
        userId: "650008",
        username: "650008",
        password: "650008",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "นนทวัฒน์",
        userLname: "บริการดี",
        userTel: "0863334455",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2568",
        workplaceId: wp8.workplaceId,
      },
      {
        userId: "650009",
        username: "650009",
        password: "650009",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "วรัญญา",
        userLname: "ฟินเทค",
        userTel: "0864445566",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิทยาศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuSci.facultyId,
        majorId: majPsuCs.majorId,
        academicYear: "2569",
        workplaceId: wp10.workplaceId,
      },
      {
        userId: "650010",
        username: "650010",
        password: "650010",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "กิตติศักดิ์",
        userLname: "ภูเก็ตเว็บ",
        userTel: "0865556677",
        institution: "มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์",
        universityId: uniPsu.universityId,
        facultyId: facPsuEng.facultyId,
        majorId: majPsuCoe.majorId,
        academicYear: "2569",
        workplaceId: wp11.workplaceId,
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
      // TSU Students
      {
        userId: "650003",
        username: "650003",
        password: "650003",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ปิติ",
        userLname: "พัฒนา",
        userTel: "0856789012",
        institution: "มหาวิทยาลัยทักษิณ / คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล",
        universityId: uniTsu.universityId,
        facultyId: facTsuSci.facultyId,
        majorId: majTsuIt.majorId,
        academicYear: "2568",
        workplaceId: wp2.workplaceId,
      },
      {
        userId: "650011",
        username: "650011",
        password: "650011",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ชลธิชา",
        userLname: "ทักษิณโค้ด",
        userTel: "0856789013",
        institution: "มหาวิทยาลัยทักษิณ / คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล",
        universityId: uniTsu.universityId,
        facultyId: facTsuSci.facultyId,
        majorId: majTsuCs.majorId,
        academicYear: "2569",
        workplaceId: wp12.workplaceId,
      },
      // KMUTT Students
      {
        userId: "650004",
        username: "650004",
        password: "650004",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "วีระ",
        userLname: "สายเน็ต",
        userTel: "0867890123",
        institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี / คณะเทคโนโลยีสารสนเทศ",
        universityId: uniKmutt.universityId,
        facultyId: facKmuttSit.facultyId,
        majorId: majKmuttCs.majorId,
        academicYear: "2569",
        workplaceId: wp3.workplaceId,
      },
      {
        userId: "650012",
        username: "650012",
        password: "650012",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ธนาธิป",
        userLname: "บางมดเทค",
        userTel: "0867890124",
        institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี / คณะเทคโนโลยีสารสนเทศ",
        universityId: uniKmutt.universityId,
        facultyId: facKmuttSit.facultyId,
        majorId: majKmuttCs.majorId,
        academicYear: "2569",
        workplaceId: wp15.workplaceId,
      },
      // CU & KMITL Students
      {
        userId: "6904010001",
        username: "6904010001",
        password: "password123",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ปณิธาน",
        userLname: "จามจุรี",
        userTel: "0817778899",
        institution: "จุฬาลงกรณ์มหาวิทยาลัย / คณะวิศวกรรมศาสตร์",
        universityId: uniCu.universityId,
        facultyId: facCuEng.facultyId,
        majorId: majCuCp.majorId,
        academicYear: "2569",
        workplaceId: wp16.workplaceId,
      },
      {
        userId: "6905010001",
        username: "6905010001",
        password: "password123",
        role: Role.student,
        status: AccountStatus.approved,
        userFname: "ศิริพร",
        userLname: "ลาดกระบัง",
        userTel: "0818889900",
        institution: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง / คณะเทคโนโลยีสารสนเทศ",
        universityId: uniKmitl.universityId,
        facultyId: facKmitlIt.facultyId,
        majorId: majKmitlIt.majorId,
        academicYear: "2569",
        workplaceId: wp5.workplaceId,
      },
    ],
  });

  // =========================================================================
  // 5. Passed Courses (each student passes courses in their own Uni/Fac/Major)
  // =========================================================================
  await prisma.studentPassedCourse.createMany({
    data: [
      // 650001 (PSU COE)
      { userId: "650001", courseId: cIntro.courseId, grade: "A", academicYear: "2567", semester: "1" },
      { userId: "650001", courseId: cDiscrete.courseId, grade: "B", academicYear: "2567", semester: "2" },
      { userId: "650001", courseId: cAlgo.courseId, grade: "B+", academicYear: "2568", semester: "1" },
      { userId: "650001", courseId: cNet.courseId, grade: "B+", academicYear: "2568", semester: "1" },
      { userId: "650001", courseId: cWeb.courseId, grade: "A", academicYear: "2568", semester: "2" },
      // 6901010001 (PSU COE)
      { userId: "6901010001", courseId: cIntro.courseId, grade: "A", academicYear: "2568", semester: "1" },
      { userId: "6901010001", courseId: cAlgo.courseId, grade: "B+", academicYear: "2568", semester: "2" },
      { userId: "6901010001", courseId: cNet.courseId, grade: "A", academicYear: "2568", semester: "2" },
      // 650005 (PSU COE)
      { userId: "650005", courseId: cIntro.courseId, grade: "A", academicYear: "2567", semester: "1" },
      { userId: "650005", courseId: cAlgo.courseId, grade: "A", academicYear: "2568", semester: "1" },
      { userId: "650005", courseId: cWeb.courseId, grade: "A", academicYear: "2568", semester: "2" },
      { userId: "650005", courseId: cAi.courseId, grade: "B+", academicYear: "2568", semester: "2" },
      // 650006 (PSU COE)
      { userId: "650006", courseId: cIntro.courseId, grade: "B+", academicYear: "2567", semester: "1" },
      { userId: "650006", courseId: cAlgo.courseId, grade: "B", academicYear: "2568", semester: "1" },
      { userId: "650006", courseId: cNet.courseId, grade: "A", academicYear: "2568", semester: "1" },
      { userId: "650006", courseId: cSe.courseId, grade: "B+", academicYear: "2569", semester: "1" },
      // 650008 (PSU COE)
      { userId: "650008", courseId: cIntro.courseId, grade: "B", academicYear: "2567", semester: "1" },
      { userId: "650008", courseId: cWeb.courseId, grade: "B+", academicYear: "2568", semester: "2" },
      // 650010 (PSU COE)
      { userId: "650010", courseId: cWeb.courseId, grade: "A", academicYear: "2568", semester: "2" },
      { userId: "650010", courseId: cAi.courseId, grade: "B", academicYear: "2568", semester: "2" },
      // PSU CS & IT
      { userId: "650002", courseId: cCsIntro.courseId, grade: "A", academicYear: "2567", semester: "1" },
      { userId: "650002", courseId: cDb.courseId, grade: "B+", academicYear: "2568", semester: "1" },
      { userId: "650002", courseId: cCloud.courseId, grade: "A", academicYear: "2568", semester: "2" },
      { userId: "650009", courseId: cDb.courseId, grade: "A", academicYear: "2568", semester: "1" },
      { userId: "650009", courseId: cCloud.courseId, grade: "B+", academicYear: "2568", semester: "2" },
      { userId: "650007", courseId: cPsuItUx.courseId, grade: "A", academicYear: "2568", semester: "1" },
      // TSU
      { userId: "650003", courseId: cUx.courseId, grade: "A", academicYear: "2568", semester: "1" },
      { userId: "650003", courseId: cTsuWeb.courseId, grade: "B+", academicYear: "2568", semester: "2" },
      { userId: "650011", courseId: cTsuCs.courseId, grade: "A", academicYear: "2568", semester: "1" },
      // KMUTT
      { userId: "650004", courseId: cOop.courseId, grade: "B", academicYear: "2568", semester: "2" },
      { userId: "650004", courseId: cKmuttSec.courseId, grade: "A", academicYear: "2568", semester: "2" },
      { userId: "650012", courseId: cOop.courseId, grade: "A", academicYear: "2568", semester: "1" },
      // CU & KMITL
      { userId: "6904010001", courseId: cCuAlgo.courseId, grade: "A", academicYear: "2568", semester: "1" },
      { userId: "6905010001", courseId: cKmitlWeb.courseId, grade: "B+", academicYear: "2568", semester: "2" },
    ],
  });

  // =========================================================================
  // 6. Course Reviews (Multiple reviewers per course + Show/Hide Name & Grade)
  // =========================================================================
  await prisma.courseReview.createMany({
    data: [
      // 240-101 Intro (3 reviews)
      {
        courseId: cIntro.courseId,
        userId: "650001",
        contentRating: 5,
        workloadRating: 2,
        gradeDifficultyRating: 2,
        commentText:
          "ปูพื้นฐาน Logic และ Syntax ได้ดีมาก เหมาะกับคนที่ยังไม่เคยเขียนโค้ดมาก่อนเลย ส่ง Lab ครบเก็บ A ได้ไม่ยาก",
        academicYear: "2567",
        semester: "1",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cIntro.courseId,
        userId: "650005",
        contentRating: 4,
        workloadRating: 3,
        gradeDifficultyRating: 2,
        commentText:
          "แบบฝึกหัดท้ายคาบช่วยฝึกคิดเป็นขั้นเป็นตอน มีพี่ TA คอยช่วยตลอด",
        academicYear: "2567",
        semester: "1",
        showName: false,
        showGrade: true,
      },
      {
        courseId: cIntro.courseId,
        userId: "6901010001",
        contentRating: 5,
        workloadRating: 2,
        gradeDifficultyRating: 1,
        commentText:
          "เนื้อหาเป็นกันเอง เข้าใจง่าย ถ้ารีบทำโจทย์ Lab ก่อนส่งจะไม่ค้างงานเลย",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: false,
      },

      // 240-211 Algorithms (4 reviews)
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
        showName: true,
        showGrade: true,
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
        semester: "2",
        showName: false,
        showGrade: true,
      },
      {
        courseId: cAlgo.courseId,
        userId: "650005",
        contentRating: 5,
        workloadRating: 5,
        gradeDifficultyRating: 4,
        commentText:
          "งานค่อนข้างหนักช่วง Dynamic Programming & Shortest Path แต่คุ้มมากตอนไปสอบ Coding Test บริษัทใหญ่",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: false,
      },
      {
        courseId: cAlgo.courseId,
        userId: "650006",
        contentRating: 4,
        workloadRating: 4,
        gradeDifficultyRating: 4,
        commentText:
          "ต้องฝึกเขียน C++/Python จับเวลาด้วยตัวเองเพิ่ม ข้อสอบปลายภาคออกประยุกต์หลายเรื่องรวมกัน",
        academicYear: "2568",
        semester: "1",
        showName: false,
        showGrade: false,
      },

      // 240-214 Computer Networks (2 reviews)
      {
        courseId: cNet.courseId,
        userId: "650001",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 3,
        commentText:
          "ได้ลองตั้งค่า Packet Tracer, Subnetting และวิเคราะห์ Wireshark จริง มีประโยชน์ตอนฝึกงานมาก",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cNet.courseId,
        userId: "650006",
        contentRating: 5,
        workloadRating: 4,
        gradeDifficultyRating: 3,
        commentText:
          "เข้าใจ TCP/IP, DNS, Firewall และ Routing ชัดเจนขึ้นเยอะ ข้อสอบเน้นทำความเข้าใจไม่เน้นท่องจำ",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: true,
      },

      // 240-311 Modern Web Development (4 reviews)
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
        showName: true,
        showGrade: true,
      },
      {
        courseId: cWeb.courseId,
        userId: "650005",
        contentRating: 5,
        workloadRating: 4,
        gradeDifficultyRating: 3,
        commentText:
          "วิชานี้ได้ฝึกทำระบบจริงทั้ง Frontend และ Backend เป็นทีม ช่วยเตรียมความพร้อมก่อนออกฝึกงานได้ดีมาก",
        academicYear: "2568",
        semester: "2",
        showName: true,
        showGrade: false,
      },
      {
        courseId: cWeb.courseId,
        userId: "650008",
        contentRating: 4,
        workloadRating: 4,
        gradeDifficultyRating: 2,
        commentText:
          "โปรเจกต์กลุ่มสนุก ได้เรียนรู้ Docker กับ REST API เต็มๆ เหมาะใช้เป็น Portfolio สมัครฝึกงาน",
        academicYear: "2568",
        semester: "2",
        showName: false,
        showGrade: true,
      },
      {
        courseId: cWeb.courseId,
        userId: "650010",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 2,
        commentText:
          "อาจารย์ให้เลือก Tech Stack เองได้อิสระ เน้นแก้ปัญหาจริงและการ Deploy ขึ้นใช้งาน",
        academicYear: "2568",
        semester: "2",
        showName: true,
        showGrade: true,
      },

      // 240-322 AI & ML (2 reviews)
      {
        courseId: cAi.courseId,
        userId: "650005",
        contentRating: 5,
        workloadRating: 4,
        gradeDifficultyRating: 4,
        commentText:
          "ปูพื้นฐาน Linear Algebra, Scikit-Learn จนถึง Neural Networks ต้องขยันทำ Notebook ทุกสัปดาห์",
        academicYear: "2568",
        semester: "2",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cAi.courseId,
        userId: "650010",
        contentRating: 4,
        workloadRating: 5,
        gradeDifficultyRating: 4,
        commentText:
          "โปรเจกต์เทรนโมเดลสนุกแต่ใช้เวลาทดลองปรับ Hyperparameter เยอะ เตรียม GPU/Colab ไว้ล่วงหน้าจะช่วยได้มาก",
        academicYear: "2568",
        semester: "2",
        showName: false,
        showGrade: true,
      },

      // 344-221 Database Systems (2 reviews)
      {
        courseId: cDb.courseId,
        userId: "650002",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 3,
        commentText:
          "สอน Normalization และ SQL Query แบบเข้าใจง่าย เอาไปใช้ตอนฝึกงานได้ตรงๆ เลย",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cDb.courseId,
        userId: "650009",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 2,
        commentText:
          "ได้ออกแบบ ER Diagram จริงและเรียนรู้เรื่อง Indexing + Transaction อย่างละเอียด",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: true,
      },

      // 344-341 Cloud & DevOps (2 reviews)
      {
        courseId: cCloud.courseId,
        userId: "650002",
        contentRating: 5,
        workloadRating: 4,
        gradeDifficultyRating: 3,
        commentText:
          "สอน Docker, Compose, GitHub Actions และ Cloud Architecture แบบจับมือทำ เอาไปใช้ทำงานจริงได้เลย",
        academicYear: "2568",
        semester: "2",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cCloud.courseId,
        userId: "650009",
        contentRating: 4,
        workloadRating: 4,
        gradeDifficultyRating: 3,
        commentText:
          "Lab สนุกมาก ได้ลองตั้งค่า Reverse Proxy และ Container Monitoring จริง",
        academicYear: "2568",
        semester: "2",
        showName: false,
        showGrade: true,
      },

      // TSU, KMUTT, CU, KMITL reviews
      {
        courseId: cUx.courseId,
        userId: "650003",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 2,
        commentText:
          "ได้ฝึก User Interview, Wireframing และทำ Prototype บน Figma เป็นระบบมาก",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cOop.courseId,
        userId: "650004",
        contentRating: 5,
        workloadRating: 4,
        gradeDifficultyRating: 3,
        commentText:
          "Solid OOP principles in Java/TypeScript with clean design pattern labs.",
        academicYear: "2568",
        semester: "2",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cOop.courseId,
        userId: "650012",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 3,
        commentText:
          "โปรเจกต์จบคาบช่วยฝึกแยก Responsibility ของคลาสได้ดีมาก",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: false,
      },
      {
        courseId: cCuAlgo.courseId,
        userId: "6904010001",
        contentRating: 5,
        workloadRating: 5,
        gradeDifficultyRating: 4,
        commentText:
          "โจทย์ Grader ท้าทายมากแต่ทำให้เขียนโค้ดแม่นยำขึ้นหลายเท่า",
        academicYear: "2568",
        semester: "1",
        showName: true,
        showGrade: true,
      },
      {
        courseId: cKmitlWeb.courseId,
        userId: "6905010001",
        contentRating: 5,
        workloadRating: 3,
        gradeDifficultyRating: 2,
        commentText:
          "เรียนสนุก ได้ทำระบบเว็บพร้อมเชื่อม Docker Deployment ตั้งแต่ปี 2",
        academicYear: "2568",
        semester: "2",
        showName: true,
        showGrade: true,
      },
    ],
  });

  // =========================================================================
  // 7. Workplace Reviews (Comments)
  // =========================================================================
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
          "บรรยากาศการทำงานเป็นกันเอง มีอุปกรณ์พร้อมให้ฝึกงาน ได้เรียนรู้ระบบงานทีมจริงและการทำ QA ร่วมกับทีม Dev",
        img: "1332867696.jpg",
        show: true,
      },
      {
        userId: "6901010001",
        workplaceId: wp1.workplaceId,
        rating: 5.0,
        commentText:
          "ได้ร่วมประชุม Sprint Planning และ Code Review ทุกสัปดาห์ พัฒนาทักษะ TypeScript เร็วมาก",
        show: true,
      },
      {
        userId: "650005",
        workplaceId: wp9.workplaceId,
        rating: 5.0,
        commentText:
          "ทำงาน Remote 100% ยืดหยุ่นสูงมาก พี่ๆ ทีม AI เก่งและให้ Feedback เร็ว ได้ทำฟีเจอร์ RAG Chatbot จริง",
        img: "1842142571.jpg",
        show: true,
      },
      {
        userId: "650006",
        workplaceId: wp6.workplaceId,
        rating: 4.7,
        commentText:
          "ได้ลงมือตั้งค่า Linux Server, Docker Swarm และระบบ Network Security หน้างานจริง คุ้มค่ามาก",
        img: "1851054153.jpg",
        show: true,
      },
      {
        userId: "650007",
        workplaceId: wp7.workplaceId,
        rating: 4.4,
        commentText:
          "ได้ออกแบบ UI Kit และทำแคมเปญกราฟิกลงสื่อจริง พี่ Art Director แนะนำละเอียดมาก",
        show: true,
      },
      {
        userId: "650008",
        workplaceId: wp8.workplaceId,
        rating: 4.3,
        commentText:
          "ได้ประสบการณ์แก้ปัญหา Helpdesk หน้างานและการสื่อสารกับผู้ใช้งานจริง ฝึกความคล่องตัวได้ดี",
        show: true,
      },
      {
        userId: "650009",
        workplaceId: wp10.workplaceId,
        rating: 4.6,
        commentText:
          "ระบบใหญ่และมีมาตรฐานดีมาก ได้เรียนรู้เรื่อง Transaction Safety และ Automated Test เต็มรูปแบบ",
        show: true,
      },
      {
        userId: "650010",
        workplaceId: wp11.workplaceId,
        rating: 4.5,
        commentText:
          "ทีมเล็กแต่อบอุ่น ได้ทำเว็บ Booking ให้โรงแรมในภูเก็ตจริงตั้งแต่ Design ยันขึ้น Production",
        show: true,
      },
      // TSU Comments
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
        userId: "650011",
        workplaceId: wp12.workplaceId,
        rating: 4.5,
        commentText:
          "ได้พัฒนาระบบบัญชีและคลังสินค้าให้สหกรณ์จริง เข้าใจ Business Logic เต็มๆ",
        show: true,
      },
      // KMUTT Comments
      {
        userId: "650004",
        workplaceId: wp3.workplaceId,
        rating: 4.5,
        commentText:
          "ได้ออกหน้างานจริงเดินสาย LAN ตั้งค่า Router และ MikroTik ได้ประสบการณ์ตรงสายงานเครือข่าย",
        img: "1851054153.jpg",
        show: true,
      },
      {
        userId: "650012",
        workplaceId: wp15.workplaceId,
        rating: 4.9,
        commentText:
          "สภาพแวดล้อมระดับองค์กรชั้นนำ มี Bootcamp ให้ก่อนเริ่มโปรเจกต์จริงและเบี้ยเลี้ยงดีมาก",
        show: true,
      },
      // CU & KMITL Comments
      {
        userId: "6904010001",
        workplaceId: wp16.workplaceId,
        rating: 4.8,
        commentText:
          "ได้ทำโปรเจกต์ Data Pipeline จริงกับทีมวิศวกรรุ่นพี่ พี่เลี้ยงใส่ใจมาก",
        show: true,
      },
      {
        userId: "6905010001",
        workplaceId: wp5.workplaceId,
        rating: 4.2,
        commentText:
          "ได้ฝึกซ่อมบำรุงและวางระบบเครือข่ายสำนักงานขนาดเล็กครบวงจร",
        show: true,
      },
    ],
  });

  // =========================================================================
  // 8. Multi-round Internships, Daily Logs & Period Reports
  // =========================================================================
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
      advisorId: "teacher_psu_sci",
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

  const roundAi = await prisma.internshipRound.create({
    data: {
      studentId: "650005",
      workplaceId: wp9.workplaceId,
      advisorId: "teacher",
      roundNumber: 1,
      academicYear: "2569",
      semester: "1",
      position: "AI Engineering Intern",
      startDate: new Date("2026-11-09T00:00:00.000Z"),
      endDate: new Date("2027-02-26T00:00:00.000Z"),
      reportCycle: ReportCycle.weekly,
      status: InternshipStatus.active,
    },
  });

  const roundNet = await prisma.internshipRound.create({
    data: {
      studentId: "650006",
      workplaceId: wp6.workplaceId,
      advisorId: "teacher",
      roundNumber: 1,
      academicYear: "2569",
      semester: "1",
      position: "Cloud & DevOps Intern",
      startDate: new Date("2026-11-09T00:00:00.000Z"),
      endDate: new Date("2027-02-26T00:00:00.000Z"),
      reportCycle: ReportCycle.weekly,
      status: InternshipStatus.active,
    },
  });

  const roundTsu = await prisma.internshipRound.create({
    data: {
      studentId: "650003",
      workplaceId: wp13.workplaceId,
      advisorId: "teacher_tsu",
      roundNumber: 1,
      academicYear: "2568",
      semester: "2",
      position: "UI/UX & Web Intern",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2026-08-30T00:00:00.000Z"),
      reportCycle: ReportCycle.biweekly,
      status: InternshipStatus.completed,
    },
  });

  const roundKmutt = await prisma.internshipRound.create({
    data: {
      studentId: "650012",
      workplaceId: wp14.workplaceId,
      advisorId: "teacher_kmutt",
      roundNumber: 1,
      academicYear: "2569",
      semester: "1",
      position: "Security Analyst Intern",
      startDate: new Date("2026-11-09T00:00:00.000Z"),
      endDate: new Date("2027-02-26T00:00:00.000Z"),
      reportCycle: ReportCycle.weekly,
      status: InternshipStatus.active,
    },
  });

  // Daily Logs
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
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-09T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "Setup Docker Compose + PostgreSQL และศึกษา Schema ของโปรเจกต์",
        knowledgeGained: "เข้าใจการใช้ Multi-container Development Environment และการเชื่อม Prisma ORM",
        toolsUsed: "Docker, PostgreSQL, Prisma",
        hoursWorked: 8,
      },
      {
        roundId: round2.roundId,
        workDate: new Date("2026-11-11T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "พัฒนา API Authentication และเขียน Unit Test เบื้องต้น",
        knowledgeGained: "เข้าใจเรื่อง JWT Cookie Security และการเขียน Automated Test",
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
      {
        roundId: roundAi.roundId,
        workDate: new Date("2026-11-10T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "สร้าง Embedding Pipeline และทดสอบ RAG Search บนชุดเอกสารภาษาไทย",
        knowledgeGained: "เข้าใจการตัดแบ่ง Chunk และจูน Hybrid Vector Search",
        toolsUsed: "Python, FastAPI, pgvector",
        hoursWorked: 8,
      },
      {
        roundId: roundNet.roundId,
        workDate: new Date("2026-11-10T00:00:00.000Z"),
        weekNumber: 1,
        tasksAssigned: "ตั้งค่า Prometheus & Grafana Dashboard ติดตาม CPU/Memory ของ Cluster",
        knowledgeGained: "เรียนรู้การสร้าง Alert Rule และการอ่าน Container Metrics",
        toolsUsed: "Docker, Prometheus, Grafana",
        hoursWorked: 8,
      },
    ],
  });

  // Period Reports
  await prisma.periodReport.createMany({
    data: [
      {
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
      {
        roundId: roundOther.roundId,
        startWeek: 1,
        endWeek: 2,
        summaryText:
          "ช่วง 2 สัปดาห์แรกได้วางแผนทดสอบระบบสมัครสมาชิกและทดลองยิง API ตรวจสอบ Error Response ครบทุก Endpoint หลัก",
        challenges: "อยากขอคำแนะนำอาจารย์เรื่องการเขียน Automated E2E Test เพิ่มเติมในสัปดาห์ถัดไป",
        status: ReportStatus.submitted,
        submittedAt: new Date("2026-11-20T15:00:00.000Z"),
      },
      {
        roundId: roundAi.roundId,
        startWeek: 1,
        endWeek: 1,
        summaryText:
          "สัปดาห์แรกได้ตั้งค่า RAG Pipeline และทดสอบวัดผลความแม่นยำการค้นหาเอกสารภาษาไทย",
        challenges: "ต้องปรับการตัดคำภาษาไทยเพื่อเพิ่ม Recall ให้ดีขึ้น",
        status: ReportStatus.submitted,
        submittedAt: new Date("2026-11-15T17:00:00.000Z"),
      },
      {
        roundId: roundNet.roundId,
        startWeek: 1,
        endWeek: 1,
        summaryText:
          "ติดตั้ง Prometheus, Node Exporter และ Grafana Dashboard สำหรับเซิร์ฟเวอร์ทดสอบสำเร็จ",
        challenges: "ต้องการตรวจสอบเพิ่มเติมเรื่อง Retention Policy ของ Time-series Data",
        status: ReportStatus.needs_revision,
        submittedAt: new Date("2026-11-15T18:00:00.000Z"),
        teacherFeedback: "ช่วยแนบสรุปกราฟตัวอย่างหรือค่า Alert Threshold ที่ตั้งไว้เพิ่มเติมด้วยครับ",
        reviewedById: "teacher",
        reviewedAt: new Date("2026-11-16T09:00:00.000Z"),
      },
    ],
  });

  // Update Tsu round reference so unused warning does not occur
  console.log(
    `UNINFO seed completed! (${roundTsu.roundId}, ${roundKmutt.roundId} ready)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
