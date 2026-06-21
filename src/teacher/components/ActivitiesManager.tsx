"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Pencil, Trash2, Bell, ChevronDown, ChevronUp, Zap, UserCheck, UserX } from "lucide-react";
import type { RankedVehiclePlan } from "@/lib/types";
import { VehicleOptimizer } from "./VehicleOptimizer";
import { formatCo2 } from "@/core/emissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Activity, SchoolEvent, Notification } from "@/lib/store/events";
import type { JoinRequest } from "@/lib/store/join-requests";

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface ActivityFormState {
  name: string;
  description: string;
}

interface EventFormState {
  title: string;
  date: string;
  time: string;
  location: string;
  distanceMiles: string;
  rosterSize: string;
  notes: string;
  chosenVehicle: string;
  chosenVehicleCo2Kg: string;
}

const emptyActivityForm = (): ActivityFormState => ({ name: "", description: "" });
const emptyEventForm = (): EventFormState => ({
  title: "",
  date: "",
  time: "",
  location: "",
  distanceMiles: "",
  rosterSize: "",
  notes: "",
  chosenVehicle: "",
  chosenVehicleCo2Kg: "",
});

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function groupByMonth(events: SchoolEvent[]): Record<string, SchoolEvent[]> {
  const groups: Record<string, SchoolEvent[]> = {};
  for (const ev of events) {
    const key = ev.date.slice(0, 7); // yyyy-mm
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  }
  return groups;
}

export function ActivitiesManager() {
  const { data: session } = useSession();
  const coordinatorEmail = session?.user?.email ?? "";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);

  // Activity dialog
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(emptyActivityForm());

  // Event dialog
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm());

  // Notifications dialog
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);

  // Optimizer dialog — linked to a specific event
  const [optimizerEvent, setOptimizerEvent] = useState<SchoolEvent | null>(null);

  const refresh = useCallback(async () => {
    const [acts, evs, notifs] = await Promise.all([
      apiFetch("/api/events/activities"),
      apiFetch("/api/events/events"),
      apiFetch("/api/events/notifications"),
    ]);
    setActivities(acts);
    setEvents(evs);
    setNotifications(notifs);
  }, []);

  const refreshJoinRequests = useCallback(async () => {
    if (!coordinatorEmail) return;
    try {
      const data = await apiFetch(`/api/events/join-requests?coordinatorEmail=${encodeURIComponent(coordinatorEmail)}`);
      setJoinRequests(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, [coordinatorEmail]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { refreshJoinRequests(); }, [refreshJoinRequests]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) ?? null;
  const activityEvents = events.filter((e) => e.activityId === selectedActivityId);

  function subscriberCount(activityId: string): number {
    const evs = events.filter((e) => e.activityId === activityId);
    const names = new Set<string>();
    for (const ev of evs) ev.subscribedStudents.forEach((s) => names.add(s));
    return names.size;
  }

  // Activity CRUD
  function openAddActivity() {
    setEditingActivity(null);
    setActivityForm(emptyActivityForm());
    setActivityDialogOpen(true);
  }

  function openEditActivity(a: Activity) {
    setEditingActivity(a);
    setActivityForm({ name: a.name, description: a.description ?? "" });
    setActivityDialogOpen(true);
  }

  async function handleSaveActivity() {
    if (!activityForm.name.trim()) return;
    if (editingActivity) {
      await apiFetch(`/api/events/activities/${editingActivity.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: activityForm.name.trim(), description: activityForm.description.trim() }),
      });
    } else {
      await apiFetch("/api/events/activities", {
        method: "POST",
        body: JSON.stringify({
          name: activityForm.name.trim(),
          description: activityForm.description.trim() || undefined,
          coordinatorId: coordinatorEmail || "coordinator",
          school: "EcoRoute High",
        }),
      });
    }
    setActivityDialogOpen(false);
    refresh();
  }

  async function handleDeleteActivity(id: string) {
    await apiFetch(`/api/events/activities/${id}`, { method: "DELETE" });
    if (selectedActivityId === id) setSelectedActivityId(null);
    refresh();
  }

  // Event CRUD
  function openAddEvent() {
    setEditingEvent(null);
    setEventForm(emptyEventForm());
    setEventDialogOpen(true);
  }

  function openEditEvent(ev: SchoolEvent) {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title,
      date: ev.date,
      time: ev.time ?? "",
      location: ev.location ?? "",
      distanceMiles: ev.distanceMiles !== undefined ? String(ev.distanceMiles) : "",
      rosterSize: ev.rosterSize !== undefined ? String(ev.rosterSize) : "",
      notes: ev.notes ?? "",
      chosenVehicle: ev.chosenVehicle ?? "",
      chosenVehicleCo2Kg: ev.chosenVehicleCo2Kg !== undefined ? String(ev.chosenVehicleCo2Kg) : "",
    });
    setEventDialogOpen(true);
  }

  async function handleSaveEvent() {
    if (!eventForm.title.trim() || !eventForm.date || !selectedActivityId) return;
    const payload = {
      activityId: selectedActivityId,
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time || undefined,
      location: eventForm.location.trim() || undefined,
      distanceMiles: eventForm.distanceMiles ? Number(eventForm.distanceMiles) : undefined,
      rosterSize: eventForm.rosterSize ? Number(eventForm.rosterSize) : undefined,
      notes: eventForm.notes.trim() || undefined,
      chosenVehicle: eventForm.chosenVehicle.trim() || undefined,
      chosenVehicleCo2Kg: eventForm.chosenVehicleCo2Kg ? Number(eventForm.chosenVehicleCo2Kg) : undefined,
    };
    if (editingEvent) {
      await apiFetch(`/api/events/events/${editingEvent.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/api/events/events", { method: "POST", body: JSON.stringify(payload) });
    }
    setEventDialogOpen(false);
    refresh();
  }

  async function handleDeleteEvent(id: string) {
    await apiFetch(`/api/events/events/${id}`, { method: "DELETE" });
    refresh();
  }

  async function handleOptimizerPlan(plan: RankedVehiclePlan) {
    if (!optimizerEvent) return;
    await apiFetch(`/api/events/events/${optimizerEvent.id}`, {
      method: "PATCH",
      body: JSON.stringify({ chosenVehicle: plan.label, chosenVehicleCo2Kg: plan.co2Kg }),
    });
    setOptimizerEvent(null);
    refresh();
  }

  function handleViewNotifications() {
    setNotifDialogOpen(true);
  }

  async function handleMarkAllRead() {
    await apiFetch("/api/events/notifications", { method: "POST" });
    refresh();
  }

  async function handleJoinRequest(id: string, status: "approved" | "denied") {
    await apiFetch(`/api/events/join-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    refreshJoinRequests();
  }

  const pendingRequests = joinRequests.filter((r) => r.status === "pending");
  const pendingByActivity = (activityId: string) =>
    joinRequests.filter((r) => r.activityId === activityId && r.status === "pending");

  const monthGroups = groupByMonth(activityEvents);

  return (
    <div className="space-y-4">
      {/* Join requests banner */}
      {pendingRequests.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <UserCheck className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {pendingRequests.length} pending join request{pendingRequests.length !== 1 ? "s" : ""} from students
          </span>
          <Button size="sm" variant="outline" onClick={() => setShowJoinRequests(true)}>
            Review
          </Button>
        </div>
      )}

      {/* Notifications banner */}
      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <Bell className="h-4 w-4 shrink-0" />
          <span className="flex-1">{unreadCount} new subscription alert{unreadCount !== 1 ? "s" : ""}</span>
          <Button size="sm" variant="outline" onClick={handleViewNotifications}>
            View
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left panel — activities list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Activities</CardTitle>
              <Button size="sm" onClick={openAddActivity}>
                Add Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            {activities.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No activities yet. Add one to get started.
              </p>
            )}
            {activities.map((a) => (
              <div
                key={a.id}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedActivityId === a.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="min-w-0 flex-1"
                    onClick={() => setSelectedActivityId(a.id)}
                  >
                    <p className="truncate font-medium text-sm">{a.name}</p>
                    {a.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {a.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {subscriberCount(a.id)} subscriber{subscriberCount(a.id) !== 1 ? "s" : ""}
                      {pendingByActivity(a.id).length > 0 && (
                        <span className="ml-2 font-medium text-blue-700">
                          · {pendingByActivity(a.id).length} pending
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); openEditActivity(a); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDeleteActivity(a.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {selectedActivityId === a.id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full h-7 text-xs"
                    onClick={() => setSelectedActivityId(a.id)}
                  >
                    Manage Events
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right panel — events */}
        <div className="space-y-4">
          {!selectedActivity ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Select an activity to manage its events.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedActivity.name}</h2>
                <Button size="sm" onClick={openAddEvent}>
                  Add Event
                </Button>
              </div>

              {activityEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No events yet. Click &quot;Add Event&quot; to create one.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activityEvents
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev) => (
                      <Card key={ev.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{ev.title}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {ev.subscribedStudents.length} student{ev.subscribedStudents.length !== 1 ? "s" : ""} going
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {formatDate(ev.date)}
                                {ev.time && ` at ${ev.time}`}
                                {ev.location && ` · ${ev.location}`}
                              </p>
                              {ev.distanceMiles !== undefined && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {ev.distanceMiles} mi away
                                  {ev.rosterSize !== undefined && ` · ${ev.rosterSize} roster`}
                                  {ev.subscribedStudents.length > 0 && ` · ${ev.subscribedStudents.length} confirmed`}
                                </p>
                              )}
                              {ev.chosenVehicle ? (
                                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                                  <span className="text-sm">🚐</span>
                                  <span className="text-xs font-medium text-emerald-800">
                                    {ev.chosenVehicle}
                                    {ev.chosenVehicleCo2Kg !== undefined && (
                                      <span className="font-normal text-emerald-600"> · {formatCo2(ev.chosenVehicleCo2Kg)}</span>
                                    )}
                                  </span>
                                </div>
                              ) : ev.distanceMiles !== undefined && (
                                <button
                                  className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 px-2 py-0.5 text-xs text-primary hover:bg-primary/5"
                                  onClick={() => setOptimizerEvent(ev)}
                                >
                                  <Zap className="h-3 w-3" />
                                  Run Optimizer
                                </button>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              {ev.distanceMiles !== undefined && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-primary"
                                  title="Run optimizer for this event"
                                  onClick={() => setOptimizerEvent(ev)}
                                >
                                  <Zap className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => openEditEvent(ev)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteEvent(ev.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {activityEvents.length > 0 && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setShowCalendar((v) => !v)}
                  >
                    {showCalendar ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showCalendar ? "Hide" : "Show"} calendar view
                  </Button>
                  {showCalendar && (
                    <Card className="mt-2">
                      <CardContent className="p-4 space-y-4">
                        {Object.entries(monthGroups)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([month, evs]) => {
                            const [y, m] = month.split("-");
                            const label = new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
                            return (
                              <div key={month}>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  {label}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {evs
                                    .slice()
                                    .sort((a, b) => a.date.localeCompare(b.date))
                                    .map((ev) => (
                                      <div
                                        key={ev.id}
                                        className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs"
                                      >
                                        <span className="font-medium">{ev.date.slice(8)}</span>
                                        <span className="text-muted-foreground">{ev.title}</span>
                                      </div>
                                    ))}
                                </div>
                                <Separator className="mt-3" />
                              </div>
                            );
                          })}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="act-name">Activity name *</Label>
              <Input
                id="act-name"
                value={activityForm.name}
                onChange={(e) => setActivityForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Varsity Basketball"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-desc">Description (optional)</Label>
              <Textarea
                id="act-desc"
                value={activityForm.description}
                onChange={(e) => setActivityForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description…"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveActivity} disabled={!activityForm.name.trim()}>
                {editingActivity ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="ev-title">Title *</Label>
              <Input
                id="ev-title"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Away game @ Lincoln"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ev-date">Date *</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-time">Time</Label>
                <Input
                  id="ev-time"
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-loc">Location</Label>
              <Input
                id="ev-loc"
                value={eventForm.location}
                onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Lincoln High School Gym"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ev-dist">Distance (miles)</Label>
                <Input
                  id="ev-dist"
                  type="number"
                  min="0"
                  step="0.1"
                  value={eventForm.distanceMiles}
                  onChange={(e) => setEventForm((f) => ({ ...f, distanceMiles: e.target.value }))}
                  placeholder="e.g. 12.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-roster">
                  Roster size
                  {editingEvent && editingEvent.subscribedStudents.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-emerald-600">
                      ({editingEvent.subscribedStudents.length} subscribed)
                    </span>
                  )}
                </Label>
                <Input
                  id="ev-roster"
                  type="number"
                  min="1"
                  step="1"
                  value={eventForm.rosterSize}
                  onChange={(e) => setEventForm((f) => ({ ...f, rosterSize: e.target.value }))}
                  placeholder={
                    editingEvent && editingEvent.subscribedStudents.length > 0
                      ? `${editingEvent.subscribedStudents.length} subscribed`
                      : "e.g. 15"
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ev-vehicle">Chosen vehicle</Label>
                <Input
                  id="ev-vehicle"
                  value={eventForm.chosenVehicle}
                  onChange={(e) => setEventForm((f) => ({ ...f, chosenVehicle: e.target.value }))}
                  placeholder="e.g. 2× Van, School Bus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-co2">Vehicle CO₂ (kg, round trip)</Label>
                <Input
                  id="ev-co2"
                  type="number"
                  min="0"
                  step="0.1"
                  value={eventForm.chosenVehicleCo2Kg}
                  onChange={(e) => setEventForm((f) => ({ ...f, chosenVehicleCo2Kg: e.target.value }))}
                  placeholder="e.g. 28.8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-notes">Notes</Label>
              <Textarea
                id="ev-notes"
                value={eventForm.notes}
                onChange={(e) => setEventForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes…"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEvent}
                disabled={!eventForm.title.trim() || !eventForm.date}
              >
                {editingEvent ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Optimizer Dialog — linked to a specific event */}
      <Dialog open={!!optimizerEvent} onOpenChange={(open) => { if (!open) setOptimizerEvent(null); }}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Run Optimizer — {optimizerEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2 mb-2">
            Roster pre-filled from confirmed subscribers. Click a result to auto-apply vehicle to this event.
          </p>
          {optimizerEvent && (
            <VehicleOptimizer
              initialRoster={
                optimizerEvent.subscribedStudents.length > 0
                  ? optimizerEvent.subscribedStudents.length
                  : optimizerEvent.rosterSize
              }
              initialDistance={optimizerEvent.distanceMiles}
              onSelectPlan={handleOptimizerPlan}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Join Requests Dialog */}
      <Dialog open={showJoinRequests} onOpenChange={setShowJoinRequests}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Join Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-96 overflow-y-auto">
            {joinRequests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No join requests.</p>
            )}
            {joinRequests.map((r) => {
              const activity = activities.find((a) => a.id === r.activityId);
              return (
                <div
                  key={r.id}
                  className={`rounded-lg border p-3 text-sm ${
                    r.status === "pending"
                      ? "bg-blue-50 border-blue-200"
                      : r.status === "approved"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{r.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        wants to join <span className="font-medium text-foreground">{activity?.name ?? r.activityId}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {r.status === "pending" ? (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleJoinRequest(r.id, "approved")}
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive border-destructive/40"
                          onClick={() => handleJoinRequest(r.id, "denied")}
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" />
                          Deny
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant={r.status === "approved" ? "default" : "secondary"}
                        className={`text-xs ${r.status === "approved" ? "bg-emerald-600" : ""}`}
                      >
                        {r.status}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowJoinRequests(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscription Alerts</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-lg border p-3 text-sm ${n.read ? "bg-muted/30" : "bg-yellow-50 border-yellow-200"}`}
              >
                <p>{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
            <Button size="sm" onClick={() => setNotifDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
