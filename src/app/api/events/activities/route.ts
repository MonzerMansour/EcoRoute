import { NextResponse } from "next/server";
import { listActivities, createActivity } from "@/lib/data/events-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim() ?? "";
  const includePin = searchParams.get("includePin") === "true";
  const all = await listActivities(includePin);
  const result = email ? all.filter((a) => a.coordinatorId?.toLowerCase() === email) : all;
  // Always strip pin unless explicitly requested (coordinator dashboard only)
  const safe = includePin ? result : result.map(({ pin: _pin, ...a }) => a);
  return NextResponse.json(safe);
}

export async function POST(req: Request) {
  const body = await req.json();
  const activity = await createActivity({
    name: body.name,
    description: body.description,
    coordinatorId: body.coordinatorId ?? "coordinator",
    school: body.school ?? "EcoRoute High",
    pin: body.pin ?? undefined,
  });
  return NextResponse.json(activity, { status: 201 });
}
