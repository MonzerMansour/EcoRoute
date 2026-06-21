import { NextResponse } from "next/server";
import { updateActivity, deleteActivity } from "@/lib/data/events-store";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const result = updateActivity(id, body);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteActivity(id);
  return NextResponse.json({ ok: true });
}
