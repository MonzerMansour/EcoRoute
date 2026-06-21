import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { TripManager } from "@/teacher/components/TripManager";

export const metadata = { title: "Outside Trips" };

export default async function TeacherTripsPage() {
  const ownerId = await getOwnerId();
  const trips = await getTripRepository().listTrips(ownerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outside Trips</h1>
        <p className="mt-2 text-muted-foreground">
          Manage every outside trip — sports, field trips, conferences, and
          more. Changes feed directly into your dashboard, optimizer, and
          recommendations.
        </p>
      </div>
      <TripManager initialTrips={trips} />
    </div>
  );
}
