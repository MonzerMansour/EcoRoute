import { StudentDashboardPlaceholder } from "@/student/components/StudentShell";

export const metadata = {
  title: "Student Dashboard",
};

export default function StudentDashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Student & Parent Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Enter neighborhoods, set daily commute modes, and explore carpool clusters with CO₂
        savings estimates from the shared core.
      </p>
      <div className="mt-10">
        <StudentDashboardPlaceholder />
      </div>
    </>
  );
}
