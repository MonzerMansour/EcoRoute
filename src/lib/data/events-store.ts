import type { Activity, SchoolEvent, Notification } from "@/lib/store/events";

function uid() { return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`; }
function now() { return new Date().toISOString(); }

interface EventsStore {
  activities: Activity[];
  events: SchoolEvent[];
  notifications: Notification[];
}

const g = globalThis as unknown as { __ecoRouteEvents?: EventsStore };

function store(): EventsStore {
  if (!g.__ecoRouteEvents) {
    g.__ecoRouteEvents = { activities: [], events: [], notifications: [] };
  }
  return g.__ecoRouteEvents;
}

// ── Activities ──────────────────────────────────────────────────────────────

export function listActivities(): Activity[] {
  return [...store().activities];
}

export function createActivity(data: Omit<Activity, "id">): Activity {
  const entry: Activity = { ...data, id: uid() };
  store().activities.push(entry);
  return entry;
}

export function updateActivity(id: string, patch: Partial<Omit<Activity, "id">>): Activity | null {
  const s = store();
  const idx = s.activities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  s.activities[idx] = { ...s.activities[idx], ...patch };
  return s.activities[idx];
}

export function deleteActivity(id: string): void {
  const s = store();
  s.activities = s.activities.filter((a) => a.id !== id);
  s.events = s.events.filter((e) => e.activityId !== id);
}

// ── Events ──────────────────────────────────────────────────────────────────

export function listEvents(): SchoolEvent[] {
  return [...store().events];
}

export function listEventsForActivity(activityId: string): SchoolEvent[] {
  return store().events.filter((e) => e.activityId === activityId);
}

export function createEvent(data: Omit<SchoolEvent, "id" | "createdAt" | "subscribedStudents">): SchoolEvent {
  const entry: SchoolEvent = { ...data, id: uid(), createdAt: now(), subscribedStudents: [] };
  store().events.push(entry);
  return entry;
}

export function updateEvent(id: string, patch: Partial<SchoolEvent>): SchoolEvent | null {
  const s = store();
  const idx = s.events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  s.events[idx] = { ...s.events[idx], ...patch };
  return s.events[idx];
}

export function deleteEvent(id: string): void {
  const s = store();
  s.events = s.events.filter((e) => e.id !== id);
}

export function subscribeStudent(eventId: string, studentName: string): SchoolEvent | null {
  const ev = store().events.find((e) => e.id === eventId);
  if (!ev) return null;
  if (!ev.subscribedStudents.includes(studentName)) {
    ev.subscribedStudents = [...ev.subscribedStudents, studentName];
    // Add notification
    store().notifications.unshift({
      id: uid(),
      type: "subscription",
      message: `${studentName} subscribed to "${ev.title}"`,
      studentName,
      eventId,
      activityId: ev.activityId,
      read: false,
      createdAt: now(),
    });
  }
  return ev;
}

export function unsubscribeStudent(eventId: string, studentName: string): SchoolEvent | null {
  const ev = store().events.find((e) => e.id === eventId);
  if (!ev) return null;
  ev.subscribedStudents = ev.subscribedStudents.filter((s) => s !== studentName);
  return ev;
}

// ── Notifications ────────────────────────────────────────────────────────────

export function listNotifications(): Notification[] {
  return [...store().notifications];
}

export function markAllRead(): void {
  store().notifications.forEach((n) => { n.read = true; });
}
