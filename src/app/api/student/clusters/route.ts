import { NextResponse } from "next/server";
import { buildCarpoolClusters } from "@/student/lib/carpools";
import type { NeighborhoodEntry } from "@/student/types";

export async function POST(request: Request) {
  const body = await request.json();
  const entries = (body.entries ?? []) as NeighborhoodEntry[];

  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "entries array is required" }, { status: 400 });
  }

  const clusters = buildCarpoolClusters(entries);
  return NextResponse.json({ clusters });
}
