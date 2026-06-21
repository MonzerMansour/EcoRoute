"use client";

import { useState, useEffect } from "react";
import { Loader2, Trophy, AlertTriangle } from "lucide-react";
import type { RankedVehiclePlan, VehicleType } from "@/lib/types";
import { VEHICLE_SPECS, formatCo2 } from "@/core/emissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FleetEntry } from "./FleetManager";

const FLEET_KEY = "ecoroute_fleet";

function loadFleet(): FleetEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FLEET_KEY);
    return raw ? (JSON.parse(raw) as FleetEntry[]) : [];
  } catch { return []; }
}

/** Collapse fleet entries into counts per vehicle type */
function fleetToCounts(fleet: FleetEntry[]): Partial<Record<VehicleType, number>> {
  const counts: Partial<Record<VehicleType, number>> = {};
  for (const entry of fleet) {
    counts[entry.type] = (counts[entry.type] ?? 0) + entry.count;
  }
  return counts;
}

export function VehicleOptimizer({
  initialRoster,
  initialDistance,
  onSelectPlan,
}: {
  initialRoster?: number;
  initialDistance?: number;
  onSelectPlan?: (plan: RankedVehiclePlan) => void;
}) {
  const [fleet, setFleet] = useState<FleetEntry[]>([]);
  const [rosterSize, setRosterSize] = useState(initialRoster ?? 18);
  const [distanceMiles, setDistanceMiles] = useState(initialDistance ?? 24);
  const [plans, setPlans] = useState<RankedVehiclePlan[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFleet(loadFleet());
  }, []);

  // When initial values change (e.g. from event linking), update fields
  useEffect(() => { if (initialRoster) setRosterSize(initialRoster); }, [initialRoster]);
  useEffect(() => { if (initialDistance) setDistanceMiles(initialDistance); }, [initialDistance]);

  const inventoryCounts = fleetToCounts(fleet);
  const allowedVehicles = Object.keys(inventoryCounts) as VehicleType[];
  const hasInventory = fleet.length > 0;

  async function optimize(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rosterSize,
          distanceMiles,
          allowedVehicles: hasInventory ? allowedVehicles : ["school_bus", "minibus", "van", "carpool"],
          inventoryCounts: hasInventory ? inventoryCounts : undefined,
        }),
      });
      const data = await res.json();
      setPlans(data.plans ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Load Optimizer</CardTitle>
          <CardDescription>
            Find the lowest-emission configuration using your school&apos;s inventory.
            {hasInventory
              ? ` Constrained to ${fleet.length} vehicle type${fleet.length !== 1 ? "s" : ""} in your inventory.`
              : " Add vehicles in Inventory to constrain results to what you actually have."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasInventory && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>No inventory set — showing all vehicle types. Go to <strong>Inventory</strong> to define what your school has.</span>
            </div>
          )}

          {hasInventory && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Your inventory</p>
              <div className="flex flex-wrap gap-2">
                {fleet.map((entry) => (
                  <Badge key={entry.id} variant="secondary" className="text-xs">
                    {entry.count}× {VEHICLE_SPECS[entry.type].label}
                    {entry.brand ? ` (${entry.brand})` : ""}
                    {entry.mpg && entry.fuelType !== "electric" ? ` · ${entry.mpg} mpg` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={optimize} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roster">Roster size</Label>
              <Input
                id="roster"
                type="number"
                min={1}
                value={rosterSize || ""}
                onChange={(e) => setRosterSize(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (mi, one way)</Label>
              <Input
                id="distance"
                type="number"
                min={1}
                value={distanceMiles || ""}
                onChange={(e) => setDistanceMiles(Number(e.target.value))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Optimize"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ranked configurations</CardTitle>
          <CardDescription>
            Round-trip CO₂ for each feasible setup using your inventory, lowest first.
            {onSelectPlan && " Click a result to apply it to the event."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!plans ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Enter trip details and click <strong>Optimize</strong>.
            </p>
          ) : plans.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No feasible configuration — your inventory may not have enough capacity for this roster.
              {hasInventory && " Try adding more vehicles in Inventory."}
            </p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.label}
                className={cn(
                  "rounded-lg border p-4",
                  plan.rank === 1
                    ? "border-primary bg-primary/5"
                    : "border-border",
                  onSelectPlan && "cursor-pointer hover:border-primary/60 hover:bg-muted/50 transition-colors",
                )}
                onClick={() => onSelectPlan?.(plan)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {plan.rank === 1 && <Trophy className="h-4 w-4 text-primary" />}
                    <span className="font-semibold">{plan.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{formatCo2(plan.co2Kg)}</span>
                    {plan.rank === 1 ? (
                      <Badge className="ml-2">Best</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">
                        +{plan.pctWorseThanBest}%
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.rationale} · {plan.totalSeats} seats
                </p>
                {onSelectPlan && plan.rank === 1 && (
                  <p className="mt-1 text-xs font-medium text-primary">Click to apply to event →</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
