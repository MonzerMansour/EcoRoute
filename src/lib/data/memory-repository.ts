import type { Trip, TripDraft, VehicleType } from "@/lib/types";
import type { TripRepository } from "@/lib/data/repository";

function uid(): string {
  return `trip_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

const DEFAULT_ALLOWED: VehicleType[] = [
  "school_bus",
  "minibus",
  "van",
  "carpool",
];

/** Sample season so every coach sees a populated dashboard on first login. */
function seedTrips(ownerId: string): Trip[] {
  const base = [
    {
      name: "Varsity Basketball @ Riverside",
      opponent: "Riverside High",
      date: "2026-01-14",
      distanceMiles: 8,
      rosterSize: 14,
      tripType: "away_game" as const,
      departureTime: "16:00",
      chosenVehicleType: "school_bus" as VehicleType,
    },
    {
      name: "Soccer @ Lakeside",
      opponent: "Lakeside Prep",
      date: "2026-01-22",
      distanceMiles: 28,
      rosterSize: 22,
      tripType: "away_game" as const,
      departureTime: "15:30",
      chosenVehicleType: "school_bus" as VehicleType,
    },
    {
      name: "Track Meet @ Mountain View",
      opponent: "Mountain View HS",
      date: "2026-02-03",
      distanceMiles: 64,
      rosterSize: 30,
      tripType: "away_game" as const,
      departureTime: "07:00",
      chosenVehicleType: "school_bus" as VehicleType,
    },
    {
      name: "Swim @ Northgate",
      opponent: "Northgate Academy",
      date: "2026-02-11",
      distanceMiles: 12,
      rosterSize: 10,
      tripType: "away_game" as const,
      departureTime: "16:15",
    },
    {
      name: "District Finals @ Central",
      opponent: "Central High",
      date: "2026-02-25",
      distanceMiles: 41,
      rosterSize: 18,
      tripType: "away_game" as const,
      departureTime: "14:00",
      chosenVehicleType: "van" as VehicleType,
    },
  ];

  return base.map((t) => ({
    id: uid(),
    ownerId,
    allowedVehicles: DEFAULT_ALLOWED,
    notes: "",
    createdAt: now(),
    updatedAt: now(),
    ...t,
  }));
}

interface Store {
  byOwner: Map<string, Trip[]>;
}

// Survive Next.js hot reloads / route module reloads in dev.
const globalForStore = globalThis as unknown as {
  __ecoRouteStore?: Store;
};

function store(): Store {
  if (!globalForStore.__ecoRouteStore) {
    globalForStore.__ecoRouteStore = { byOwner: new Map() };
  }
  return globalForStore.__ecoRouteStore;
}

function ownerTrips(ownerId: string): Trip[] {
  const s = store();
  if (!s.byOwner.has(ownerId)) {
    s.byOwner.set(ownerId, seedTrips(ownerId));
  }
  return s.byOwner.get(ownerId)!;
}

export class MemoryTripRepository implements TripRepository {
  async listTrips(ownerId: string): Promise<Trip[]> {
    return [...ownerTrips(ownerId)].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  async getTrip(ownerId: string, id: string): Promise<Trip | null> {
    return ownerTrips(ownerId).find((t) => t.id === id) ?? null;
  }

  async createTrip(ownerId: string, draft: TripDraft): Promise<Trip> {
    const trip: Trip = {
      id: uid(),
      ownerId,
      createdAt: now(),
      updatedAt: now(),
      ...draft,
    };
    ownerTrips(ownerId).push(trip);
    return trip;
  }

  async updateTrip(
    ownerId: string,
    id: string,
    draft: Partial<TripDraft>,
  ): Promise<Trip | null> {
    const trips = ownerTrips(ownerId);
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated: Trip = {
      ...trips[idx],
      ...draft,
      updatedAt: now(),
    };
    trips[idx] = updated;
    return updated;
  }

  async deleteTrip(ownerId: string, id: string): Promise<boolean> {
    const trips = ownerTrips(ownerId);
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    trips.splice(idx, 1);
    return true;
  }
}
