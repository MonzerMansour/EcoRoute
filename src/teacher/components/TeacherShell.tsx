"use client";

import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/trips", label: "Trips" },
  { href: "/teacher/optimizer", label: "Optimizer" },
  { href: "/teacher/recommendations", label: "Recommendations" },
  { href: "/teacher/events", label: "Events" },
];

export function TeacherNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <ButtonLink
          href="/teacher"
          variant="ghost"
          className="h-auto gap-2 p-0 hover:bg-transparent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-bold">EcoRoute</span>
          <span className="text-sm text-muted-foreground">Coach</span>
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="sm">
          Back to site
        </ButtonLink>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
        {navLinks.map((link) => {
          const active =
            link.href === "/teacher"
              ? pathname === "/teacher"
              : pathname?.startsWith(link.href);
          return (
            <ButtonLink
              key={link.href}
              href={link.href}
              variant="ghost"
              size="sm"
              className={cn(
                active &&
                  "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              )}
            >
              {link.label}
            </ButtonLink>
          );
        })}
      </nav>
      <Separator />
    </div>
  );
}
