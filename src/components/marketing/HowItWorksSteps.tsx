import { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HowItWorksStepsProps {
  steps: Step[];
  accent?: "brand" | "teal";
}

export function HowItWorksSteps({
  steps,
  accent = "brand",
}: HowItWorksStepsProps) {
  const accentClasses = {
    brand: {
      badge: "bg-brand-600 text-white",
      icon: "bg-brand-50 text-brand-600",
      line: "bg-brand-200",
    },
    teal: {
      badge: "bg-teal-600 text-white",
      icon: "bg-teal-50 text-teal-600",
      line: "bg-teal-200",
    },
  };

  const colors = accentClasses[accent];

  return (
    <div className="relative">
      <div
        className={`absolute left-6 top-0 hidden h-full w-0.5 ${colors.line} md:left-1/2 md:block md:-translate-x-px`}
      />
      <div className="space-y-12">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="flex-1 md:text-right">
              <div
                className={`md:max-w-md ${
                  index % 2 === 1 ? "md:ml-auto md:text-left" : "md:mr-auto"
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${colors.badge}`}
                >
                  {step.number}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-earth-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-earth-600">{step.description}</p>
              </div>
            </div>

            <div
              className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors.icon} md:absolute md:left-1/2 md:-translate-x-1/2`}
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
