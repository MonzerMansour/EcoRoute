import { NextResponse } from "next/server";
import { listActivities, createActivity } from "@/lib/data/events-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim() ?? "";
  const all = await listActivities();
  const result = email ? all.filter((a) => a.coordinatorId?.toLowerCase() === email) : all;
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const activity = await createActivity({
    name: body.name,
    description: body.description,
    coordinatorId: body.coordinatorId ?? "coordinator",
    school: body.school ?? "EcoRoute High",
  });
  return NextResponse.json(activity, { status: 201 });
}
