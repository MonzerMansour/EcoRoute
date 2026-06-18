import { TrendingDown, Bus, Route, Leaf } from "lucide-react";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { buildSeasonSummary } from "@/core/season";
import { formatCo2, VEHICLE_SPECS } from "@/core/emissions";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Season Dashboard" };

export default async function TeacherDashboardPage() {
  const ownerId = await getOwnerId();
  const trips = await getTripRepository().listTrips(ownerId);
  const summary = buildSeasonSummary(trips);

  const baselinePct =
    summary.baselineTotalCo2Kg > 0
      ? Math.round(
          (1 - summary.totalCo2Kg / summary.baselineTotalCo2Kg) * 100,
        )
      : 0;

  const stats = [
    {
      label: "Season CO₂ (current plans)",
      value: formatCo2(summary.totalCo2Kg),
      icon: Leaf,
      hint: `${summary.tripCount} trips`,
    },
    {
      label: "Potential savings",
      value: formatCo2(summary.potentialSavingsKg),
      icon: TrendingDown,
      hint: "if every trip is optimized",
    },
    {
      label: "vs. all-bus baseline",
      value: `${baselinePct}% lower`,
      icon: Bus,
      hint: `baseline ${formatCo2(summary.baselineTotalCo2Kg)}`,
    },
    {
      label: "Optimized season CO₂",
      value: formatCo2(summary.optimalTotalCo2Kg),
      icon: Route,
      hint: "lowest achievable",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Season Emissions Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Your team travel footprint, ranked trips, and the highest-impact
            changes — powered by EcoRoute&apos;s shared AI engine.
          </p>
        </div>
        <ButtonLink href="/teacher/trips">Manage trips</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
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
            {summary.recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Your trips are already well optimized. Nice work!
              </p>
            ) : (
              summary.recommendations.slice(0, 4).map((rec) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Trips ranked by emissions</CardTitle>
          <CardDescription>
            Highest-emission games first — focus your effort here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.rankedTrips.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No trips yet.{" "}
              <ButtonLink href="/teacher/trips" variant="link" className="h-auto p-0">
                Add your first trip
              </ButtonLink>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Distance</TableHead>
                  <TableHead className="text-right">Roster</TableHead>
                  <TableHead>Current plan</TableHead>
                  <TableHead className="text-right">CO₂ (round trip)</TableHead>
                  <TableHead className="text-right">Optimal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.rankedTrips.map(({ trip, co2Kg, optimalCo2Kg }) => {
                  const gap = co2Kg - optimalCo2Kg;
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.name}
                        <span className="block text-xs text-muted-foreground">
                          vs {trip.opponent}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(trip.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {trip.distanceMiles} mi
                      </TableCell>
                      <TableCell className="text-right">
                        {trip.rosterSize}
                      </TableCell>
                      <TableCell>
                        {trip.chosenVehicleType ? (
                          <Badge variant="outline">
                            {VEHICLE_SPECS[trip.chosenVehicleType].shortLabel}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            optimal
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCo2(co2Kg)}
                      </TableCell>
                      <TableCell className="text-right">
                        {gap > 1 ? (
                          <span className="text-primary">
                            {formatCo2(optimalCo2Kg)}
                          </span>
                        ) : (
                          <Badge variant="secondary">best</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
