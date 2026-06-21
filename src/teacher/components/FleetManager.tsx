"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Info } from "lucide-react";
import type { VehicleType } from "@/lib/types";
import { VEHICLE_SPECS } from "@/core/emissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const FLEET_STORAGE_KEY = "ecoroute_fleet";

type FuelType = "gas" | "electric" | "hybrid";

export interface FleetEntry {
  id: string;
  type: VehicleType;
  brand: string;
  count: number;
  fuelType: FuelType;
  mpg?: number;
}

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "school_bus", label: "School Bus" },
  { value: "minibus", label: "Minibus" },
  { value: "van", label: "Passenger Van" },
  { value: "carpool", label: "Carpool Car" },
  { value: "solo_car", label: "Solo Car" },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "gas", label: "Gas" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
];

const selectClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function calcCo2PerMile(entry: FleetEntry): number {
  const defaultCo2 = VEHICLE_SPECS[entry.type].co2PerMile;
  if (entry.fuelType === "electric") {
    // 0.386 kg CO2/kWh (US grid avg) ÷ 3 miles/kWh
    return 0.129;
  }
  if (entry.fuelType === "gas") {
    if (entry.mpg && entry.mpg > 0) {
      return 8.887 / entry.mpg;
    }
    return defaultCo2;
  }
  // hybrid
  if (entry.mpg && entry.mpg > 0) {
    return 8.887 / entry.mpg;
  }
  return defaultCo2 * 0.7;
}

function emptyForm(): Omit<FleetEntry, "id"> {
  return {
    type: "school_bus",
    brand: "",
    count: 1,
    fuelType: "gas",
    mpg: undefined,
  };
}

function loadFleet(): FleetEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FLEET_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FleetEntry[]) : [];
  } catch {
    return [];
  }
}

function saveFleet(fleet: FleetEntry[]) {
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
}

export function FleetManager() {
  const [fleet, setFleet] = useState<FleetEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<FleetEntry, "id">>(emptyForm());

  useEffect(() => {
    setFleet(loadFleet());
  }, []);

  function set<K extends keyof Omit<FleetEntry, "id">>(
    key: K,
    value: Omit<FleetEntry, "id">[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(entry: FleetEntry) {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      brand: entry.brand,
      count: entry.count,
      fuelType: entry.fuelType,
      mpg: entry.mpg,
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    let updated: FleetEntry[];
    if (editingId) {
      updated = fleet.map((f) =>
        f.id === editingId ? { ...form, id: editingId } : f
      );
    } else {
      const newEntry: FleetEntry = {
        ...form,
        id: crypto.randomUUID(),
      };
      updated = [...fleet, newEntry];
    }
    saveFleet(updated);
    setFleet(updated);
    setOpen(false);
  }

  function remove(id: string) {
    const updated = fleet.filter((f) => f.id !== id);
    saveFleet(updated);
    setFleet(updated);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>School Vehicle Inventory</CardTitle>
              <CardDescription>
                Define the vehicles your school has available. Your inventory
                is used by the Vehicle Optimizer when you run trip optimizations.
              </CardDescription>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fleet.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No vehicles yet. Click <strong>Add vehicle</strong> to build your
              inventory.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fleet.map((entry) => {
                const co2 = calcCo2PerMile(entry);
                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          {entry.brand || VEHICLE_SPECS[entry.type].label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {VEHICLE_SPECS[entry.type].label}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(entry)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(entry.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{entry.count}× available</Badge>
                      <Badge variant="outline" className="capitalize">
                        {entry.fuelType}
                      </Badge>
                      {entry.mpg && entry.fuelType !== "electric" && (
                        <Badge variant="outline">{entry.mpg} mpg</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ~{co2.toFixed(3)} kg CO₂/mile
                      {entry.fuelType === "electric" && " (grid avg)"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          For electric vehicles, EcoRoute uses a US grid average of 0.386
          kg CO₂/kWh (≈ 0.129 kg/mile at 3 mi/kWh). For gas and hybrid
          vehicles, enter the MPG for a more accurate estimate.
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit vehicle" : "Add vehicle"}
            </DialogTitle>
            <DialogDescription>
              Define a vehicle type in your school&apos;s inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vtype">Vehicle type</Label>
                <select
                  id="vtype"
                  className={selectClass}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as VehicleType)}
                >
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand / Model</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="e.g. Blue Bird, Ford Transit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">How many available</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  value={form.count}
                  onChange={(e) => set("count", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel type</Label>
                <select
                  id="fuel"
                  className={selectClass}
                  value={form.fuelType}
                  onChange={(e) => set("fuelType", e.target.value as FuelType)}
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              {form.fuelType !== "electric" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="mpg">
                    MPG{" "}
                    <span className="text-xs text-muted-foreground">
                      (optional — improves CO₂ accuracy)
                    </span>
                  </Label>
                  <Input
                    id="mpg"
                    type="number"
                    min={1}
                    value={form.mpg ?? ""}
                    onChange={(e) =>
                      set("mpg", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="e.g. 8 for a school bus"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save changes" : "Add vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
