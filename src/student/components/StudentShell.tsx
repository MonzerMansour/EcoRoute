import Link from "next/link";
import { ArrowRight, Car, Leaf, MapPin, Users } from "lucide-react";

const navItems = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/commute", label: "Commute Modes" },
  { href: "/student/carpools", label: "Carpool Clusters" },
  { href: "/student/savings", label: "CO₂ Savings" },
];

export function StudentNav() {
  return (
    <nav className="border-b border-earth-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold text-teal-700">Student Interface</span>
        <ul className="flex flex-wrap gap-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-earth-600 transition-colors hover:text-teal-600"
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

export function StudentDashboardPlaceholder() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {[
        {
          icon: MapPin,
          title: "Add Neighborhoods",
          desc: "Students and parents enter home areas for clustering.",
          href: "/student/commute",
        },
        {
          icon: Users,
          title: "Carpool Clusters",
          desc: "View AI-generated groups by proximity.",
          href: "/student/carpools",
        },
        {
          icon: Leaf,
          title: "CO₂ Savings",
          desc: "See impact at different adoption rates.",
          href: "/student/savings",
        },
      ].map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="card-hover rounded-2xl border border-earth-200 bg-white p-6"
        >
          <card.icon className="h-8 w-8 text-teal-600" />
          <h3 className="mt-4 font-semibold text-earth-900">{card.title}</h3>
          <p className="mt-2 text-sm text-earth-600">{card.desc}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function CommuteModeLegend() {
  return (
    <div className="flex items-center gap-2 text-sm text-earth-500">
      <Car className="h-4 w-4" />
      <span>Modes: solo car, carpool, bus, walk, bike</span>
    </div>
  );
}
