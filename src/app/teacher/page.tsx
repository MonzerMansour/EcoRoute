import { TrendingDown, Bus, Route, Leaf, TreePine } from "lucide-react";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { getActivityTrips } from "@/lib/data/activity-trips";
import { buildSeasonSummary } from "@/core/season";
import { formatCo2 } from "@/core/emissions";
import { AiSeasonReport } from "@/teacher/components/AiSeasonReport";
import { SEVERITY_STYLES, formatDate } from "@/teacher/lib/display";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Emissions Dashboard" };

export default async function TeacherDashboardPage() {
  const ownerId = await getOwnerId();
  const [trips, activityTrips] = await Promise.all([
    getTripRepository().listTrips(ownerId),
    getActivityTrips(ownerId),
  ]);
  const summary = buildSeasonSummary([...trips, ...activityTrips]);

  const savedVsBaseline = Math.max(0, summary.baselineTotalCo2Kg - summary.totalCo2Kg);
  const baselinePct =
    summary.baselineTotalCo2Kg > 0
      ? Math.round((savedVsBaseline / summary.baselineTotalCo2Kg) * 100)
      : 0;

  const stats = [
    {
      label: "Season CO₂ (current plans)",
      value: formatCo2(summary.totalCo2Kg),
      icon: Leaf,
      hint: `across ${summary.tripCount} trip${summary.tripCount === 1 ? "" : "s"}`,
    },
    {
      label: "Still optimizable",
      value: formatCo2(summary.potentialSavingsKg),
      icon: TrendingDown,
      hint: `optimal target: ${formatCo2(summary.optimalTotalCo2Kg)}`,
    },
    {
      label: "Saved vs. all-bus baseline",
      value: formatCo2(savedVsBaseline),
      icon: Bus,
      hint: `${baselinePct}% below ${formatCo2(summary.baselineTotalCo2Kg)} all-bus`,
    },
    {
      label: "Best achievable CO₂",
      value: formatCo2(summary.optimalTotalCo2Kg),
      icon: Route,
      hint: "if every trip switches to optimal vehicle",
    },
  ];

  const topChanges = summary.recommendations
    .filter((r) => r.co2SavingsKg > 0)
    .slice(0, 3);

  return (
    <div className="space-y-6">
<div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Emissions Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your outside trip footprint and top actions to reduce it.
          </p>
        </div>
        <ButtonLink href="/teacher/trips" size="sm">Manage trips</ButtonLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiSeasonReport />

        <Card>
          <CardHeader>
            <CardTitle>Top high-impact changes</CardTitle>
            <CardDescription>
              Computed reductions you can make without changing the schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Your trips are already well optimized. Nice work!
              </p>
            ) : (
              topChanges.map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-lg border p-3 ${SEVERITY_STYLES[rec.severity]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{rec.title}</p>
                    {rec.co2SavingsKg > 0 && (
                      <Badge variant="secondary" className="shrink-0">
                        −{formatCo2(rec.co2SavingsKg)}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs opacity-90">{rec.detail}</p>
                </div>
              ))
            )}
            <ButtonLink
              href="/teacher/recommendations"
              variant="link"
              className="h-auto p-0"
            >
              View all recommendations →
            </ButtonLink>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-emerald-600" />
            <CardTitle>School-Wide Environmental Impact</CardTitle>
          </div>
          <CardDescription>
            Combine with student carpool data for full school footprint
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-700">
              {formatCo2(summary.baselineTotalCo2Kg - summary.totalCo2Kg)}
            </p>
            <p className="text-sm font-medium">Total CO₂ saved vs all-bus</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-700">
              {formatCo2(summary.potentialSavingsKg)}{" "}
              <span className="text-base font-normal text-muted-foreground">
                potential
              </span>
            </p>
            <p className="text-sm font-medium">Optimized vs current</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-emerald-700">
              {summary.tripCount}
            </p>
            <p className="text-sm font-medium">Trips this season</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
