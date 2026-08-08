"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/links", label: "Links" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/blogs", label: "Blogs" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 shadow-md backdrop-blur supports-[backdrop-filter]:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-base font-semibold tracking-tight text-slate-100 sm:text-lg">Smart Link Router</span>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-lg border border-slate-500/50 bg-slate-800/80 p-2 text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="mt-1 block h-0.5 w-5 rounded-full bg-current" />
            <span className="mt-1 block h-0.5 w-5 rounded-full bg-current" />
          </button>

          <nav className="hidden items-center gap-2 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${
                  pathname === item.href
                    ? "rounded-full bg-sky-400 px-3 py-1.5 text-slate-950 shadow-sm"
                    : "rounded-full px-3 py-1.5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="rounded-full border border-slate-500/60 px-3 py-1.5 text-slate-100 hover:bg-white/10"
            >
              Logout
            </Button>
          </nav>
        </div>

        {isMenuOpen && (
          <nav className="flex flex-col gap-1 border-t border-slate-700/60 bg-slate-900/95 px-4 py-3 sm:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-md px-2 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-sky-400 text-slate-950"
                    : "text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md px-2 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
