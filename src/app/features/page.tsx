import type { Metadata } from "next";
import {
  BarChart3,
  Brain,
  Bus,
  Car,
  Cloud,
  Lightbulb,
  MapPin,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { CTASection } from "@/components/marketing/CTASection";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore EcoRoute's AI-powered features for school travel optimization and carpool clustering.",
};

const schoolFeatures = [
  {
    icon: Bus,
    title: "Season & Event Travel Planner",
    description:
      "Coaches input opponent school, distance, roster size, available vehicles, and departure time. AI outputs emissions per game and ranks highest-emission trips.",
  },
  {
    icon: Zap,
    title: "Vehicle Load Optimizer",
    description:
      "Determines whether one full bus, two half buses, vans, carpools, or mixed setups produce the lowest emissions for each trip.",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "Distance-based suggestions: carpools under 15 miles, vans for medium distance, consolidated bus for long hauls. Plus opponent swap suggestions.",
  },
  {
    icon: BarChart3,
    title: "Season Emissions Dashboard",
    description:
      "Total CO₂ for the season, top 3 highest-impact changes, per-game footprint, and year-over-year comparison.",
  },
];

const studentFeatures = [
  {
    icon: MapPin,
    title: "Daily Commute Mapper",
    description:
      "Students and parents input neighborhood or nearest intersection, commute method, and available seats. AI clusters nearby families.",
  },
  {
    icon: Users,
    title: "Carpool Cluster Generator",
    description:
      "Forms 2–4 person groups based on proximity, route overlap, and schedule compatibility with suggested pickup order.",
  },
  {
    icon: Car,
    title: "Home Game Carpooling",
    description:
      "Input expected attendance and neighborhoods. AI generates fan carpool clusters and shareable Game Day Carpool Maps.",
  },
  {
    icon: Sparkles,
    title: "Parent Convenience Mode",
    description:
      "Suggests best carpool partners, optimal carpool days, and weekly smart commute tips to make sustainable habits stick.",
  },
];

const sharedAI = [
  {
    icon: Brain,
    title: "Clustering",
    description: "Neighborhoods → optimal carpool groups",
  },
  {
    icon: Zap,
    title: "Optimization",
    description: "Vehicle load → lowest emissions configuration",
  },
  {
    icon: Cloud,
    title: "Prediction",
    description: "High-emission days and high-traffic patterns",
  },
  {
    icon: BarChart3,
    title: "Impact Estimation",
    description: "CO₂ savings and miles reduced at scale",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything EcoRoute can do
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Two purpose-built interfaces powered by one shared AI engine — built
            to cut school transportation emissions at every level.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Badge className="mb-1">Track A</Badge>
            <h2 className="mt-1 text-2xl font-bold">
              Teacher & Staff Features
            </h2>
          </div>
          <FeatureGrid features={schoolFeatures} columns={2} />
        </div>
      </section>

      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Badge variant="secondary" className="mb-1">Track B</Badge>
            <h2 className="mt-1 text-2xl font-bold">
              Student & Parent Features
            </h2>
          </div>
          <FeatureGrid features={studentFeatures} columns={2} />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <Badge className="mb-1">Shared AI Engine</Badge>
            <h2 className="mt-1 text-2xl font-bold">
              The glue that unifies both tracks
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Both school staff and families benefit from the same core AI
              capabilities — clustering, optimization, prediction, and impact
              estimation.
            </p>
          </div>
          <FeatureGrid features={sharedAI} columns={4} />
        </div>
      </section>

      <CTASection
        title="See EcoRoute in action"
        description="Choose your track and sign in to start reducing emissions today."
        primaryHref="/login/teacher"
        primaryLabel="Teacher Sign In"
        secondaryHref="/login/student"
        secondaryLabel="Student Sign In"
      />
    </>
  );
}
