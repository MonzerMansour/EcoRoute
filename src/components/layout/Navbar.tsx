"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-schools", label: "For Schools" },
  { href: "/for-students", label: "For Students" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/login");
  const isDashboard =
    pathname?.startsWith("/teacher") || pathname?.startsWith("/student");

  if (isAuthPage || isDashboard) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">EcoRoute</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <ButtonLink
              key={link.href}
              href={link.href}
              variant="ghost"
              size="sm"
              className={cn(
                pathname === link.href &&
                  "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              )}
            >
              {link.label}
            </ButtonLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login/student" variant="ghost" size="sm">
            Student Login
          </ButtonLink>
          <ButtonLink href="/login/teacher" size="sm">
            Teacher Login
          </ButtonLink>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="h-4 w-4" />
                </div>
                EcoRoute
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1 px-2">
              {navLinks.map((link) => (
                <ButtonLink
                  key={link.href}
                  href={link.href}
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    pathname === link.href && "bg-primary/10 text-primary",
                  )}
                >
                  {link.label}
                </ButtonLink>
              ))}
              <Separator className="my-3" />
              <ButtonLink href="/login/student" variant="outline" className="justify-start">
                Student Login
              </ButtonLink>
              <ButtonLink href="/login/teacher">Teacher Login</ButtonLink>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
