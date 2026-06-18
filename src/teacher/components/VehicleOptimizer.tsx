"use client";

import { useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import type { RankedVehiclePlan, VehicleType } from "@/lib/types";
import { VEHICLE_SPECS, formatCo2 } from "@/core/emissions";
import { VEHICLE_OPTIONS } from "@/teacher/lib/display";
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

export function VehicleOptimizer() {
  const [rosterSize, setRosterSize] = useState(18);
  const [distanceMiles, setDistanceMiles] = useState(24);
  const [allowed, setAllowed] = useState<VehicleType[]>([
    "school_bus",
    "minibus",
    "van",
    "carpool",
  ]);
  const [plans, setPlans] = useState<RankedVehiclePlan[] | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(v: VehicleType) {
    setAllowed((a) =>
      a.includes(v) ? a.filter((x) => x !== v) : [...a, v],
    );
  }

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
          allowedVehicles: allowed,
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
            Find the lowest-emission configuration. Sometimes 3 carpools beat a
            bus — EcoRoute calculates the exact best option.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-2">
              <Label>Available vehicles</Label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map((opt) => {
                  const checked = allowed.includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                        checked
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {VEHICLE_SPECS[opt.value].label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || allowed.length === 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Optimize"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ranked configurations</CardTitle>
          <CardDescription>
            Round-trip CO₂ for each feasible setup, lowest first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!plans ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Enter trip details and click <strong>Optimize</strong>.
            </p>
          ) : plans.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No feasible configuration — select at least one vehicle type with
              enough capacity.
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
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {plan.rank === 1 && (
                      <Trophy className="h-4 w-4 text-primary" />
                    )}
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
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
