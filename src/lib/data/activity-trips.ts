import type { Trip } from "@/lib/types";
import { listActivities, listEvents } from "@/lib/data/events-store";

/**
 * Fetch all activity events belonging to a coordinator and return them
 * as Trip objects so the recommendations engine can include them.
 * Events without a distance are skipped (can't compute CO₂ without it).
 */
export async function getActivityTrips(coordinatorEmail: string): Promise<(Trip & { activityLabel: string })[]> {
  const [allActivities, allEvents] = await Promise.all([
    listActivities(),
    listEvents(),
  ]);

  const myActivities = allActivities.filter(
    (a) => a.coordinatorId?.toLowerCase() === coordinatorEmail.toLowerCase(),
  );
  if (myActivities.length === 0) return [];

  const activityMap = new Map(myActivities.map((a) => [a.id, a]));

  const trips: (Trip & { activityLabel: string })[] = [];
  for (const ev of allEvents) {
    const activity = activityMap.get(ev.activityId);
    if (!activity) continue;
    if (!ev.includeInTrips) continue;
    if (!ev.distanceMiles) continue; // skip events with no distance

    trips.push({
      id: `act_${ev.id}`,
      ownerId: coordinatorEmail,
      name: ev.title,
      opponent: ev.location ?? activity.name,
      date: ev.date,
      distanceMiles: ev.distanceMiles,
      rosterSize: ev.rosterSize ?? ev.subscribedStudents.length ?? 0,
      tripType: "other",
      departureTime: ev.time,
      allowedVehicles: ["school_bus", "minibus", "van", "carpool"],
      chosenVehicleType: undefined,
      notes: ev.notes,
      createdAt: ev.createdAt,
      updatedAt: ev.createdAt,
      activityLabel: activity.name,
    });
  }

  return trips.sort((a, b) => a.date.localeCompare(b.date));
}
