"use client";

import { useEffect } from "react";
import { useTourStore } from "@/teacher/components/GuidedTour";

const TOUR_STORAGE_KEY = "ecoroute_tour_seen";

export function TourAutoOpen() {
  const { openTour } = useTourStore();

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!seen) {
      openTour();
    }
  }, [openTour]);

  return null;
}
