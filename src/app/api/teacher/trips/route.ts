import { NextResponse } from "next/server";
import type { SportsTrip } from "@/teacher/types";

/** Placeholder trip store — replace with database in production. */
const trips: SportsTrip[] = [];

export async function GET() {
  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const body = await request.json();
  const trip: SportsTrip = {
    id: crypto.randomUUID(),
    name: body.name ?? "Untitled Trip",
    opponent: body.opponent ?? "",
    date: body.date ?? new Date().toISOString().slice(0, 10),
    distanceMiles: Number(body.distanceMiles) || 0,
    rosterSize: Number(body.rosterSize) || 0,
    tripType: body.tripType ?? "away_game",
  };

  trips.push(trip);
  return NextResponse.json(trip, { status: 201 });
}
