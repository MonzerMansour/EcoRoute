import { NextResponse } from "next/server";
import type { NeighborhoodEntry } from "@/student/types";

/** Placeholder commute store — replace with database in production. */
const entries: NeighborhoodEntry[] = [];

export async function GET() {
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = await request.json();
  const entry: NeighborhoodEntry = {
    id: crypto.randomUUID(),
    studentName: body.studentName ?? "Anonymous",
    neighborhood: body.neighborhood ?? "",
    lat: Number(body.lat) || 0,
    lng: Number(body.lng) || 0,
    commuteMode: body.commuteMode ?? "solo_car",
  };

  entries.push(entry);
  return NextResponse.json(entry, { status: 201 });
}
