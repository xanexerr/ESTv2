import type { Metadata } from "next";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "UNINFO — แพลตฟอร์มฝึกงานและรีวิวสำหรับนักศึกษามหาวิทยาลัย",
  description:
    "UNINFO แพลตฟอร์มรีวิวสายอาชีพ สถานที่ฝึกงาน รีวิวรายวิชา และระบบติดตามการฝึกงานเฉพาะมหาวิทยาลัยของคุณ",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('est_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-paper-bg text-ink-primary">
        <Navbar user={user} />
        <main className="flex-grow max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
