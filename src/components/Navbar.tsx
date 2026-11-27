"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Admin routes render their own dedicated Left Sidebar layout
  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function handleLogout() {
    await logoutAction();
    setMobileOpen(false);
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === "/career-reviews") {
      return (
        pathname === "/" ||
        pathname.startsWith("/career-reviews") ||
        pathname.startsWith("/workplaces")
      );
    }
    if (href === "/my-career") {
      return (
        pathname.startsWith("/my-career") ||
        pathname.startsWith("/student") ||
        pathname.startsWith("/teacher") ||
        pathname.startsWith("/profile")
      );
    }
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    `whitespace-nowrap px-4 py-2.5 min-h-[44px] md:min-h-0 md:py-2 rounded-xl text-sm font-medium flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
      isActive(href)
        ? "bg-brand text-white dark:text-zinc-950 font-semibold"
        : "text-ink-secondary hover:text-ink-primary hover:bg-paper-muted"
    }`;

  // Strictly the 4 universal/hub items requested
  const navItems = [
    { href: "/career-reviews", label: "Career Reviews" },
    { href: "/internships", label: "Internships" },
    { href: "/courses", label: "Class Review" },
    { href: "/my-career", label: "My Career" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper-surface border-b border-line">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 sm:h-[76px] flex items-center justify-between gap-5">
        {/* Left: Enlarged [ UNINFO ] Brand + 4 Primary Links */}
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href={user ? "/career-reviews" : "/login"}
            className="flex items-center gap-3 flex-shrink-0 min-h-[44px] md:min-h-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <span className="h-10 px-3.5 rounded-xl bg-brand text-white dark:text-zinc-950 font-mono font-bold text-sm tracking-wider inline-flex items-center justify-center">
              UNINFO
            </span>
          </Link>

          {user && (
            <nav
              className="hidden md:flex items-center gap-2 divide-x divide-line/0"
              aria-label="เมนูหลัก"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Theme Toggle + Auth / Logout */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <ThemeToggle compact />

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line-strong text-sm font-medium text-ink-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-paper-muted transition-colors duration-150"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                ออกจากระบบ
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    pathname === "/register"
                      ? "bg-paper-muted text-ink-primary font-semibold"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  สมัครสมาชิก
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-brand hover:bg-brand-hover text-white dark:text-zinc-950 transition-colors duration-150"
                >
                  เข้าสู่ระบบ
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={mobileOpen}
            className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-xl text-ink-primary hover:bg-paper-muted transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="เมนูมือถือ"
          className="md:hidden border-t border-line bg-paper-surface px-4 py-3 space-y-1.5"
        >
          {user ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(item.href)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-line">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-paper-muted transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium border border-line-strong text-ink-primary"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium bg-brand text-white dark:text-zinc-950"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
