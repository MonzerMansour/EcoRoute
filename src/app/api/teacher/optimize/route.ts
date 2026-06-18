import { NextResponse } from "next/server";
import { optimizeVehicleLoad } from "@/core/optimizer";
import { ALL_VEHICLE_TYPES } from "@/core/emissions";
import type { VehicleType } from "@/lib/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const rosterSize = Number(b.rosterSize);
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
  if (!Number.isFinite(distanceMiles) || distanceMiles <= 0) {
    return NextResponse.json(
      { error: "distanceMiles must be a positive number." },
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
