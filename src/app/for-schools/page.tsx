import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bus,
  Calendar,
  Lightbulb,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "For Schools & Teams",
  description:
    "Optimize school-organized transportation for sports teams, field trips, and away events with AI-powered emissions planning.",
};

const features = [
  {
    icon: Calendar,
    title: "Season & Event Travel Planner",
    description:
      "Input opponent schools, distances, roster sizes, and available vehicles. AI outputs total emissions per game and ranks highest-emission trips.",
  },
  {
    icon: Bus,
    title: "Vehicle Load Optimizer",
    description:
      "Determines the lowest-emission configuration — one full bus, two half buses, vans, carpools, or mixed setups. Sometimes 3 carpools beat a bus.",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "Under 15 miles → carpool. Roster of 12 → 3 vans produce 40% less CO₂. Consider swapping opponents with closer schools.",
  },
  {
    icon: BarChart3,
    title: "Season Emissions Dashboard",
    description:
      "Total CO₂ for the season, top 3 highest-impact changes, per-game footprint, and comparison to last season.",
  },
];

const steps = [
  {
    number: 1,
    icon: Calendar,
    title: "Upload your season schedule",
    description:
      "Add away games with opponent school, distance, roster size, available vehicles, and departure time.",
  },
  {
    number: 2,
    icon: Bus,
    title: "AI analyzes every trip",
    description:
      "Our engine calculates emissions for buses, vans, carpools, and mixed configurations for each matchup.",
  },
  {
    number: 3,
    icon: Lightbulb,
    title: "Get optimized vehicle plans",
    description:
      "Receive per-game recommendations — the exact lowest-emission travel configuration for each trip.",
  },
  {
    number: 4,
    icon: BarChart3,
    title: "Review your season report",
    description:
      "See total season CO₂, ranked high-emission games, and the top 3 changes that would make the biggest impact.",
  },
];

export default function ForSchoolsPage() {
  return (
    <>
      <section className="gradient-hero border-b border-earth-200">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
              <Trophy className="h-4 w-4" />
              Track A — For Schools & Teams
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-earth-900 sm:text-5xl">
              Sports Travel Footprint Optimizer
            </h1>
            <p className="mt-6 text-lg text-earth-600">
              Coaches, athletic directors, and teachers use EcoRoute to plan
              away games, field trips, and club travel with the lowest possible
              carbon footprint — without reshuffling the season.
            </p>
            <Link
              href="/login/teacher"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700"
            >
              Sign in as Teacher
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-earth-900">
            Core features for school staff
          </h2>
          <div className="mt-12">
            <FeatureGrid features={features} columns={2} />
          </div>
        </div>
      </section>

      <section className="border-y border-earth-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-earth-900">
            How it works for coaches
          </h2>
          <div className="mt-16 max-w-3xl mx-auto">
            <HowItWorksSteps steps={steps} accent="brand" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-earth-200 bg-gradient-to-br from-brand-50 to-white p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-earth-900">
              Example AI recommendations
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: MapPin,
                  rec: "Under 15 miles → carpool recommended",
                },
                {
                  icon: Users,
                  rec: "Roster of 12 → 3 vans produce 40% less CO₂ than a bus",
                },
                {
                  icon: Trophy,
                  rec: "Swap opponent with closer school → saves 18% emissions",
                },
              ].map((item) => (
                <div
                  key={item.rec}
                  className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
                >
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm font-medium text-earth-800">
                    {item.rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Start optimizing your team's travel"
        description="Upload your season schedule and get AI-powered emissions insights in minutes."
        primaryHref="/login/teacher"
        primaryLabel="Teacher Sign In"
        secondaryHref="/features"
        secondaryLabel="View All Features"
      />
    </>
  );
}
