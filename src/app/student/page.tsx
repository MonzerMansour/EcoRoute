import { StudentDashboard } from "@/student/components/StudentDashboard";

export const metadata = {
  title: "Student Dashboard",
};

export default function StudentDashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Student & Parent Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Map your commute, join neighborhood carpool clusters, and see your CO₂
        savings — all powered by EcoRoute&apos;s shared engine.
      </p>
      <div className="mt-10">
        <StudentDashboard />
      </div>
    </>
  );
}
