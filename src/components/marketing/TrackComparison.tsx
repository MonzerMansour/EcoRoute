import Link from "next/link";
import {
  Bus,
  Car,
  GraduationCap,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";

export function TrackComparison() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Two Tracks, One Platform
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
            Built for schools and families
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-earth-600">
            EcoRoute unifies team travel optimization and daily carpool
            clustering under one shared AI engine.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Teacher Track */}
          <div className="card-hover overflow-hidden rounded-3xl border border-earth-200 bg-white">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-100">
                    Track A
                  </p>
                  <h3 className="text-2xl font-bold">For Schools & Teams</h3>
                </div>
              </div>
              <p className="mt-4 text-brand-100">
                Coaches, athletic directors, and teachers optimize buses, vans,
                and carpools for away games, field trips, and club travel.
              </p>
            </div>
            <div className="space-y-4 p-8">
              {[
                {
                  icon: Bus,
                  text: "Season & event travel planner with per-game emissions",
                },
                {
                  icon: Users,
                  text: "Vehicle load optimizer — bus vs. vans vs. carpools",
                },
                {
                  icon: MapPin,
                  text: "Smart recommendations based on distance & roster size",
                },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <span className="text-sm text-earth-700">{item.text}</span>
                </div>
              ))}
              <Link
                href="/for-schools"
                className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Learn more about school tools →
              </Link>
            </div>
          </div>

          {/* Student Track */}
          <div className="card-hover overflow-hidden rounded-3xl border border-earth-200 bg-white">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-800 px-8 py-10 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-100">
                    Track B
                  </p>
                  <h3 className="text-2xl font-bold">For Students & Parents</h3>
                </div>
              </div>
              <p className="mt-4 text-teal-100">
                Students, parents, and student council form neighborhood carpool
                clusters for daily commutes and home games.
              </p>
            </div>
            <div className="space-y-4 p-8">
              {[
                {
                  icon: Car,
                  text: "Daily commute mapper with neighborhood clustering",
                },
                {
                  icon: Users,
                  text: "2–4 person carpool groups with pickup order",
                },
                {
                  icon: MapPin,
                  text: "Home game fan carpools with shareable maps",
                },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                  <span className="text-sm text-earth-700">{item.text}</span>
                </div>
              ))}
              <Link
                href="/for-students"
                className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Learn more about student tools →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
