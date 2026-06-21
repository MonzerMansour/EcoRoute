import { NextResponse } from "next/server";
import { listEvents, createEvent } from "@/lib/data/events-store";

export async function GET() {
  return NextResponse.json(listEvents());
}

export async function POST(req: Request) {
  const body = await req.json();
  const event = createEvent({
    activityId: body.activityId,
    title: body.title,
    date: body.date,
    time: body.time,
    location: body.location,
    distanceMiles: body.distanceMiles,
    rosterSize: body.rosterSize,
    notes: body.notes,
    chosenVehicle: body.chosenVehicle,
    chosenVehicleCo2Kg: body.chosenVehicleCo2Kg,
  });
  return NextResponse.json(event, { status: 201 });
}
