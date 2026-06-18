import { NextResponse } from "next/server";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { parseTripDraft } from "@/lib/validation";

export async function GET() {
  const ownerId = await getOwnerId();
  const trips = await getTripRepository().listTrips(ownerId);
  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const ownerId = await getOwnerId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = parseTripDraft(body);
  if (!result.ok || !result.draft) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const trip = await getTripRepository().createTrip(ownerId, result.draft);
  return NextResponse.json({ trip }, { status: 201 });
}
