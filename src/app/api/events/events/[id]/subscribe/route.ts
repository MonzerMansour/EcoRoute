import { NextResponse } from "next/server";
import { subscribeStudent, unsubscribeStudent, listEvents, getActivityWithPin } from "@/lib/data/events-store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { studentName, action, pin } = await req.json();

  if (action === "unsubscribe") {
    const result = await unsubscribeStudent(id, studentName);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  }

  // For subscribe, validate PIN if the activity has one set
  const events = await listEvents();
  const ev = events.find((e) => e.id === id);
  if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const activity = await getActivityWithPin(ev.activityId);
  if (activity?.pin) {
    if (!pin || pin.trim() !== activity.pin.trim()) {
      return NextResponse.json({ error: "Incorrect PIN. Ask your coordinator for the activity PIN." }, { status: 403 });
    }
  }

  const result = await subscribeStudent(id, studentName);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
