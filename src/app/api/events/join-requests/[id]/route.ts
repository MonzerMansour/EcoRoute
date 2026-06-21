import { NextResponse } from "next/server";
import { updateJoinRequest } from "@/lib/data/events-store";

// PATCH /api/events/join-requests/[id]  { status: "approved" | "denied" }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  if (status !== "approved" && status !== "denied") {
    return NextResponse.json({ error: "status must be approved or denied" }, { status: 400 });
  }
  const result = await updateJoinRequest(id, status);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
