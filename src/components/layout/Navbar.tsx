"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-schools", label: "For Schools" },
  { href: "/for-students", label: "For Students" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthPage = pathname?.startsWith("/login");

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-earth-200/60 bg-earth-50/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-earth-900">
            EcoRoute
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-brand-50 text-brand-700"
                  : "text-earth-600 hover:bg-earth-100 hover:text-earth-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login/student"
            className="rounded-lg px-4 py-2 text-sm font-medium text-earth-700 transition-colors hover:bg-earth-100"
          >
            Student Login
          </Link>
          <Link
            href="/login/teacher"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Teacher Login
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-earth-600 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-earth-200 bg-earth-50 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === link.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-earth-600",
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-earth-200" />
            <Link
              href="/login/student"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-earth-700"
            >
              Student Login
            </Link>
            <Link
              href="/login/teacher"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Teacher Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
