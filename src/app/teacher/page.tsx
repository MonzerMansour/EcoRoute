import { TeacherDashboardPlaceholder } from "@/teacher/components/TeacherShell";

export const metadata = {
  title: "Teacher Dashboard",
};

export default function TeacherDashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-earth-900">Coach & Teacher Dashboard</h1>
      <p className="mt-2 text-earth-600">
        Plan sports trips, track away events, and get vehicle recommendations powered by the
        shared EcoRoute core.
      </p>
      <div className="mt-10">
        <TeacherDashboardPlaceholder />
      </div>
    </>
  );
}
