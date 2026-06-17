import { TeacherNav } from "@/teacher/components/TeacherShell";

export const metadata = {
  title: "Teacher Dashboard",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-earth-50">
      <TeacherNav />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
