"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  Search,
  Loader2,
  List,
  CalendarDays,
  Pencil,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { SchoolEvent, Activity } from "@/lib/store/events";
import { formatCo2 } from "@/core/emissions";
import { cn } from "@/lib/utils";

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const STUDENT_NAME_KEY = "ecoroute_student_name";
const MY_ACTIVITY_IDS_KEY = "ecoroute_my_activity_ids";
const STUDENT_NOTES_KEY = "ecoroute_student_event_notes";

function todayStr() { return new Date().toISOString().slice(0, 10); }

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function groupByMonth(evs: SchoolEvent[]): { monthLabel: string; events: SchoolEvent[] }[] {
  const map = new Map<string, SchoolEvent[]>();
  for (const ev of [...evs].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = ev.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  return Array.from(map.entries()).map(([key, events]) => {
    const [year, month] = key.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
      month: "long", year: "numeric",
    });
    return { monthLabel: label, events };
  });
}

interface StudentNotes { [eventId: string]: string }

export function StudentEvents() {
  const [studentName, setStudentName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [myActivityIds, setMyActivityIds] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Coordinator lookup
  const [coordEmail, setCoordEmail] = useState("");
  const [coordLookupState, setCoordLookupState] = useState<"idle" | "loading" | "done" | "none">("idle");
  const [coordResults, setCoordResults] = useState<Activity[]>([]);

  // PIN dialog for joining an event
  const [pinEvent, setPinEvent] = useState<SchoolEvent | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  // Edit event dialog (private notes + attendance)
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [editNote, setEditNote] = useState("");
  const [studentNotes, setStudentNotes] = useState<StudentNotes>({});

  const refresh = useCallback(async () => {
    const [evs, acts] = await Promise.all([
      apiFetch("/api/events/events"),
      apiFetch("/api/events/activities"),
    ]);
    setEvents(evs);
    setActivities(acts);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STUDENT_NAME_KEY) ?? "";
    setStudentName(saved);
    refresh();
    try {
      const ids = localStorage.getItem(MY_ACTIVITY_IDS_KEY);
      if (ids) setMyActivityIds(JSON.parse(ids));
      const notes = localStorage.getItem(STUDENT_NOTES_KEY);
      if (notes) setStudentNotes(JSON.parse(notes));
    } catch { /* ignore */ }
  }, [refresh]);

  function saveName() {
    if (!nameInput.trim()) return;
    localStorage.setItem(STUDENT_NAME_KEY, nameInput.trim());
    setStudentName(nameInput.trim());
  }

  function toggleActivity(id: string) {
    setMyActivityIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(MY_ACTIVITY_IDS_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function lookupCoordinator() {
    if (!coordEmail.trim()) return;
    setCoordLookupState("loading");
    setCoordResults([]);
    try {
      const actData = await apiFetch(`/api/events/activities?email=${encodeURIComponent(coordEmail.trim())}`);
      if (Array.isArray(actData) && actData.length > 0) {
        setCoordResults(actData);
        setCoordLookupState("done");
        setActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          return [...prev, ...actData.filter((a: Activity) => !existingIds.has(a.id))];
        });
        const evData = await apiFetch("/api/events/events");
        if (Array.isArray(evData)) setEvents(evData);
      } else {
        setCoordLookupState("none");
      }
    } catch {
      setCoordLookupState("none");
    }
  }

  async function handleJoin(ev: SchoolEvent, pin?: string) {
    const res = await fetch(`/api/events/events/${ev.id}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName, action: "subscribe", pin }),
    });
    if (res.ok) {
      setPinEvent(null);
      refresh();
      return;
    }
    if (res.status === 403) {
      // Activity requires a PIN — show dialog
      setPinEvent(ev);
      setPinInput("");
      setPinError("");
    }
  }

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    if (!pinEvent) return;
    setPinLoading(true);
    setPinError("");
    try {
      const res = await fetch(`/api/events/events/${pinEvent.id}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, action: "subscribe", pin: pinInput }),
      });
      if (res.ok) {
        setPinEvent(null);
        refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setPinError(data.error ?? "Incorrect PIN. Try again.");
      }
    } catch {
      setPinError("Network error. Try again.");
    } finally {
      setPinLoading(false);
    }
  }

  async function handleUnsubscribe(eventId: string) {
    await apiFetch(`/api/events/events/${eventId}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ studentName, action: "unsubscribe" }),
    });
    refresh();
  }

  function openEdit(ev: SchoolEvent) {
    setEditingEvent(ev);
    setEditNote(studentNotes[ev.id] ?? "");
  }

  function saveEdit() {
    if (!editingEvent) return;
    const updated = { ...studentNotes, [editingEvent.id]: editNote };
    setStudentNotes(updated);
    localStorage.setItem(STUDENT_NOTES_KEY, JSON.stringify(updated));
    setEditingEvent(null);
  }

  // Name prompt
  if (!studentName) {
    return (
      <Card className="max-w-sm">
        <CardHeader><CardTitle className="text-base">What should we call you?</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="student-name">Your name</Label>
            <Input
              id="student-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex"
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
            />
          </div>
          <Button onClick={saveName} disabled={!nameInput.trim()} className="w-full">Save</Button>
        </CardContent>
      </Card>
    );
  }

  const today = todayStr();
  const myActivities = activities.filter((a) => myActivityIds.includes(a.id));
  const myEvents = events.filter((ev) => myActivityIds.includes(ev.activityId));
  const activeActivity = myActivities.find((a) => a.id === selectedActivityId) ?? null;
  const activeEvents = selectedActivityId
    ? events.filter((ev) => ev.activityId === selectedActivityId)
    : myEvents;

  const upcoming = activeEvents.filter((ev) => ev.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = activeEvents.filter((ev) => ev.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const grouped = groupByMonth(activeEvents);

  function renderVehicleBadge(ev: SchoolEvent) {
    if (ev.chosenVehicle) {
      return (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1">
          <span className="text-sm">🚐</span>
          <span className="text-xs font-medium text-emerald-800">
            {ev.chosenVehicle}
            {ev.chosenVehicleCo2Kg !== undefined && (
              <span className="font-normal text-emerald-600"> — {formatCo2(ev.chosenVehicleCo2Kg)}</span>
            )}
          </span>
        </div>
      );
    }
    return <p className="mt-1.5 text-xs text-muted-foreground italic">Transportation not yet decided</p>;
  }

  function renderEventCard(ev: SchoolEvent) {
    const activity = activities.find((a) => a.id === ev.activityId);
    const isSubscribed = ev.subscribedStudents.includes(studentName);
    const myNote = studentNotes[ev.id];
    return (
      <Card key={ev.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {activity && !activeActivity && (
                <Badge variant="outline" className="mb-1 text-xs">{activity.name}</Badge>
              )}
              <p className="font-medium">{ev.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatDate(ev.date)}
                {ev.time && ` at ${ev.time}`}
                {ev.location && ` · ${ev.location}`}
              </p>
              {ev.distanceMiles !== undefined && (
                <p className="mt-0.5 text-xs text-muted-foreground">{ev.distanceMiles} miles away</p>
              )}
              {ev.notes && <p className="mt-0.5 text-xs text-muted-foreground">{ev.notes}</p>}
              {renderVehicleBadge(ev)}
              {myNote && (
                <p className="mt-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                  My note: {myNote}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ev)} aria-label="Edit my details">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {isSubscribed ? (
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleUnsubscribe(ev.id)}>Leave</Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50 text-xs"
                  onClick={() => handleJoin(ev)}
                >
                  Join
                </Button>
              )}
              {isSubscribed && <span className="text-xs text-green-600">✓ Going</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Find your coordinator</CardTitle>
          <CardDescription className="text-xs">
            Enter your coach or teacher&apos;s email to see their activities and events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="coach@school.edu"
              type="email"
              value={coordEmail}
              onChange={(e) => { setCoordEmail(e.target.value); setCoordLookupState("idle"); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupCoordinator())}
            />
            <Button variant="outline" onClick={lookupCoordinator} disabled={coordLookupState === "loading"}>
              {coordLookupState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {coordLookupState === "none" && (
            <p className="text-sm text-muted-foreground">No activities found for that email.</p>
          )}
          {coordLookupState === "done" && coordResults.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Activities found — check the ones you&apos;re in:</p>
              {coordResults.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{a.name}</span>
                  <Button size="sm" variant={myActivityIds.includes(a.id) ? "secondary" : "outline"} className="h-7 text-xs" onClick={() => toggleActivity(a.id)}>
                    {myActivityIds.includes(a.id) ? "Following ✓" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{studentName}</span>
          {myActivities.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              · {myActivities.length} activit{myActivities.length === 1 ? "y" : "ies"}
            </span>
          )}
        </p>
        {activeEvents.length > 0 && (
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "px-3 py-1.5 text-xs flex items-center gap-1 transition-colors",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "px-3 py-1.5 text-xs flex items-center gap-1 transition-colors",
                view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left panel — activities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">School Activities</CardTitle>
            <CardDescription className="text-xs">
              Check the ones you&apos;re part of to see their events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {activities.map((a) => {
              const isFollowing = myActivityIds.includes(a.id);
              const evCount = events.filter((e) => e.activityId === a.id).length;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-colors",
                    selectedActivityId === a.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedActivityId((prev) => prev === a.id ? null : a.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.name}</p>
                      {a.description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.description}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {evCount} event{evCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      className="shrink-0 mt-0.5"
                      onClick={(e) => { e.stopPropagation(); toggleActivity(a.id); }}
                      title={isFollowing ? "Unfollow" : "Follow"}
                    >
                      {isFollowing
                        ? <CheckCircle2 className="h-5 w-5 text-primary" />
                        : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Coordinator lookup */}
            <div className="space-y-2 pt-3 border-t mt-2">
              <p className="text-xs font-medium text-muted-foreground">Find coordinator by email</p>
              <div className="flex gap-2">
                <Input
                  placeholder="coach@school.edu"
                  type="email"
                  value={coordEmail}
                  onChange={(e) => { setCoordEmail(e.target.value); setCoordLookupState("idle"); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupCoordinator())}
                  className="text-xs h-8"
                />
                <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={lookupCoordinator} disabled={coordLookupState === "loading"}>
                  {coordLookupState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                </Button>
              </div>
              {coordLookupState === "none" && (
                <p className="text-xs text-muted-foreground">No activities found for that email.</p>
              )}
              {coordLookupState === "done" && coordResults.length > 0 && (
                <p className="text-xs text-green-700">{coordResults.length} activit{coordResults.length === 1 ? "y" : "ies"} added above.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right panel — events */}
        <div className="space-y-4">
          {activeActivity && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{activeActivity.name}</h2>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedActivityId(null)}>
                ← All my events
              </Button>
            </div>
          )}

          {!activeActivity && myActivityIds.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Check the circle next to an activity to follow it and see its events here.
              </CardContent>
            </Card>
          )}

          {(activeActivity || myActivityIds.length > 0) && activeEvents.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No events yet for {activeActivity ? activeActivity.name : "your activities"}.
              </CardContent>
            </Card>
          )}

          {(activeActivity || myActivityIds.length > 0) && activeEvents.length > 0 && (
            view === "list" ? (
              <>
                {upcoming.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h2>
                    {upcoming.map(renderEventCard)}
                  </div>
                )}
                {past.length > 0 && (
                  <div className="space-y-3">
                    {upcoming.length > 0 && <Separator />}
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past</h2>
                    {past.map(renderEventCard)}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {grouped.map(({ monthLabel, events: monthEvents }) => (
                  <div key={monthLabel}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{monthLabel}</h3>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {monthEvents.map((ev) => {
                        const activity = activities.find((a) => a.id === ev.activityId);
                        const isSubscribed = ev.subscribedStudents.includes(studentName);
                        const isPast = ev.date < today;
                        const myNote = studentNotes[ev.id];
                        return (
                          <div key={ev.id} className={cn("rounded-lg border bg-card p-3 flex flex-col gap-1.5", isPast && "opacity-60")}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {activity && !activeActivity && (
                                  <Badge variant="outline" className="mb-1 text-xs">{activity.name}</Badge>
                                )}
                                <p className="text-sm font-medium leading-tight">{ev.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(ev.date)}{ev.time && ` at ${ev.time}`}
                                </p>
                                {ev.location && <p className="text-xs text-muted-foreground">{ev.location}</p>}
                              </div>
                              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ev)} className="shrink-0">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            {ev.chosenVehicle ? (
                              <div className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 w-fit">
                                <span className="text-xs">🚐</span>
                                <span className="text-xs font-medium text-emerald-800">
                                  {ev.chosenVehicle}
                                  {ev.chosenVehicleCo2Kg !== undefined && (
                                    <span className="font-normal text-emerald-600"> — {formatCo2(ev.chosenVehicleCo2Kg)}</span>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">Transport TBD</p>
                            )}
                            {myNote && <p className="text-xs text-blue-700 truncate">Note: {myNote}</p>}
                            <div className="flex items-center gap-2 mt-auto pt-1">
                              {isSubscribed ? (
                                <>
                                  <span className="text-xs text-green-600 font-medium">✓ Going</span>
                                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2 ml-auto" onClick={() => handleUnsubscribe(ev.id)}>
                                    Leave
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2 border-green-500 text-green-700 hover:bg-green-50 ml-auto"
                                  onClick={() => handleJoin(ev)}
                                >
                                  Join
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* PIN dialog */}
      <Dialog open={!!pinEvent} onOpenChange={(open) => { if (!open) setPinEvent(null); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Enter Activity PIN
            </DialogTitle>
          </DialogHeader>
          {pinEvent && (
            <form onSubmit={submitPin} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the PIN your coordinator shared for <span className="font-medium text-foreground">{pinEvent.title}</span>.
              </p>
              <div className="space-y-2">
                <Label htmlFor="pin-input">PIN</Label>
                <Input
                  id="pin-input"
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
                  placeholder="Enter PIN…"
                  autoFocus
                  autoComplete="off"
                />
                {pinError && <p className="text-xs text-destructive">{pinError}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPinEvent(null)}>Cancel</Button>
                <Button type="submit" disabled={pinLoading || !pinInput.trim()}>
                  {pinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit event dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => { if (!open) setEditingEvent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Details — {editingEvent?.title}</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Date:</span> {formatDate(editingEvent.date)}{editingEvent.time && ` at ${editingEvent.time}`}</p>
                {editingEvent.location && <p><span className="text-muted-foreground">Location:</span> {editingEvent.location}</p>}
                {editingEvent.distanceMiles !== undefined && (
                  <p><span className="text-muted-foreground">Distance:</span> {editingEvent.distanceMiles} miles</p>
                )}
                {editingEvent.chosenVehicle ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span>🚐</span>
                    <span className="font-medium text-emerald-800">{editingEvent.chosenVehicle}</span>
                    {editingEvent.chosenVehicleCo2Kg !== undefined && (
                      <span className="text-emerald-600 text-xs">— {formatCo2(editingEvent.chosenVehicleCo2Kg)}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-xs">Transportation not yet decided</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Attendance:</span>
                {editingEvent.subscribedStudents.includes(studentName) ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">✓ Going</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { handleUnsubscribe(editingEvent.id); setEditingEvent(null); }}>
                      Leave
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs border-green-500 text-green-700" onClick={() => { setEditingEvent(null); handleJoin(editingEvent); }}>
                    Join
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="my-note" className="text-sm">My note (private)</Label>
                <Textarea
                  id="my-note"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="e.g. Need a ride, meeting at entrance, etc."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Only visible to you.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
