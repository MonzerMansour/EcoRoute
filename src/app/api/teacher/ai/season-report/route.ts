import { NextResponse } from "next/server";
import { getTripRepository } from "@/lib/data";
import { getOwnerId } from "@/lib/session";
import { buildSeasonSummary } from "@/core/season";
import { generateSeasonReport, isAiConfigured } from "@/lib/ai/gemini";

export async function GET() {
  const ownerId = await getOwnerId();
  const trips = await getTripRepository().listTrips(ownerId);
  const summary = buildSeasonSummary(trips);
  const report = await generateSeasonReport(summary);
  return NextResponse.json({ report, aiConfigured: isAiConfigured() });
}

export const POST = GET;
