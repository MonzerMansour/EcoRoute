import { NextResponse } from "next/server";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { optimizeVehicleLoad } from "@/core/optimizer";
import { ALL_VEHICLE_TYPES } from "@/core/emissions";
import { generateTripInsight, isAiConfigured } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { tripId } = (body ?? {}) as { tripId?: string };
  if (!tripId) {
    return NextResponse.json({ error: "tripId is required." }, { status: 422 });
  }

  const ownerId = await getOwnerId();
  const trip = await getTripRepository().getTrip(ownerId, tripId);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const plans = optimizeVehicleLoad({
    rosterSize: trip.rosterSize,
    distanceMiles: trip.distanceMiles,
    allowedVehicles:
      trip.allowedVehicles.length > 0 ? trip.allowedVehicles : ALL_VEHICLE_TYPES,
  });

  const insight = await generateTripInsight(trip, plans);
  return NextResponse.json({ insight, plans, aiConfigured: isAiConfigured() });
}
