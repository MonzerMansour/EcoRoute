import { SavingsScenarios } from "@/student/components/SavingsScenarios";

export const metadata = {
  title: "CO₂ Savings",
};

export default function StudentSavingsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">CO₂ Savings</h1>
      <p className="mt-2 text-muted-foreground">
        See how much carbon your school community could save by carpooling more —
        for daily commutes and home games.
      </p>
      <div className="mt-8">
        <SavingsScenarios />
      </div>
    </>
  );
}
