import type { Metadata } from "next";
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
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";

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
      <section className="gradient-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How EcoRoute works
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
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
                  <span className="text-sm font-bold text-primary">
                    Step {item.step}
                  </span>
                  <h2 className="mt-2 text-3xl font-bold">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Card
                  className={index % 2 === 1 ? "lg:order-1" : ""}
                >
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {item.inputs.map((input) => (
                        <li
                          key={input}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {input}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two tracks diagram */}
      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">
            Two tracks, one engine
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <Bus className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-4 font-semibold">
                  School Travel
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Teams, field trips, away events
                </p>
                <ButtonLink
                  href="/for-schools"
                  variant="link"
                  className="mt-4 h-auto p-0"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </ButtonLink>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <Brain className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-4 font-semibold">
                  Shared AI Engine
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clustering · Optimization · Prediction · Impact
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <Database className="h-4 w-4 text-primary" />
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Car className="mx-auto h-10 w-10 text-secondary" />
                <h3 className="mt-4 font-semibold">
                  Daily Carpools
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Commutes, home games, fan rides
                </p>
                <ButtonLink
                  href="/for-students"
                  variant="link"
                  className="mt-4 h-auto p-0 text-secondary"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </ButtonLink>
              </CardContent>
            </Card>
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
