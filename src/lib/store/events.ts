"use client";
// Client-only module — localStorage persistence for activities and events.

export interface Activity {
  id: string;
  name: string;         // e.g. "Varsity Basketball"
  description?: string;
  coordinatorId: string; // email of coordinator who created it
  school: string;
  pin?: string;         // coordinator-set PIN; stripped before sending to students
}

export interface SchoolEvent {
  id: string;
  activityId: string;
  title: string;
  date: string;         // yyyy-mm-dd
  time?: string;        // HH:MM
  location?: string;
  distanceMiles?: number;
  rosterSize?: number;
  notes?: string;
  /** Vehicle the coordinator chose for this event e.g. "2× Van" */
  chosenVehicle?: string;
  /** CO2 kg for the chosen vehicle, round trip */
  chosenVehicleCo2Kg?: number;
  subscribedStudents: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "subscription";
  message: string;
  studentName: string;
  eventId: string;
  activityId: string;
  read: boolean;
  createdAt: string;
}

const ACTIVITIES_KEY = "ecoroute_activities";
const EVENTS_KEY = "ecoroute_events";
const NOTIFICATIONS_KEY = "ecoroute_notifications";

function uid() { return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`; }

export function loadActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) ?? "[]"); } catch { return []; }
}
export function saveActivities(data: Activity[]) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(data));
}

export function loadEvents(): SchoolEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]"); } catch { return []; }
}
export function saveEvents(data: SchoolEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(data));
}

export function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? "[]"); } catch { return []; }
}
export function saveNotifications(data: Notification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(data));
}

export function addActivity(data: Omit<Activity, "id">): Activity {
  const activities = loadActivities();
  const entry = { ...data, id: uid() };
  saveActivities([...activities, entry]);
  return entry;
}

export function deleteActivity(id: string) {
  saveActivities(loadActivities().filter(a => a.id !== id));
  saveEvents(loadEvents().filter(e => e.activityId !== id));
}

export function addEvent(data: Omit<SchoolEvent, "id" | "createdAt" | "subscribedStudents">): SchoolEvent {
  const events = loadEvents();
  const entry = { ...data, id: uid(), createdAt: new Date().toISOString(), subscribedStudents: [] };
  saveEvents([...events, entry]);
  return entry;
}

export function updateEvent(id: string, patch: Partial<SchoolEvent>) {
  saveEvents(loadEvents().map(e => e.id === id ? { ...e, ...patch } : e));
}

export function deleteEvent(id: string) {
  saveEvents(loadEvents().filter(e => e.id !== id));
}

export function subscribeToEvent(eventId: string, studentName: string): void {
  const events = loadEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return;
  if (!event.subscribedStudents.includes(studentName)) {
    updateEvent(eventId, { subscribedStudents: [...event.subscribedStudents, studentName] });
    // Add notification
    const notifications = loadNotifications();
    const notif: Notification = {
      id: uid(),
      type: "subscription",
      message: `${studentName} subscribed to "${event.title}"`,
      studentName,
      eventId,
      activityId: event.activityId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    saveNotifications([notif, ...notifications]);
  }
}

export function unsubscribeFromEvent(eventId: string, studentName: string): void {
  const events = loadEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return;
  updateEvent(eventId, { subscribedStudents: event.subscribedStudents.filter(s => s !== studentName) });
}
