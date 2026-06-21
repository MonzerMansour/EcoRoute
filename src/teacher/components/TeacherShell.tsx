"use client";

import { usePathname } from "next/navigation";
import { Leaf, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTourStore } from "@/components/tour/GuidedTour";

const navLinks = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/trips", label: "Trips" },
  { href: "/teacher/activities", label: "Activities" },
  { href: "/teacher/optimizer", label: "Optimizer" },
  { href: "/teacher/recommendations", label: "Recommendations" },
  { href: "/teacher/fleet", label: "Inventory" },
];

export function TeacherNav() {
  const pathname = usePathname();
  const { openTour } = useTourStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          <span className="text-sm text-muted-foreground">Coordinator</span>
        </ButtonLink>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <ButtonLink href="/" variant="outline" size="sm">
            Back to site
          </ButtonLink>
          <SignOutButton />
        </div>
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

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <input
                id="rerun-tour"
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettingsOpen(false);
                    openTour();
                  }
                }}
              />
              <Label htmlFor="rerun-tour">Re-run the guided tour</Label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
