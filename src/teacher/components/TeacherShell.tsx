import Link from "next/link";
import { ArrowRight, Bus, Calendar, MapPin } from "lucide-react";

const navItems = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/trips", label: "Trips" },
  { href: "/teacher/events", label: "Away Events" },
  { href: "/teacher/recommendations", label: "Recommendations" },
];

export function TeacherNav() {
  return (
    <nav className="border-b border-earth-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold text-brand-700">Teacher Interface</span>
        <ul className="flex flex-wrap gap-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-earth-600 transition-colors hover:text-brand-600"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function TeacherDashboardPlaceholder() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {[
        {
          icon: MapPin,
          title: "Add Sports Trips",
          desc: "Input away games, distances, and roster sizes.",
          href: "/teacher/trips",
        },
        {
          icon: Calendar,
          title: "Schedule Away Events",
          desc: "Manage tournaments and multi-day travel blocks.",
          href: "/teacher/events",
        },
        {
          icon: Bus,
          title: "Vehicle Recommendations",
          desc: "Get emissions estimates and optimized fleet picks.",
          href: "/teacher/recommendations",
        },
      ].map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="card-hover rounded-2xl border border-earth-200 bg-white p-6"
        >
          <card.icon className="h-8 w-8 text-brand-600" />
          <h3 className="mt-4 font-semibold text-earth-900">{card.title}</h3>
          <p className="mt-2 text-sm text-earth-600">{card.desc}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}
