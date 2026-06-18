"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Trip, TripDraft, TripType, VehicleType } from "@/lib/types";
import { VEHICLE_SPECS } from "@/core/emissions";
import { TRIP_TYPE_LABELS, VEHICLE_OPTIONS, formatDate } from "@/teacher/lib/display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TRIP_TYPES: TripType[] = ["away_game", "field_trip", "club", "scrimmage"];

const emptyForm = (): TripDraft => ({
  name: "",
  opponent: "",
  date: "",
  distanceMiles: 0,
  rosterSize: 0,
  tripType: "away_game",
  departureTime: "",
  allowedVehicles: ["school_bus", "minibus", "van", "carpool"],
  chosenVehicleType: undefined,
  notes: "",
});

const selectClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function TripManager({ initialTrips }: { initialTrips: Trip[] }) {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TripDraft>(emptyForm());
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function set<K extends keyof TripDraft>(key: K, value: TripDraft[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleVehicle(v: VehicleType) {
    setForm((f) => {
      const has = f.allowedVehicles.includes(v);
      return {
        ...f,
        allowedVehicles: has
          ? f.allowedVehicles.filter((x) => x !== v)
          : [...f.allowedVehicles, v],
      };
    });
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setErrors([]);
    setOpen(true);
  }

  function openEdit(trip: Trip) {
    setEditingId(trip.id);
    setForm({
      name: trip.name,
      opponent: trip.opponent,
      date: trip.date,
      distanceMiles: trip.distanceMiles,
      rosterSize: trip.rosterSize,
      tripType: trip.tripType,
      departureTime: trip.departureTime ?? "",
      allowedVehicles: trip.allowedVehicles,
      chosenVehicleType: trip.chosenVehicleType,
      notes: trip.notes ?? "",
    });
    setErrors([]);
    setOpen(true);
  }

  async function refresh() {
    const res = await fetch("/api/teacher/trips");
    const data = await res.json();
    setTrips(data.trips ?? []);
    router.refresh();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);
    try {
      const url = editingId
        ? `/api/teacher/trips/${editingId}`
        : "/api/teacher/trips";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors(data.errors ?? [data.error ?? "Could not save trip."]);
        return;
      }
      setOpen(false);
      await refresh();
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/teacher/trips/${id}`, { method: "DELETE" });
      await refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Season & Event Travel Planner</CardTitle>
            <CardDescription>
              Add away games, field trips, and club travel. EcoRoute computes
              emissions and the optimal vehicle plan for each.
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add trip
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No trips yet. Click <strong>Add trip</strong> to plan your season.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="text-right">Roster</TableHead>
                <TableHead>Chosen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {trip.name}
                    <span className="block text-xs text-muted-foreground">
                      vs {trip.opponent}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(trip.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {TRIP_TYPE_LABELS[trip.tripType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {trip.distanceMiles} mi
                  </TableCell>
                  <TableCell className="text-right">{trip.rosterSize}</TableCell>
                  <TableCell>
                    {trip.chosenVehicleType ? (
                      <Badge variant="outline">
                        {VEHICLE_SPECS[trip.chosenVehicleType].shortLabel}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(trip)}
                        aria-label="Edit trip"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(trip.id)}
                        disabled={deletingId === trip.id}
                        aria-label="Delete trip"
                      >
                        {deletingId === trip.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit trip" : "Add trip"}</DialogTitle>
            <DialogDescription>
              Enter trip details. EcoRoute uses these to model emissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            {errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <ul className="list-inside list-disc">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Trip name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Varsity Basketball @ Riverside"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent school</Label>
                <Input
                  id="opponent"
                  value={form.opponent}
                  onChange={(e) => set("opponent", e.target.value)}
                  placeholder="Riverside High"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripType">Trip type</Label>
                <select
                  id="tripType"
                  className={selectClass}
                  value={form.tripType}
                  onChange={(e) => set("tripType", e.target.value as TripType)}
                >
                  {TRIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TRIP_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure time</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={form.departureTime}
                  onChange={(e) => set("departureTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distanceMiles">Distance (mi, one way)</Label>
                <Input
                  id="distanceMiles"
                  type="number"
                  min={0}
                  value={form.distanceMiles || ""}
                  onChange={(e) => set("distanceMiles", Number(e.target.value))}
                  placeholder="24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rosterSize">Roster size</Label>
                <Input
                  id="rosterSize"
                  type="number"
                  min={0}
                  value={form.rosterSize || ""}
                  onChange={(e) => set("rosterSize", Number(e.target.value))}
                  placeholder="18"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available vehicles</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {VEHICLE_OPTIONS.map((opt) => {
                  const checked = form.allowedVehicles.includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => toggleVehicle(opt.value)}
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

            <div className="space-y-2">
              <Label htmlFor="chosen">Chosen plan (optional)</Label>
              <select
                id="chosen"
                className={selectClass}
                value={form.chosenVehicleType ?? ""}
                onChange={(e) =>
                  set(
                    "chosenVehicleType",
                    e.target.value
                      ? (e.target.value as VehicleType)
                      : undefined,
                  )
                }
              >
                <option value="">Use optimal (recommended)</option>
                {VEHICLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Optional notes for this trip"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingId ? (
                  "Save changes"
                ) : (
                  "Add trip"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
