import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Target, Users } from "lucide-react";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "About",
  description:
    "EcoRoute helps schools reduce transportation emissions with AI — for teams, families, and the planet.",
};

const values = [
  {
    icon: Leaf,
    title: "Sustainability First",
    description:
      "Every feature is designed to measurably reduce CO₂ — not just track it. We focus on actionable change.",
  },
  {
    icon: Users,
    title: "Built for Schools",
    description:
      "Coaches, teachers, students, and parents each get tools tailored to their role — unified under one platform.",
  },
  {
    icon: Target,
    title: "Practical Impact",
    description:
      "No schedule overhauls required. EcoRoute finds the lowest-emission options within your existing plans.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description:
      "Carpool clustering turns solo commutes into community habits — making sustainability social and convenient.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="gradient-hero border-b border-earth-200">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-earth-900 sm:text-5xl">
              Making school transportation greener, together
            </h1>
            <p className="mt-6 text-lg text-earth-600">
              EcoRoute was built on a simple belief: schools shouldn&apos;t have
              to choose between their schedules and the planet. With AI, they
              don&apos;t have to.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-earth-900">Our mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-earth-600">
              School transportation is one of the largest hidden sources of
              campus carbon emissions — from daily parent drop-offs to cross-state
              away games. EcoRoute gives schools the AI tools to see those
              emissions clearly and reduce them practically.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-earth-600">
              We split the problem into two tracks because the users are
              different, but the intelligence is shared. Coaches need vehicle
              optimization. Families need carpool clustering. Both need the
              same emissions science underneath.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-earth-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-earth-900">
            What we believe
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-earth-200 p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-earth-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-earth-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-earth-200 bg-gradient-to-br from-brand-50 to-teal-50 p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-earth-900">
                  The problem we&apos;re solving
                </h2>
                <p className="mt-4 text-earth-600">
                  A typical high school sports season can generate thousands of
                  pounds of CO₂ from away-game travel alone. Meanwhile, hundreds
                  of families drive solo to school every morning — often from the
                  same neighborhoods.
                </p>
                <p className="mt-4 text-earth-600">
                  EcoRoute makes the invisible visible, then makes reduction
                  practical.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  "Coaches default to buses even when vans or carpools would emit less",
                  "Parents don't know which neighbors drive the same route",
                  "Student councils lack tools to coordinate game-day fan carpools",
                  "Schools have no season-level view of travel emissions",
                ].map((problem) => (
                  <div
                    key={problem}
                    className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <p className="text-sm text-earth-700">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-earth-200 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-earth-900">
            Explore the platform
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/for-schools"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              For Schools & Teams
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/for-students"
              className="inline-flex items-center gap-2 rounded-xl border border-earth-300 bg-white px-6 py-3 text-sm font-semibold text-earth-700 transition-colors hover:bg-earth-50"
            >
              For Students & Parents
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Join the movement"
        description="Sign in and start making smarter transportation decisions for your school."
        primaryHref="/login/teacher"
        primaryLabel="Get Started"
      />
    </>
  );
}
