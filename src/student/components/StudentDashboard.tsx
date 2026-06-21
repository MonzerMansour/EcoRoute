"use client";

import { Users, Route, Leaf, MapPin } from "lucide-react";
import { buildClusters, estimateSavings } from "@/student/lib/carpools";
import { formatCo2 } from "@/core/emissions";
import { useCommuteStore } from "@/student/lib/useCommuteStore";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SOLO_AVG_KG = 0.45; // avg daily solo kg per driver estimate

export function StudentDashboard() {
  const { entries, hydrated } = useCommuteStore();
  const clusters = buildClusters(entries);
  const savings = estimateSavings(entries);
  const bestScenario = savings.scenarios[savings.scenarios.length - 1];

  const stats = [
    {
      label: "People logged",
      value: String(entries.length),
      icon: Users,
      borderColor: "border-l-blue-400",
    },
    {
      label: "Carpool clusters",
      value: String(clusters.length),
      icon: Route,
      borderColor: "border-l-green-400",
    },
    {
      label: "Solo drivers",
      value: String(savings.soloDrivers),
      icon: MapPin,
      borderColor: "border-l-orange-400",
    },
    {
      label: "Yearly CO₂ saved (70%)",
      value: formatCo2(bestScenario?.yearlyKg ?? 0),
      icon: Leaf,
      borderColor: "border-l-emerald-500",
    },
  ];

  const currentSoloCo2 = savings.soloDrivers * SOLO_AVG_KG;
  const carpoolCoverage = Math.min(
    100,
    Math.round((clusters.length / Math.max(1, savings.soloDrivers)) * 100),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.borderColor}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-secondary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {hydrated ? stat.value : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Environmental CO₂ Impact Section */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            <CardTitle className="text-white">Your Environmental Impact</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-emerald-700">
                {hydrated ? formatCo2(currentSoloCo2) : "—"}
              </p>
              <p className="text-sm font-medium">Current CO₂ (solo)</p>
              <p className="text-xs text-muted-foreground">
                est. daily from solo drivers
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-emerald-700">
                {hydrated ? formatCo2(bestScenario?.dailyKg ?? 0) : "—"}
              </p>
              <p className="text-sm font-medium">Carpool Savings</p>
              <p className="text-xs text-muted-foreground">
                est. daily if 70% carpool
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-emerald-700">
                {hydrated ? formatCo2(bestScenario?.yearlyKg ?? 0) : "—"}
              </p>
              <p className="text-sm font-medium">School Year Savings</p>
              <p className="text-xs text-muted-foreground">over 180 school days</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-green-100">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${carpoolCoverage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Carpool coverage: {carpoolCoverage}% of solo drivers have a cluster
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          title="Map your commute"
          desc="Log neighborhoods and commute modes to find carpool partners."
          href="/student/commute"
          cta="Open mapper"
        />
        <ActionCard
          title="View carpool clusters"
          desc="See auto-grouped carpools with suggested pickup order."
          href="/student/carpools"
          cta="See clusters"
        />
        <ActionCard
          title="Estimate savings"
          desc="Model CO₂ savings at 30/50/70% participation and for home games."
          href="/student/savings"
          cta="See savings"
        />
      </div>

      {/* School-Wide Impact */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle>School-Wide Impact</CardTitle>
          <CardDescription>
            Based on active carpool clusters across all students
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-700">
              {hydrated ? formatCo2((bestScenario?.yearlyKg ?? 0) * 3) : "—"}
            </p>
            <p className="text-sm font-medium">Total carpool CO₂ saved this year</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-700">
              {hydrated
                ? String(Math.round(((bestScenario?.yearlyKg ?? 0) * 3) / 21.77))
                : "—"}
            </p>
            <p className="text-sm font-medium">Trees equivalent</p>
            <p className="text-xs text-muted-foreground">
              ~21.77 kg CO₂ absorbed/tree/year
            </p>
          </div>
          <div className="space-y-1 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground">
              Combine with coordinator carpool data for full school footprint.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <ButtonLink href={href} variant="outline" size="sm">
          {cta}
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
