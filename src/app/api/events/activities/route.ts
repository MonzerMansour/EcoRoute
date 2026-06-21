import { NextResponse } from "next/server";
import { listActivities, createActivity } from "@/lib/data/events-store";

export async function GET() {
  return NextResponse.json(listActivities());
}

export async function POST(req: Request) {
  const body = await req.json();
  const activity = createActivity({
    name: body.name,
    description: body.description,
    coordinatorId: body.coordinatorId ?? "coordinator",
    school: body.school ?? "EcoRoute High",
  });
  return NextResponse.json(activity, { status: 201 });
}
