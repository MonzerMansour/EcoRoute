import { NextResponse } from "next/server";
import { optimizeVehicleLoad, MAX_ROSTER_SIZE } from "@/core/optimizer";
import { ALL_VEHICLE_TYPES } from "@/core/emissions";
import { MAX_DISTANCE_MILES } from "@/lib/validation";
import type { VehicleType } from "@/lib/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const rosterRaw = Number(b.rosterSize);
  const rosterSize = Number.isFinite(rosterRaw) ? Math.round(rosterRaw) : NaN;
  const distanceMiles = Number(b.distanceMiles);
  let allowedVehicles = Array.isArray(b.allowedVehicles)
    ? (b.allowedVehicles as unknown[])
        .map((v) => String(v) as VehicleType)
        .filter((v) => ALL_VEHICLE_TYPES.includes(v))
    : [];
  if (allowedVehicles.length === 0) {
    allowedVehicles = ["school_bus", "minibus", "van", "carpool"];
  }

  if (!Number.isFinite(rosterSize) || rosterSize <= 0) {
    return NextResponse.json(
      { error: "rosterSize must be a positive number." },
      { status: 422 },
    );
  }
  if (rosterSize > MAX_ROSTER_SIZE) {
    return NextResponse.json(
      { error: `rosterSize must be ${MAX_ROSTER_SIZE} or fewer.` },
      { status: 422 },
    );
  }
  if (!Number.isFinite(distanceMiles) || distanceMiles <= 0) {
    return NextResponse.json(
      { error: "distanceMiles must be a positive number." },
      { status: 422 },
    );
  }
  if (distanceMiles > MAX_DISTANCE_MILES) {
    return NextResponse.json(
      { error: `distanceMiles must be ${MAX_DISTANCE_MILES} or less.` },
      { status: 422 },
    );
  }

  const plans = optimizeVehicleLoad({
    rosterSize,
    distanceMiles,
    allowedVehicles,
  });

  return NextResponse.json({ plans });
}
