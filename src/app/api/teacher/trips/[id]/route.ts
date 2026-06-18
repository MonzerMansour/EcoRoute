import { NextResponse } from "next/server";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { parseTripDraft } from "@/lib/validation";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ownerId = await getOwnerId();
  const trip = await getTripRepository().getTrip(ownerId, id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }
  return NextResponse.json({ trip });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const ownerId = await getOwnerId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = parseTripDraft(body);
  if (!result.ok || !result.draft) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const trip = await getTripRepository().updateTrip(ownerId, id, result.draft);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }
  return NextResponse.json({ trip });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ownerId = await getOwnerId();
  const ok = await getTripRepository().deleteTrip(ownerId, id);
  if (!ok) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
