import { CommuteMapper } from "@/student/components/CommuteMapper";
import { CommuteModeLegend } from "@/student/components/StudentShell";

export const metadata = {
  title: "Commute Mapper",
};

export default function StudentCommutePage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Daily Commute Mapper</h1>
      <p className="mt-2 text-muted-foreground">
        Students and parents enter their neighborhood and how they get to
        school. EcoRoute groups nearby families into carpool clusters and
        estimates the CO₂ they could save.
      </p>
      <CommuteModeLegend />
      <div className="mt-8">
        <CommuteMapper />
      </div>
    </>
  );
}
