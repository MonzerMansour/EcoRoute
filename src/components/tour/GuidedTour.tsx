"use client";

import {
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  title: string;
  description: string;
}

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

export function useTourStore(): TourContextValue {
  return useContext(TourContext);
}

export function TourProvider({
  children,
  steps,
  storageKey,
}: {
  children: React.ReactNode;
  steps: TourStep[];
  storageKey: string;
}) {
  const [tourOpen, setTourOpen] = useState(false);
  const [step, setStep] = useState(0);

  const openTour = useCallback(() => {
    setStep(0);
    setTourOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  const nextStep = useCallback(() => {
    setStep((s) => {
      if (s >= steps.length - 1) {
        setTourOpen(false);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, "true");
        }
        return 0;
      }
      return s + 1;
    });
  }, [steps.length, storageKey]);

  const prevStep = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <TourContext.Provider value={{ tourOpen, openTour, closeTour, step, nextStep, prevStep }}>
      {children}
      {tourOpen && <TourOverlay steps={steps} />}
      {/* Floating help button — bottom-right, never blocks nav */}
      <FloatingTourButton />
    </TourContext.Provider>
  );
}

function FloatingTourButton() {
  const { openTour } = useTourStore();
  return (
    <button
      onClick={openTour}
      aria-label="Open guided tour"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  );
}

function TourOverlay({ steps }: { steps: TourStep[] }) {
  const { closeTour, step, nextStep, prevStep } = useTourStore();
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    /* Backdrop — click outside to dismiss */
    <div className="fixed inset-0 z-50 flex items-end justify-end pb-24 pr-6 sm:items-center sm:justify-end sm:pb-0 sm:pr-8">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeTour}
        aria-hidden="true"
      />
      {/* Card — anchored to bottom-right so it never covers main content */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-card">
        <button
          onClick={closeTour}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {step + 1} of {steps.length}
        </p>
        <h2 className="text-lg font-bold">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {current.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
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
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-border"
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
