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
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <section className="gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 px-4 py-1.5">
              <Leaf className="h-4 w-4" />
              AI for Smarter School Transportation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Cut travel emissions{" "}
              <span className="text-primary">without changing</span> your schedule
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              EcoRoute uses AI to optimize team buses, vans, and carpools for away
              games — and clusters neighborhood carpools for daily commutes and
              home games.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/login/teacher" size="lg">
                I&apos;m a Teacher
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/login/student" variant="outline" size="lg">
                I&apos;m a Student / Parent
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/80 text-center backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TrackComparison />

      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">Shared AI Engine</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              One brain powering both tracks
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Clustering, optimization, prediction, and impact estimation — all
              unified so schools and families work from the same intelligence.
            </p>
          </div>
          <div className="mt-12">
            <FeatureGrid features={aiFeatures} columns={4} />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">The Action Loop</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                From data to decisions in minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Upload your schedule or commute info. AI analyzes emissions, ranks
                high-impact trips, and delivers actionable plans.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: MapPin, text: "Input distances, rosters, and neighborhoods" },
                  { icon: Zap, text: "AI calculates emissions and optimal vehicle configs" },
                  { icon: Cloud, text: "Get ranked recommendations and shareable reports" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <ButtonLink href="/how-it-works" variant="link" className="mt-8 h-auto p-0">
                See how it works
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/10 p-2">
              <CardContent className="space-y-4 p-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Bus className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm">Season Emissions Report</CardTitle>
                    </div>
                    <CardDescription>
                      Top 3 high-impact changes for your basketball season
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      "Swap Game 4 opponent → saves 18% CO₂",
                      "Use 3 vans instead of bus for Game 7 → 40% less",
                      "Carpool for Game 2 (12 mi) → recommended",
                    ].map((rec) => (
                      <Badge key={rec} variant="secondary" className="block w-full justify-start whitespace-normal py-2">
                        {rec}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-secondary" />
                      <CardTitle className="text-sm">Game Day Carpool Map</CardTitle>
                    </div>
                    <CardDescription>
                      4 clusters formed · 50% carpool adoption saves 1.2 tons CO₂
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {["Oak St", "Maple Ave", "Pine Rd", "Cedar Ln"].map((n) => (
                      <Badge key={n} variant="outline">{n}</Badge>
                    ))}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Who uses EcoRoute?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, role: "Coaches", desc: "Season travel planning" },
              { icon: Bus, role: "Athletic Directors", desc: "Fleet optimization" },
              { icon: Car, role: "Parents", desc: "Morning drop-off carpools" },
              { icon: Leaf, role: "Sustainability Clubs", desc: "Campus impact tracking" },
            ].map((item) => (
              <Card key={item.role} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold">{item.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
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
