import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PostgreSQL database for EstV2 (Next.js)...");

  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workplace.deleteMany();

  // Create initial users (Admin, Teacher)
  await prisma.user.createMany({
    data: [
      {
        userId: "admin",
        username: "admin",
        password: "admin",
        role: Role.admin,
        userFname: "ผู้ดูแล",
        userLname: "ระบบ",
        userTel: "0812345678",
      },
      {
        userId: "teacher",
        username: "teacher",
        password: "teacher",
        role: Role.teacher,
        userFname: "อาจารย์",
        userLname: "ที่ปรึกษา",
        userTel: "0823456789",
      },
    ],
  });

  // Create workplaces
  const wp1 = await prisma.workplace.create({
    data: {
      workplaceName: "บริษัท ซอฟต์แวร์โซลูชั่น จำกัด",
      workplaceAddress: "123 ถ.กาญจนวนิช ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "เขียนโปรแกรม",
      description: "พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript, PHP และฐานข้อมูล PostgreSQL / MySQL",
      workTel: "074123456",
      userId: "teacher",
      rating: 4.8,
      show: true,
      map: "https://maps.google.com/?q=7.0086,100.4981",
    },
  });

  const wp2 = await prisma.workplace.create({
    data: {
      workplaceName: "สตูดิโอ ครีเอทีฟ ดีไซน์ หาดใหญ่",
      workplaceAddress: "45/2 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ทำกราฟิก",
      description: "ออกแบบสื่อสิ่งพิมพ์ โลโก้ แบนเนอร์โฆษณา และกราฟิกสำหรับโซเชียลมีเดียด้วย Adobe Illustrator & Photoshop",
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
      workplaceAddress: "88 ถ.ราษฎร์ยินดี ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ระบบเครือข่าย",
      description: "ติดตั้งและดูแลระบบเครือข่ายองค์กร เซิร์ฟเวอร์ ไฟร์วอลล์ MikroTik และระบบกล้องวงจรปิด CCTV",
      workTel: "074345678",
      userId: null,
      rating: 4.5,
      show: true,
      map: "https://maps.google.com/?q=7.0012,100.4833",
    },
  });

  const wp4 = await prisma.workplace.create({
    data: {
      workplaceName: "ดิจิทัล เว็บ เอเจนซี่ (Digital Web Agency)",
      workplaceAddress: "210 ถ.ธรรมนูญวิถี ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ทำเว็บไซต์",
      description: "รับทำเว็บไซต์องค์กร ระบบ E-Commerce ด้วย React, Next.js, WordPress และออกแบบ UI/UX สมัยใหม่",
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
      workplaceAddress: "59 ถ.ศรีภูวนารถ ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
      workType: "ด้านบริการ",
      description: "ซ่อมบำรุงคอมพิวเตอร์ โน้ตบุ๊ก ลงโปรแกรม และให้คำปรึกษาปัญหาไอทีแก่ลูกค้า",
      workTel: "074567890",
      userId: null,
      rating: 4.2,
      show: true,
      map: "https://maps.google.com/?q=6.9965,100.4752",
    },
  });

  // Create students linked to workplaces
  await prisma.user.createMany({
    data: [
      {
        userId: "650001",
        username: "650001",
        password: "650001",
        role: Role.student,
        userFname: "สมชาย",
        userLname: "ใจดี",
        userTel: "0834567890",
        workplaceId: wp1.workplaceId,
      },
      {
        userId: "650002",
        username: "650002",
        password: "650002",
        role: Role.student,
        userFname: "กานดา",
        userLname: "รักเรียน",
        userTel: "0845678901",
        workplaceId: wp1.workplaceId,
      },
      {
        userId: "650003",
        username: "650003",
        password: "650003",
        role: Role.student,
        userFname: "ปิติ",
        userLname: "พัฒนา",
        userTel: "0856789012",
        workplaceId: wp2.workplaceId,
      },
      {
        userId: "650004",
        username: "650004",
        password: "650004",
        role: Role.student,
        userFname: "วีระ",
        userLname: "สายเน็ต",
        userTel: "0867890123",
        workplaceId: wp3.workplaceId,
      },
      {
        userId: "650005",
        username: "650005",
        password: "650005",
        role: Role.student,
        userFname: "นภา",
        userLname: "เว็บสวย",
        userTel: "0878901234",
        workplaceId: wp4.workplaceId,
      },
    ],
  });

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        userId: "650001",
        workplaceId: wp1.workplaceId,
        rating: 5.0,
        commentText: "พี่เลี้ยงดูแลดีมาก สอนงานตั้งแต่พื้นฐานจนขึ้นโปรเจกต์จริงได้ ได้ฝึกเขียนเว็บและจัดการฐานข้อมูลเต็มที่ครับ",
        img: "1324736204.jpg",
        show: true,
      },
      {
        userId: "650002",
        workplaceId: wp1.workplaceId,
        rating: 4.5,
        commentText: "บรรยากาศการทำงานเป็นกันเอง มีอุปกรณ์และคอมพิวเตอร์พร้อมให้ฝึกงาน ได้เรียนรู้ระบบงานทีมจริง",
        img: "1332867696.jpg",
        show: true,
      },
      {
        userId: "650003",
        workplaceId: wp2.workplaceId,
        rating: 5.0,
        commentText: "ได้ฝึกใช้ Illustrator และ Photoshop งานจริงของลูกค้า พี่ๆ ให้คำแนะนำเทคนิคการออกแบบดีมากค่ะ",
        img: "1842142571.jpg",
        show: true,
      },
      {
        userId: "650004",
        workplaceId: wp3.workplaceId,
        rating: 4.5,
        commentText: "ได้ออกหน้างานจริงเดินสาย LAN ตั้งค่า Router และ MikroTik ได้ประสบการณ์ตรงสายงานเครือข่ายเต็มๆ",
        img: "1851054153.jpg",
        show: true,
      },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
