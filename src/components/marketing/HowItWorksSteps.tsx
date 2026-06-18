import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksStepsProps {
  steps: Step[];
  accent?: "primary" | "secondary";
}

export function HowItWorksSteps({
  steps,
  accent = "primary",
}: HowItWorksStepsProps) {
  const accentClasses = {
    primary: {
      badge: "bg-primary text-primary-foreground",
      icon: "bg-primary/10 text-primary",
      line: "bg-primary/30",
    },
    secondary: {
      badge: "bg-secondary text-secondary-foreground",
      icon: "bg-secondary/10 text-secondary",
      line: "bg-secondary/30",
    },
  };

  const colors = accentClasses[accent];

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute left-6 top-0 hidden h-full w-0.5 md:left-1/2 md:block md:-translate-x-px",
          colors.line,
        )}
      />
      <div className="space-y-12">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={cn(
              "relative flex flex-col gap-6 md:flex-row md:items-center",
              index % 2 === 1 && "md:flex-row-reverse",
            )}
          >
            <div className="flex-1 md:text-right">
              <div
                className={cn(
                  "md:max-w-md",
                  index % 2 === 1 ? "md:ml-auto md:text-left" : "md:mr-auto",
                )}
              >
                <Badge className={cn("h-8 w-8 justify-center rounded-full p-0", colors.badge)}>
                  {step.number}
                </Badge>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </div>
            </div>

            <div
              className={cn(
                "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg md:absolute md:left-1/2 md:-translate-x-1/2",
                colors.icon,
              )}
            >
              <step.icon className="h-6 w-6" />
            </div>

            <div className="hidden flex-1 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
