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

export function StudentDashboard() {
  const { entries, hydrated } = useCommuteStore();
  const clusters = buildClusters(entries);
  const savings = estimateSavings(entries);
  const bestScenario = savings.scenarios[savings.scenarios.length - 1];

  const stats = [
    { label: "People logged", value: String(entries.length), icon: Users },
    { label: "Carpool clusters", value: String(clusters.length), icon: Route },
    { label: "Solo drivers", value: String(savings.soloDrivers), icon: MapPin },
    {
      label: "Yearly CO₂ saved (70%)",
      value: formatCo2(bestScenario?.yearlyKg ?? 0),
      icon: Leaf,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
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
