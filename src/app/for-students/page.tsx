import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  GraduationCap,
  Home,
  Map,
  MapPin,
  Users,
} from "lucide-react";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "For Students & Parents",
  description:
    "Form neighborhood carpool clusters for daily commutes and home games with AI-powered route optimization.",
};

const features = [
  {
    icon: MapPin,
    title: "Daily Commute Mapper",
    description:
      "Input your neighborhood or nearest intersection, how you get to school, and seats available. AI clusters nearby families into carpool groups.",
  },
  {
    icon: Users,
    title: "Carpool Cluster Generator",
    description:
      "Forms optimal 2–4 person groups based on proximity, route overlap, and schedule compatibility — with suggested pickup order.",
  },
  {
    icon: Home,
    title: "Home Game Carpooling",
    description:
      "Input expected attendance and neighborhoods. AI generates fan carpool clusters and a shareable Game Day Carpool Map.",
  },
  {
    icon: Car,
    title: "Parent Convenience Mode",
    description:
      "Suggests best families to carpool with, days when carpooling saves the most time, and weekly smart commute tips.",
  },
];

const steps = [
  {
    number: 1,
    icon: MapPin,
    title: "Share your commute info",
    description:
      "Enter your neighborhood or nearest intersection, current transportation method, and how many seats you have available.",
  },
  {
    number: 2,
    icon: Users,
    title: "AI forms your cluster",
    description:
      "Nearby families are grouped into 2–4 person carpools based on proximity, route overlap, and schedule fit.",
  },
  {
    number: 3,
    icon: Map,
    title: "Get your carpool plan",
    description:
      "Receive suggested pickup order, estimated CO₂ savings, and a shareable plan for your group.",
  },
  {
    number: 4,
    icon: Home,
    title: "Coordinate game days",
    description:
      "For home games, input expected attendance and get fan carpool clusters with impact estimates at 30%, 50%, and 70% adoption.",
  },
];

export default function ForStudentsPage() {
  return (
    <>
      <section className="gradient-hero border-b border-earth-200">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
              <GraduationCap className="h-4 w-4" />
              Track B — For Students & Parents
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-earth-900 sm:text-5xl">
              Schoolwide Carpool Clustering
            </h1>
            <p className="mt-6 text-lg text-earth-600">
              Students, parents, and student council use EcoRoute to form
              neighborhood carpool groups for daily commutes and home games —
              making sustainable habits convenient and social.
            </p>
            <Link
              href="/login/student"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700"
            >
              Sign in as Student
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-earth-900">
            Core features for students & families
          </h2>
          <div className="mt-12">
            <FeatureGrid features={features} columns={2} />
          </div>
        </div>
      </section>

      <section className="border-y border-earth-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-earth-900">
            How carpool clustering works
          </h2>
          <div className="mt-16 max-w-3xl mx-auto">
            <HowItWorksSteps steps={steps} accent="teal" />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-earth-200 bg-gradient-to-br from-teal-50 to-white p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-earth-900">
              Impact at every adoption level
            </h2>
            <p className="mt-2 text-earth-600">
              See how much CO₂ your school community could save
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { pct: "30%", savings: "0.4 tons CO₂ / month" },
                { pct: "50%", savings: "0.8 tons CO₂ / month" },
                { pct: "70%", savings: "1.2 tons CO₂ / month" },
              ].map((item) => (
                <div
                  key={item.pct}
                  className="rounded-2xl bg-white p-6 text-center shadow-sm"
                >
                  <p className="text-3xl font-bold text-teal-600">
                    {item.pct}
                  </p>
                  <p className="mt-1 text-sm text-earth-600">carpool adoption</p>
                  <p className="mt-3 text-sm font-medium text-earth-800">
                    saves {item.savings}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Join your school's carpool network"
        description="Connect with nearby families and start reducing emissions on your daily commute."
        primaryHref="/login/student"
        primaryLabel="Student Sign In"
        secondaryHref="/features"
        secondaryLabel="View All Features"
      />
    </>
  );
}
