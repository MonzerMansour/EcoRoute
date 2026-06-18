import Link from "next/link";
import { Leaf } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/for-schools", label: "For Schools" },
    { href: "/for-students", label: "For Students" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/login/teacher", label: "Teacher Login" },
    { href: "/login/student", label: "Student Login" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">
                EcoRoute
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              AI-powered school transportation that cuts carbon emissions for
              sports teams, field trips, and daily commutes — without
              overhauling your schedule.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-12 bg-primary-foreground/20" />
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-primary-foreground/50">
            &copy; {new Date().getFullYear()} EcoRoute. Built for greener schools.
          </p>
          <p className="text-sm text-primary-foreground/50">
            Smarter routes. Lower emissions. Same schedule.
          </p>
        </div>
      </div>
    </footer>
  );
}
