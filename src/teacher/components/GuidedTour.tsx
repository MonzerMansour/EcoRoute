"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_STORAGE_KEY = "ecoroute_tour_seen";

const STEPS = [
  {
    title: "Welcome to EcoRoute",
    description:
      "This dashboard shows your school's outside trip emissions at a glance. Let's walk you through the key features.",
  },
  {
    title: "Plan Your Trips",
    description:
      "Go to Trips to log every outside trip — sports, field trips, conferences, and more. EcoRoute calculates the CO₂ for each.",
  },
  {
    title: "Optimize Vehicles",
    description:
      "The Optimizer finds the lowest-emission vehicle combination for any trip. Sometimes 3 carpools beat a bus.",
  },
  {
    title: "Smart Recommendations",
    description:
      "Recommendations shows your highest-impact changes, ranked by CO₂ savings. No schedule changes needed.",
  },
  {
    title: "Your Fleet",
    description:
      "Add your school's vehicles in Fleet so the optimizer knows exactly what you have available.",
  },
];

interface TourContextValue {
  tourOpen: boolean;
  openTour: () => void;
  closeTour: () => void;
  step: number;
  nextStep: () => void;
  prevStep: () => void;
}

const TourContext = createContext<TourContextValue>({
  tourOpen: false,
  openTour: () => {},
  closeTour: () => {},
  step: 0,
  nextStep: () => {},
  prevStep: () => {},
});

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [step, setStep] = useState(0);

  const openTour = useCallback(() => {
    setStep(0);
    setTourOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => {
      if (s >= STEPS.length - 1) {
        setTourOpen(false);
        if (typeof window !== "undefined") {
          localStorage.setItem(TOUR_STORAGE_KEY, "true");
        }
        return 0;
      }
      return s + 1;
    });
  }, []);

  const prevStep = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <TourContext.Provider value={{ tourOpen, openTour, closeTour, step, nextStep, prevStep }}>
      {children}
      {tourOpen && <TourOverlay />}
    </TourContext.Provider>
  );
}

export function useTourStore(): TourContextValue {
  return useContext(TourContext);
}

function TourOverlay() {
  const { tourOpen, closeTour, step, nextStep, prevStep } = useTourStore();

  if (!tourOpen) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeTour}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-card">
        <button
          onClick={closeTour}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-xl font-bold">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {current.description}
        </p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  i === step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <Button size="sm" onClick={nextStep}>
            {isLast ? "Done" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
