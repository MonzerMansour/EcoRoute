import { NextResponse } from "next/server";
import { listNotifications, markAllRead } from "@/lib/data/events-store";

export async function GET() {
  return NextResponse.json(await listNotifications());
}

export async function POST() {
  await markAllRead();
  return NextResponse.json({ ok: true });
}
