"use client";

import { useState, useEffect } from "react";
import type { FleetEntry } from "./FleetManager";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, List, CalendarDays } from "lucide-react";
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

const TRIP_TYPES: TripType[] = [
  "away_game",
  "field_trip",
  "club",
  "scrimmage",
  "community_service",
  "conference",
  "tournament",
  "other",
];

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

function groupTripsByMonth(trips: Trip[]): { monthLabel: string; trips: Trip[] }[] {
  const map = new Map<string, Trip[]>();
  for (const trip of [...trips].sort((a, b) => a.date.localeCompare(b.date))) {
    const [year, month] = trip.date.split("-");
    const key = `${year}-${month}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(trip);
  }
  return Array.from(map.entries()).map(([key, trips]) => {
    const [year, month] = key.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      undefined,
      { month: "long", year: "numeric" }
    );
    return { monthLabel: label, trips };
  });
}

type ActivityTrip = Trip & { activityLabel: string };

export function TripManager({ initialTrips, activityTrips = [] }: { initialTrips: Trip[]; activityTrips?: ActivityTrip[] }) {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [fleet, setFleet] = useState<FleetEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ecoroute_fleet");
      if (raw) setFleet(JSON.parse(raw) as FleetEntry[]);
    } catch { /* ignore */ }
  }, []);

  function fleetMpgForType(type: VehicleType): number | undefined {
    const match = fleet.find((f) => f.type === type && f.mpg && f.fuelType !== "electric");
    return match?.mpg;
  }
  const [view, setView] = useState<"list" | "calendar">("list");
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

  const grouped = groupTripsByMonth(trips);
  const groupedActivity = groupTripsByMonth(activityTrips);
  const activityLabelMap = new Map(activityTrips.map((t) => [t.id, t.activityLabel]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Outside Trip Planner</CardTitle>
            <CardDescription>
              Add sports trips, field trips, conferences, and more. EcoRoute
              computes emissions and the optimal vehicle plan for each.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "px-3 py-1.5 text-xs flex items-center gap-1 transition-colors",
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={cn(
                  "px-3 py-1.5 text-xs flex items-center gap-1 transition-colors",
                  view === "calendar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
                aria-label="Calendar view"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </button>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add trip
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Manual trips ── */}
        {trips.length === 0 && activityTrips.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No trips yet. Click <strong>Add trip</strong> to plan your season, or add events to your activities.
          </p>
        ) : view === "list" ? (
          <>
            {trips.length > 0 && (
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
                        <span className="block text-xs text-muted-foreground">{trip.opponent}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(trip.date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{TRIP_TYPE_LABELS[trip.tripType]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{trip.distanceMiles} mi</TableCell>
                      <TableCell className="text-right">{trip.rosterSize}</TableCell>
                      <TableCell>
                        {trip.chosenVehicleType ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="outline">{VEHICLE_SPECS[trip.chosenVehicleType].shortLabel}</Badge>
                            {fleetMpgForType(trip.chosenVehicleType) && (
                              <span className="text-xs text-muted-foreground">{fleetMpgForType(trip.chosenVehicleType)} mpg</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(trip)} aria-label="Edit trip">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => remove(trip.id)} disabled={deletingId === trip.id} aria-label="Delete trip">
                            {deletingId === trip.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* ── Activity events as trips ── */}
            {activityTrips.length > 0 && (
              <div className="space-y-3">
                {trips.length > 0 && <div className="border-t" />}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  From Activities ({activityTrips.length})
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                      <TableHead className="text-right">Roster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">
                          {trip.name}
                          {trip.opponent && <span className="block text-xs text-muted-foreground">{trip.opponent}</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {activityLabelMap.get(trip.id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(trip.date)}</TableCell>
                        <TableCell className="text-right">{trip.distanceMiles} mi</TableCell>
                        <TableCell className="text-right">{trip.rosterSize || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground">Manage these events in the Activities tab.</p>
              </div>
            )}
          </>
        ) : (
          /* ── Calendar view ── */
          <div className="space-y-6">
            {grouped.map(({ monthLabel, trips: monthTrips }) => (
              <div key={monthLabel}>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{monthLabel}</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {monthTrips.map((trip) => (
                    <div key={trip.id} className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium leading-tight">{trip.name}</p>
                          <p className="text-xs text-muted-foreground">{trip.opponent}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(trip)} aria-label="Edit trip">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => remove(trip.id)} disabled={deletingId === trip.id} aria-label="Delete trip">
                            {deletingId === trip.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-destructive" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{formatDate(trip.date)}</span>
                        <Badge variant="secondary" className="text-xs py-0">{TRIP_TYPE_LABELS[trip.tripType]}</Badge>
                        <span className="text-xs text-muted-foreground">{trip.distanceMiles} mi</span>
                        {trip.chosenVehicleType && (
                          <Badge variant="outline" className="text-xs py-0">
                            {VEHICLE_SPECS[trip.chosenVehicleType].shortLabel}
                            {fleetMpgForType(trip.chosenVehicleType) && ` · ${fleetMpgForType(trip.chosenVehicleType)} mpg`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Activity trips in calendar view */}
            {activityTrips.length > 0 && (
              <>
                {trips.length > 0 && <div className="border-t pt-2" />}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  From Activities
                </p>
                {groupedActivity.map(({ monthLabel, trips: monthTrips }) => (
                  <div key={`act-${monthLabel}`}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{monthLabel}</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {monthTrips.map((trip) => (
                        <div key={trip.id} className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 flex flex-col gap-1">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs py-0">
                                {activityLabelMap.get(trip.id)}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium leading-tight">{trip.name}</p>
                            {trip.opponent && <p className="text-xs text-muted-foreground">{trip.opponent}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">{formatDate(trip.date)}</span>
                            <span className="text-xs text-muted-foreground">{trip.distanceMiles} mi</span>
                            {trip.rosterSize > 0 && (
                              <span className="text-xs text-muted-foreground">{trip.rosterSize} students</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
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
                <Label htmlFor="opponent">Opponent / Destination</Label>
                <Input
                  id="opponent"
                  value={form.opponent}
                  onChange={(e) => set("opponent", e.target.value)}
                  placeholder="e.g. Riverside High or City Museum"
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
