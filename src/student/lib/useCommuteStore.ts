"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommuteEntry } from "@/student/lib/carpools";

const STORAGE_KEY = "ecoroute.commute.entries.v1";

const SEED_ENTRIES: CommuteEntry[] = [
  { id: "s1", studentName: "Alex", neighborhoodId: "oak", commuteMode: "solo_car", seatsAvailable: 3 },
  { id: "s2", studentName: "Jordan", neighborhoodId: "oak_n", commuteMode: "solo_car", seatsAvailable: 2 },
  { id: "s3", studentName: "Sam", neighborhoodId: "maple", commuteMode: "carpool", seatsAvailable: 0 },
  { id: "s4", studentName: "Riley", neighborhoodId: "maple_e", commuteMode: "solo_car", seatsAvailable: 4 },
  { id: "s5", studentName: "Casey", neighborhoodId: "river", commuteMode: "bus", seatsAvailable: 0 },
];

function load(): CommuteEntry[] {
  if (typeof window === "undefined") return SEED_ENTRIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ENTRIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CommuteEntry[]) : SEED_ENTRIES;
  } catch {
    return SEED_ENTRIES;
  }
}

/**
 * Shared, persistent (localStorage) commute-entry store for the student app.
 * Syncs across tabs/pages via the `storage` event so adding an entry on the
 * Commute page instantly updates Carpools and Savings.
 */
export function useCommuteStore() {
  const [entries, setEntries] = useState<CommuteEntry[]>(SEED_ENTRIES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(load());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEntries(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CommuteEntry[]) => {
    setEntries(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota / private-mode errors
    }
  }, []);

  const addEntry = useCallback(
    (entry: Omit<CommuteEntry, "id">) => {
      const next = [
        ...entries,
        { ...entry, id: `e${Date.now().toString(36)}` },
      ];
      persist(next);
    },
    [entries, persist],
  );

  const removeEntry = useCallback(
    (id: string) => persist(entries.filter((e) => e.id !== id)),
    [entries, persist],
  );

  const reset = useCallback(() => persist(SEED_ENTRIES), [persist]);

  return { entries, hydrated, addEntry, removeEntry, reset };
}
