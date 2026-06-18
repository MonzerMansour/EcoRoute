import { StudentNav } from "@/student/components/StudentShell";

export const metadata = {
  title: "Student Dashboard",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <StudentNav />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
