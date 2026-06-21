import { Lightbulb, TrendingDown, Bus, Leaf } from "lucide-react";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { getActivityTrips } from "@/lib/data/activity-trips";
import { buildSeasonSummary } from "@/core/season";
import { formatCo2, VEHICLE_SPECS } from "@/core/emissions";
import { SEVERITY_STYLES } from "@/teacher/lib/display";
import { TripInsightExplorer } from "@/teacher/components/TripInsightExplorer";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Trip } from "@/lib/types";

export const metadata = { title: "Optimization Overview" };

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 100);
}

export default async function TeacherRecommendationsPage() {
  const ownerId = await getOwnerId();
  const [trips, activityTrips] = await Promise.all([
    getTripRepository().listTrips(ownerId),
    getActivityTrips(ownerId),
  ]);
  const allTrips: Trip[] = [...trips, ...activityTrips];
  const summary = buildSeasonSummary(allTrips);

  const savedVsBaseline = summary.baselineTotalCo2Kg - summary.totalCo2Kg;
  const baselinePct = pct(savedVsBaseline, summary.baselineTotalCo2Kg);
  const optimizePct = pct(summary.potentialSavingsKg, summary.totalCo2Kg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Optimization Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Every trip ranked by footprint — with specific actions to cut your season CO₂.
        </p>
      </div>

      {/* Season summary bar */}
      {allTrips.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Leaf className="h-3.5 w-3.5" /> Season footprint
            </div>
            <p className="text-2xl font-bold text-primary">{formatCo2(summary.totalCo2Kg)}</p>
            <p className="text-xs text-muted-foreground">{summary.tripCount} trips</p>
          </div>
          <div className="rounded-lg border bg-emerald-50 border-emerald-200 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600" /> Saved vs. all-bus
            </div>
            <p className="text-2xl font-bold text-emerald-700">{formatCo2(Math.max(0, savedVsBaseline))}</p>
            <p className="text-xs text-muted-foreground">{baselinePct}% below school-bus-only baseline ({formatCo2(summary.baselineTotalCo2Kg)})</p>
          </div>
          <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bus className="h-3.5 w-3.5 text-amber-600" /> Still optimizable
            </div>
            <p className="text-2xl font-bold text-amber-700">{formatCo2(summary.potentialSavingsKg)}</p>
            <p className="text-xs text-muted-foreground">{optimizePct}% of current footprint · optimal target {formatCo2(summary.optimalTotalCo2Kg)}</p>
          </div>
        </div>
      )}

      {/* All trips ranked */}
      <Card>
        <CardHeader>
          <CardTitle>All trips — ranked by CO₂</CardTitle>
          <CardDescription>
            Every trip shown, highest footprint first. Green = already at or near optimal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.rankedTrips.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No trips yet.{" "}
              <ButtonLink href="/teacher/trips" variant="link" className="h-auto p-0">
                Add trips
              </ButtonLink>{" "}
              or check the &ldquo;Show in Trips section&rdquo; box on activity events.
            </p>
          ) : (
            summary.rankedTrips.map(({ trip, co2Kg, optimalCo2Kg, baselineCo2Kg, optimalPlan }) => {
              const gap = Math.max(0, Math.round(co2Kg - optimalCo2Kg));
              const isOptimal = gap <= 1;
              const savingsPct = pct(gap, co2Kg);
              const vsBaseline = Math.round(baselineCo2Kg - co2Kg);
              return (
                <div
                  key={trip.id}
                  className={`rounded-lg border p-4 space-y-2 ${
                    isOptimal
                      ? "border-emerald-200 bg-emerald-50/60"
                      : gap > 30
                      ? "border-red-200 bg-red-50/60"
                      : "border-amber-200 bg-amber-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{trip.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.distanceMiles} mi · {trip.rosterSize} students
                        {trip.opponent ? ` · ${trip.opponent}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold">{formatCo2(co2Kg)}</span>
                      {isOptimal ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">Optimized</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">−{formatCo2(gap)} possible</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded bg-white/70 px-2 py-1.5 border">
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-semibold">{formatCo2(co2Kg)}</p>
                      {trip.chosenVehicleType && (
                        <p className="text-muted-foreground">{VEHICLE_SPECS[trip.chosenVehicleType].shortLabel}</p>
                      )}
                    </div>
                    <div className="rounded bg-white/70 px-2 py-1.5 border border-emerald-200">
                      <p className="text-muted-foreground">Optimal</p>
                      <p className="font-semibold text-emerald-700">{formatCo2(optimalCo2Kg)}</p>
                      <p className="text-muted-foreground truncate">{optimalPlan.label}</p>
                    </div>
                    <div className="rounded bg-white/70 px-2 py-1.5 border">
                      <p className="text-muted-foreground">All-bus</p>
                      <p className="font-semibold">{formatCo2(baselineCo2Kg)}</p>
                      {vsBaseline > 0 && <p className="text-emerald-600">−{formatCo2(vsBaseline)} saved</p>}
                    </div>
                  </div>

                  {!isOptimal && (
                    <p className="text-xs text-muted-foreground">
                      Switching to <strong>{optimalPlan.label}</strong> saves {formatCo2(gap)} ({savingsPct}% of this trip&apos;s footprint).
                    </p>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Smart recommendations (only those with actions) */}
      {summary.recommendations.filter((r) => r.co2SavingsKg > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action items</CardTitle>
            <CardDescription>
              Specific changes that would save{" "}
              <span className="font-semibold text-primary">{formatCo2(summary.potentialSavingsKg)}</span>{" "}
              this season.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recommendations
              .filter((r) => r.co2SavingsKg > 0)
              .map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-lg border p-4 ${SEVERITY_STYLES[rec.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium">{rec.title}</p>
                        <Badge variant="secondary" className="shrink-0">
                          −{formatCo2(rec.co2SavingsKg)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm opacity-90">{rec.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {allTrips.length > 0 && <TripInsightExplorer trips={allTrips} />}
    </div>
  );
}
