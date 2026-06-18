import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { summarizeTrip } from "@/core/season";
import { formatCo2 } from "@/core/emissions";
import { TRIP_TYPE_LABELS, formatDate } from "@/teacher/lib/display";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Events" };

function monthKey(date: string): string {
  try {
    return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Scheduled";
  }
}

export default async function TeacherEventsPage() {
  const ownerId = await getOwnerId();
  const trips = await getTripRepository().listTrips(ownerId);

  const groups = new Map<
    string,
    { trips: typeof trips; co2Kg: number }
  >();
  for (const trip of trips) {
    const key = monthKey(trip.date);
    const summary = summarizeTrip(trip);
    const group = groups.get(key) ?? { trips: [], co2Kg: 0 };
    group.trips.push(trip);
    group.co2Kg += summary.co2Kg;
    groups.set(key, group);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Season Events</h1>
          <p className="mt-2 text-muted-foreground">
            Your travel blocks grouped by month, with the footprint of each
            block.
          </p>
        </div>
        <ButtonLink href="/teacher/trips">Add trip</ButtonLink>
      </div>

      {groups.size === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No events scheduled yet.{" "}
            <ButtonLink href="/teacher/trips" variant="link" className="h-auto p-0">
              Plan your season
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([month, group]) => (
            <Card key={month}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{month}</CardTitle>
                    <CardDescription>
                      {group.trips.length} trip
                      {group.trips.length === 1 ? "" : "s"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{formatCo2(group.co2Kg)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{trip.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(trip.date)} · vs {trip.opponent}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {TRIP_TYPE_LABELS[trip.tripType]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {trip.distanceMiles} mi
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
