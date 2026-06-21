"use client";

import { useEffect } from "react";
import { TourProvider, useTourStore } from "@/components/tour/GuidedTour";

const STUDENT_TOUR_KEY = "ecoroute_student_tour_seen";

const STUDENT_STEPS = [
  {
    title: "Welcome to EcoRoute",
    description:
      "This is your student dashboard. Here you can find carpool groups, track your commute emissions, and join school events.",
  },
  {
    title: "My Events",
    description:
      "Check Events to see activities your school has added — sports, clubs, field trips. Subscribe to the ones you're part of.",
  },
  {
    title: "Map Your Commute",
    description:
      "In Commute, enter your neighborhood or zip code and how you currently get to school. EcoRoute uses this to find carpool matches.",
  },
  {
    title: "Carpool Clusters",
    description:
      "Carpools uses AI to group you with nearby students. It knows your city's neighborhoods and finds the smartest groupings.",
  },
  {
    title: "See Your Savings",
    description:
      "Savings shows how much CO₂ you and your school could save if more students carpooled — at 30%, 50%, and 70% participation.",
  },
  {
    title: "Environmental Impact",
    description:
      "Impact breaks down your personal commute footprint, shows exactly how much carpooling would save you, and tracks school-wide progress.",
  },
];

function AutoOpenTour() {
  const { openTour } = useTourStore();
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STUDENT_TOUR_KEY)) {
      openTour();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function StudentClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider steps={STUDENT_STEPS} storageKey={STUDENT_TOUR_KEY}>
      <AutoOpenTour />
      {children}
    </TourProvider>
  );
}
