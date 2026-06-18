import { Lightbulb } from "lucide-react";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { buildSeasonSummary } from "@/core/season";
import { formatCo2 } from "@/core/emissions";
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

export const metadata = { title: "Recommendations" };

export default async function TeacherRecommendationsPage() {
  const ownerId = await getOwnerId();
  const trips = await getTripRepository().listTrips(ownerId);
  const summary = buildSeasonSummary(trips);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Recommendations</h1>
        <p className="mt-2 text-muted-foreground">
          Distance, roster, and load-based suggestions to cut your season&apos;s
          footprint — plus AI insight for any single trip.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All season recommendations</CardTitle>
          <CardDescription>
            Ranked by estimated CO₂ saved. Total potential savings:{" "}
            <span className="font-semibold text-primary">
              {formatCo2(summary.potentialSavingsKg)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.recommendations.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recommendations — your trips are already optimized.{" "}
              <ButtonLink href="/teacher/trips" variant="link" className="h-auto p-0">
                Add more trips
              </ButtonLink>
            </p>
          ) : (
            summary.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`rounded-lg border p-4 ${SEVERITY_STYLES[rec.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{rec.title}</p>
                      {rec.co2SavingsKg > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          −{formatCo2(rec.co2SavingsKg)}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm opacity-90">{rec.detail}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {trips.length > 0 && <TripInsightExplorer trips={trips} />}
    </div>
  );
}
