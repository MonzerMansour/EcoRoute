import { NextResponse } from "next/server";
import { listJoinRequests, createJoinRequest, listActivities } from "@/lib/data/events-store";

// GET /api/events/join-requests?studentName=...
// GET /api/events/join-requests?coordinatorEmail=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentName = searchParams.get("studentName")?.trim() ?? "";
  const coordinatorEmail = searchParams.get("coordinatorEmail")?.trim().toLowerCase() ?? "";

  if (studentName) {
    const requests = await listJoinRequests({ studentName });
    return NextResponse.json(requests);
  }

  if (coordinatorEmail) {
    const allActivities = await listActivities();
    const myActivityIds = allActivities
      .filter((a) => a.coordinatorId?.toLowerCase() === coordinatorEmail)
      .map((a) => a.id);
    if (myActivityIds.length === 0) return NextResponse.json([]);
    const requests = await listJoinRequests({ activityIds: myActivityIds });
    return NextResponse.json(requests);
  }

  return NextResponse.json({ error: "studentName or coordinatorEmail required" }, { status: 400 });
}

// POST /api/events/join-requests
export async function POST(req: Request) {
  const { activityId, studentName, studentEmail } = await req.json();
  if (!activityId || !studentName) {
    return NextResponse.json({ error: "activityId and studentName are required" }, { status: 400 });
  }
  const request = await createJoinRequest({ activityId, studentName, studentEmail });
  return NextResponse.json(request, { status: 201 });
}
