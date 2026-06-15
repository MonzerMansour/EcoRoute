import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Bus,
  Car,
  Database,
  FileText,
  Layers,
} from "lucide-react";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how EcoRoute's AI optimizes school transportation from input to actionable emissions reports.",
};

const flow = [
  {
    step: "01",
    title: "Input your data",
    description:
      "Teachers upload season schedules with distances, rosters, and vehicle options. Students share neighborhoods and commute habits.",
    inputs: [
      "Distances & opponent schools",
      "Roster sizes",
      "Student neighborhoods",
      "Vehicle types available",
      "Attendance estimates",
    ],
  },
  {
    step: "02",
    title: "AI processes & optimizes",
    description:
      "The shared engine runs clustering, vehicle load optimization, and emissions modeling across all scenarios.",
    inputs: [
      "Neighborhood clustering",
      "Bus vs. van vs. carpool analysis",
      "Route overlap detection",
      "Emissions per configuration",
    ],
  },
  {
    step: "03",
    title: "Get actionable outputs",
    description:
      "Receive ranked recommendations, optimized travel plans, and shareable reports tailored to your role.",
    inputs: [
      "Season emissions dashboards",
      "Per-game vehicle plans",
      "Carpool cluster maps",
      "CO₂ savings estimates",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="gradient-hero border-b border-earth-200">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-earth-900 sm:text-5xl">
            How EcoRoute works
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-earth-600">
            Three steps from data to decisions. No complex setup, no schedule
            overhauls — just smarter transportation choices.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {flow.map((item, index) => (
              <div
                key={item.step}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:direction-rtl" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="text-sm font-bold text-brand-600">
                    Step {item.step}
                  </span>
                  <h2 className="mt-2 text-3xl font-bold text-earth-900">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-lg text-earth-600">
                    {item.description}
                  </p>
                </div>
                <div
                  className={`rounded-3xl border border-earth-200 bg-white p-8 ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <ul className="space-y-3">
                    {item.inputs.map((input) => (
                      <li
                        key={input}
                        className="flex items-center gap-3 text-sm text-earth-700"
                      >
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        {input}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two tracks diagram */}
      <section className="border-y border-earth-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-earth-900">
            Two tracks, one engine
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-earth-200 p-8 text-center">
              <Bus className="mx-auto h-10 w-10 text-brand-600" />
              <h3 className="mt-4 font-semibold text-earth-900">
                School Travel
              </h3>
              <p className="mt-2 text-sm text-earth-600">
                Teams, field trips, away events
              </p>
              <Link
                href="/for-schools"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
              >
                Learn more <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-8 text-center">
              <Brain className="mx-auto h-10 w-10 text-brand-600" />
              <h3 className="mt-4 font-semibold text-earth-900">
                Shared AI Engine
              </h3>
              <p className="mt-2 text-sm text-earth-600">
                Clustering · Optimization · Prediction · Impact
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Layers className="h-4 w-4 text-brand-500" />
                <Database className="h-4 w-4 text-brand-500" />
                <FileText className="h-4 w-4 text-brand-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-earth-200 p-8 text-center">
              <Car className="mx-auto h-10 w-10 text-teal-600" />
              <h3 className="mt-4 font-semibold text-earth-900">
                Daily Carpools
              </h3>
              <p className="mt-2 text-sm text-earth-600">
                Commutes, home games, fan rides
              </p>
              <Link
                href="/for-students"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600"
              >
                Learn more <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to get started?"
        description="Pick your track and sign in with email or Google."
        primaryHref="/login/teacher"
        primaryLabel="Teacher Sign In"
        secondaryHref="/login/student"
        secondaryLabel="Student Sign In"
      />
    </>
  );
}
