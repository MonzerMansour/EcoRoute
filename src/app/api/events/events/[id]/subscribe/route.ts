import { NextResponse } from "next/server";
import { subscribeStudent, unsubscribeStudent } from "@/lib/data/events-store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { studentName, action } = await req.json();
  const result = action === "unsubscribe"
    ? unsubscribeStudent(id, studentName)
    : subscribeStudent(id, studentName);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
