import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Bus,
  Car,
  Cloud,
  Leaf,
  MapPin,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { TrackComparison } from "@/components/marketing/TrackComparison";
import { CTASection } from "@/components/marketing/CTASection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";

const stats = [
  { value: "40%", label: "avg. emissions reduction potential" },
  { value: "2 tracks", label: "schools & families united" },
  { value: "1 AI engine", label: "shared optimization core" },
  { value: "0", label: "schedule overhauls required" },
];

const aiFeatures = [
  {
    icon: Brain,
    title: "Neighborhood Clustering",
    description:
      "Groups students by proximity using simple location inputs — no GPS tracking required.",
  },
  {
    icon: Bus,
    title: "Vehicle Load Optimization",
    description:
      "Calculates whether one bus, two vans, or carpools produce the lowest emissions per trip.",
  },
  {
    icon: BarChart3,
    title: "Impact Estimation",
    description:
      "Shows CO₂ savings at 30%, 50%, and 70% adoption — so you can set realistic goals.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Under 15 miles? Carpool. Medium distance? Vans. Long haul? One consolidated bus.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Leaf className="h-4 w-4" />
              AI for Smarter School Transportation
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-earth-900 sm:text-6xl">
              Cut travel emissions{" "}
              <span className="text-brand-600">without changing</span> your
              schedule
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-earth-600 sm:text-xl">
              EcoRoute uses AI to optimize team buses, vans, and carpools for
              away games — and clusters neighborhood carpools for daily
              commutes and home games.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login/teacher"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-xl"
              >
                I&apos;m a Teacher
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login/student"
                className="inline-flex items-center gap-2 rounded-xl border border-earth-300 bg-white px-6 py-3.5 text-sm font-semibold text-earth-700 transition-colors hover:bg-earth-50"
              >
                I&apos;m a Student / Parent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-earth-200 bg-white/80 p-6 text-center backdrop-blur-sm"
              >
                <p className="text-3xl font-bold text-brand-600">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-earth-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Comparison */}
      <TrackComparison />

      {/* Shared AI Engine */}
      <section className="border-y border-earth-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Shared AI Engine
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
              One brain powering both tracks
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-earth-600">
              Clustering, optimization, prediction, and impact estimation — all
              unified so schools and families work from the same intelligence.
            </p>
          </div>
          <div className="mt-12">
            <FeatureGrid features={aiFeatures} columns={4} />
          </div>
        </div>
      </section>

      {/* Action Loop Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                The Action Loop
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-earth-900">
                From data to decisions in minutes
              </h2>
              <p className="mt-4 text-lg text-earth-600">
                Upload your schedule or commute info. AI analyzes emissions,
                ranks high-impact trips, and delivers actionable plans — season
                reports for coaches, carpool maps for student council.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: MapPin,
                    text: "Input distances, rosters, and neighborhoods",
                  },
                  {
                    icon: Zap,
                    text: "AI calculates emissions and optimal vehicle configs",
                  },
                  {
                    icon: Cloud,
                    text: "Get ranked recommendations and shareable reports",
                  },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-earth-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/how-it-works"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                See how it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-earth-200 bg-gradient-to-br from-brand-50 to-teal-50 p-8">
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-brand-600" />
                    <span className="text-sm font-semibold text-earth-900">
                      Season Emissions Report
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-earth-600">
                    Top 3 high-impact changes for your basketball season
                  </p>
                  <div className="mt-3 space-y-2">
                    {[
                      "Swap Game 4 opponent → saves 18% CO₂",
                      "Use 3 vans instead of bus for Game 7 → 40% less",
                      "Carpool for Game 2 (12 mi) → recommended",
                    ].map((rec) => (
                      <div
                        key={rec}
                        className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-teal-600" />
                    <span className="text-sm font-semibold text-earth-900">
                      Game Day Carpool Map
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-earth-600">
                    4 clusters formed · 50% carpool adoption saves 1.2 tons CO₂
                  </p>
                  <div className="mt-3 flex gap-2">
                    {["Oak St", "Maple Ave", "Pine Rd", "Cedar Ln"].map(
                      (n) => (
                        <span
                          key={n}
                          className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                        >
                          {n}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / who it's for */}
      <section className="border-t border-earth-200 bg-earth-100/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-earth-900">
              Who uses EcoRoute?
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, role: "Coaches", desc: "Season travel planning" },
              {
                icon: Bus,
                role: "Athletic Directors",
                desc: "Fleet optimization",
              },
              {
                icon: Car,
                role: "Parents",
                desc: "Morning drop-off carpools",
              },
              {
                icon: Leaf,
                role: "Sustainability Clubs",
                desc: "Campus impact tracking",
              },
            ].map((item) => (
              <div
                key={item.role}
                className="rounded-2xl border border-earth-200 bg-white p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-earth-900">
                  {item.role}
                </h3>
                <p className="mt-1 text-sm text-earth-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to reduce your school's travel footprint?"
        description="Join coaches and families using AI to make smarter transportation decisions — starting today."
        primaryHref="/login/teacher"
        primaryLabel="Get Started — Teachers"
        secondaryHref="/login/student"
        secondaryLabel="Get Started — Students"
      />
    </>
  );
}
