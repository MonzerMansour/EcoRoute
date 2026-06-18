"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navLinks = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/commute", label: "Commute" },
  { href: "/student/carpools", label: "Carpools" },
  { href: "/student/savings", label: "Savings" },
];

const commuteModes = [
  { mode: "solo_car", label: "Solo car", color: "bg-destructive/10 text-destructive" },
  { mode: "carpool", label: "Carpool", color: "bg-primary/10 text-primary" },
  { mode: "bus", label: "Bus", color: "bg-secondary/10 text-secondary" },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/student" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-bold">EcoRoute</span>
          <span className="text-sm text-muted-foreground">Student</span>
        </Link>
        <div className="flex items-center gap-2">
          <ButtonLink href="/" variant="outline" size="sm">
            Back to site
          </ButtonLink>
          <SignOutButton />
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
        {navLinks.map((link) => (
          <ButtonLink
            key={link.href}
            href={link.href}
            variant="ghost"
            size="sm"
            className={cn(
              pathname === link.href &&
                "bg-secondary/10 text-secondary hover:bg-secondary/15",
            )}
          >
            {link.label}
          </ButtonLink>
        ))}
      </nav>
      <Separator />
    </div>
  );
}

export function StudentDashboardPlaceholder() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { label: "Carpool clusters", value: "4" },
        { label: "Est. CO₂ saved", value: "0.8 tons" },
        { label: "Neighbors nearby", value: "12" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10"
        >
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-secondary">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CommuteModeLegend() {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {commuteModes.map((m) => (
        <Badge key={m.mode} variant="outline" className={m.color}>
          {m.label}
        </Badge>
      ))}
    </div>
  );
}
