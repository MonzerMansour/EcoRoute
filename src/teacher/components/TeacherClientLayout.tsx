"use client";

import { useEffect } from "react";
import { TourProvider, useTourStore } from "@/components/tour/GuidedTour";

const TEACHER_TOUR_KEY = "ecoroute_coordinator_tour_seen";

const TEACHER_STEPS = [
  {
    title: "Welcome to EcoRoute",
    description:
      "This dashboard shows your school's outside trip emissions at a glance. Let's walk you through the key features.",
  },
  {
    title: "Plan Outside Trips",
    description:
      "Go to Trips to log every outside trip — sports, field trips, conferences, tournaments, and more. EcoRoute calculates the CO₂ for each.",
  },
  {
    title: "Manage Activities",
    description:
      "In Activities, create the clubs and teams you oversee, add events, and see which students have subscribed.",
  },
  {
    title: "Optimize Vehicles",
    description:
      "The Optimizer finds the lowest-emission vehicle combination for any trip. Sometimes 3 carpools beat a bus.",
  },
  {
    title: "Smart Recommendations",
    description:
      "Recommendations shows your highest-impact changes ranked by CO₂ savings — no schedule changes needed.",
  },
  {
    title: "Vehicle Inventory",
    description:
      "Add your school's vehicles in Inventory so the optimizer knows exactly what you have available and can compute accurate emissions.",
  },
];

function AutoOpenTour() {
  const { openTour } = useTourStore();
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(TEACHER_TOUR_KEY)) {
      openTour();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function TeacherClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider steps={TEACHER_STEPS} storageKey={TEACHER_TOUR_KEY}>
      <AutoOpenTour />
      {children}
    </TourProvider>
  );
}
