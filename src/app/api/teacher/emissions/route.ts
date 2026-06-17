import { NextResponse } from "next/server";
import { calculateTripEmissions } from "@/core/emissions";
import type { VehicleType } from "@/core/types";

export async function POST(request: Request) {
  const body = await request.json();
  const distanceMiles = Number(body.distanceMiles);
  const vehicleType = body.vehicleType as VehicleType;

  if (!distanceMiles || !vehicleType) {
    return NextResponse.json(
      { error: "distanceMiles and vehicleType are required" },
      { status: 400 },
    );
  }

  const result = calculateTripEmissions({ distanceMiles, vehicleType });
  return NextResponse.json(result);
}
