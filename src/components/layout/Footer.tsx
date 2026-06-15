import Link from "next/link";
import { Leaf } from "lucide-react";

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
    <footer className="border-t border-earth-200 bg-earth-900 text-earth-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">EcoRoute</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-earth-400">
              AI-powered school transportation that cuts carbon emissions for
              sports teams, field trips, and daily commutes — without
              overhauling your schedule.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-earth-200">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-earth-400 transition-colors hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-earth-800 pt-8 sm:flex-row">
          <p className="text-sm text-earth-500">
            &copy; {new Date().getFullYear()} EcoRoute. Built for greener schools.
          </p>
          <p className="text-sm text-earth-500">
            Smarter routes. Lower emissions. Same schedule.
          </p>
        </div>
      </div>
    </footer>
  );
}
