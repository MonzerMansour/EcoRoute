import { NextResponse } from "next/server";
import { listActivities, listEvents, subscribeStudent } from "@/lib/data/events-store";

export async function POST(req: Request) {
  const { coordinatorEmail, eventName, studentName } = await req.json();

  if (!coordinatorEmail || !eventName || !studentName) {
    return NextResponse.json({ error: "coordinatorEmail, eventName, and studentName are required." }, { status: 400 });
  }

  const allActivities = await listActivities();
  const coordActivities = allActivities.filter(
    (a) => a.coordinatorId?.toLowerCase() === coordinatorEmail.toLowerCase().trim()
  );

  if (coordActivities.length === 0) {
    return NextResponse.json({ error: "No activities found for that coordinator email." }, { status: 404 });
  }

  const coordActivityIds = new Set(coordActivities.map((a) => a.id));
  const allEvents = await listEvents();

  const match = allEvents.find(
    (e) =>
      coordActivityIds.has(e.activityId) &&
      e.title.toLowerCase().includes(eventName.toLowerCase().trim())
  );

  if (!match) {
    return NextResponse.json({ error: "No event found matching that name for this coordinator." }, { status: 404 });
  }

  const updated = await subscribeStudent(match.id, studentName);
  return NextResponse.json({ ok: true, event: updated });
}
