import type { Metadata } from "next";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { Navbar, Footer } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ระบบรวบรวมสถานประกอบการ แผนกเทคโนโลยีสารสนเทศ | วิทยาลัยเทคนิคหาดใหญ่",
  description:
    "ระบบรวบรวมสถานประกอบการวิชาชีพ สำหรับนักเรียน นักศึกษา ฝึกประสบการณ์วิชาชีพ แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่",
  icons: {
    icon: "/img/logo_ithtc.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer isLoggedIn={!!user} />
      </body>
    </html>
  );
}
